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
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are a professional resume writer. Rewrite this resume to better match the target job description, using the evaluation feedback below.

RULES:
- Preserve the candidate's real experience—do not invent roles, companies, or accomplishments
- Insert missing keywords naturally where the candidate's experience supports them
- Strengthen weak bullet points by adding specificity: numbers, outcomes, scope
- Reorder sections or bullets to lead with the most relevant experience
- Keep roughly the same length as the original
- Use strong action verbs and concise language
- If the candidate lacks a required skill entirely, do NOT fabricate it—leave it out

Return your response as JSON with this structure:
{
  "improved_resume": "<the full rewritten resume text>",
  "changes_summary": ["<description of change 1>", "<description of change 2>", ...]
}

The changes_summary should list 4-8 specific changes you made and why.

---

EVALUATION FEEDBACK:
Possible gaps: ${JSON.stringify(evaluation?.possible_gaps || [])}
Areas to address: ${JSON.stringify(evaluation?.areas_to_address || [])}
Missing keywords: ${JSON.stringify(evaluation?.missing_keywords || [])}

---

JOB DESCRIPTION:
${jobDescription}

---

ORIGINAL RESUME:
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
    console.error("Improve error:", error);

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
