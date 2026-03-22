import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateModel } from "@/lib/models";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, evaluation, model } = body;

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const selectedModel = validateModel(model);

    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Write a tailored cover letter for this candidate applying to this role. Use the evaluation feedback to guide emphasis.

RULES:
- 3-4 paragraphs, under 400 words total
- Reference the specific company and role title from the job description
- Map the candidate's strongest experiences directly to the role's top requirements
- Proactively address 1-2 gaps from the evaluation—frame them as growth areas or transferable strengths, not weaknesses
- No generic filler ("I am writing to express my interest in..."). Open with something specific about the company or role.
- Close with a concrete next step, not a passive "I look forward to hearing from you"
- Professional but human tone—not robotic

Return your response as JSON with this structure:
{
  "cover_letter": "<the full cover letter text>"
}

---

EVALUATION FEEDBACK:
Strengths: ${JSON.stringify(evaluation?.strengths || [])}
Possible gaps: ${JSON.stringify(evaluation?.possible_gaps || [])}
Role title: ${evaluation?.role_title || "the role"}

---

JOB DESCRIPTION:
${jobDescription}

---

RESUME:
${resumeText}

---

Return ONLY the JSON object, no markdown formatting or code blocks.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cover letter error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
