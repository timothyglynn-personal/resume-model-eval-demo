import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";
import { EvaluationResult } from "@/types/evaluation";
import { validateModel } from "@/lib/models";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function scrapeJobPage(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    // Remove non-content elements
    $(
      "script, style, nav, footer, header, iframe, noscript, svg, img"
    ).remove();

    // Try common job description selectors
    const selectors = [
      '[class*="description"]',
      '[class*="job-details"]',
      '[class*="posting"]',
      '[class*="content"]',
      "article",
      "main",
      '[role="main"]',
    ];

    for (const selector of selectors) {
      const el = $(selector);
      if (el.length > 0) {
        const text = el.text().replace(/\s+/g, " ").trim();
        if (text.length > 200) {
          return text.slice(0, 10000);
        }
      }
    }

    // Fallback: get all body text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    return bodyText.slice(0, 10000);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch job page: ${error.message}. Try pasting the job description text directly.`
      );
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobUrl, jobText, resumeText, model } = body;

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (!jobUrl?.trim() && !jobText?.trim()) {
      return NextResponse.json(
        { error: "Either a job URL or job description text is required" },
        { status: 400 }
      );
    }

    // Get job description
    let jobDescription: string;
    if (jobText?.trim()) {
      jobDescription = jobText.trim();
    } else {
      jobDescription = await scrapeJobPage(jobUrl.trim());
    }

    if (jobDescription.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough content from the job page. Try pasting the job description text directly.",
        },
        { status: 400 }
      );
    }

    const selectedModel = validateModel(model);

    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `You are a senior hiring manager evaluating a resume against a job description. Be direct, specific, and honest—not encouraging. Your job is to tell this candidate exactly where they stand and what they need to fix.

Score the resume against these 5 vectors. Each vector is scored 0-20, and the sum is the overall score (0-100):

1. **Skill Match** — Does the resume demonstrate the specific hard skills, tools, technologies, and certifications the role requires?
2. **Trajectory** — Does the candidate's career progression suggest they're ready for this level? Are they trending toward this role or lateral/backwards?
3. **Relevance of Experience** — How directly applicable is their past work to what this role actually does day-to-day?
4. **Execution and Results** — Does the resume show measurable impact, shipped work, and outcomes—or just responsibilities?
5. **Thinking and Communication** — Based on how the resume is written, does this person communicate clearly and show strategic thinking?

Return your evaluation as JSON with exactly this structure:
{
  "overall_score": <sum of 5 vector scores, 0-100>,
  "role_title": "<the job title from the posting>",
  "model_used": "${selectedModel}",
  "score_vectors": [
    { "name": "Skill Match", "score": <0-20>, "explanation": "<1-2 sentences>" },
    { "name": "Trajectory", "score": <0-20>, "explanation": "<1-2 sentences>" },
    { "name": "Relevance of Experience", "score": <0-20>, "explanation": "<1-2 sentences>" },
    { "name": "Execution and Results", "score": <0-20>, "explanation": "<1-2 sentences>" },
    { "name": "Thinking and Communication", "score": <0-20>, "explanation": "<1-2 sentences>" }
  ],
  "strengths": ["<specific strength referencing resume content>", "<another>", "<another>"],
  "possible_gaps": ["<specific gap with why it matters for this role>", "<another>", "<another>"],
  "areas_to_address": ["<what the candidate should do in their application to compensate>", "<another>"],
  "missing_keywords": ["<skill or keyword from the job missing from the resume>"],
  "reasoning": "<3-4 paragraph honest assessment. Reference specific content from both documents. Explain why this candidate would or would not advance past screening. If the score is below 75, say clearly what's missing. If above 85, explain what makes them stand out. No generic encouragement.>"
}

Rules:
- Be specific. Reference actual job requirements and actual resume content by name.
- If the resume uses vague language ("managed projects", "drove results"), penalize Execution and Results.
- If the resume doesn't mention key required skills, penalize Skill Match—don't assume they have unlisted skills.
- The overall_score MUST equal the sum of the 5 vector scores.
- Strengths, gaps, and areas_to_address should each have 2-4 items.
- Missing keywords should list 5-15 specific terms from the job description not found in the resume.

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

    // Parse JSON from response, handling possible markdown wrapping
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const evaluation: EvaluationResult = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      evaluation,
      jobDescription,
      jobDescriptionLength: jobDescription.length,
    });
  } catch (error) {
    console.error("Evaluation error:", error);

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
