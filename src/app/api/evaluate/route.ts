import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";

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

interface EvaluationResult {
  score: number;
  missing_keywords: string[];
  reasoning: string;
  role_title: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobUrl, jobText, resumeText } = body;

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an expert recruiter and resume evaluator. Analyze how well this resume matches the given job description.

Return your evaluation as JSON with exactly this structure:
{
  "score": <number 0-100>,
  "role_title": "<the job title from the posting>",
  "missing_keywords": ["<skill or keyword from the job that's missing from the resume>", ...],
  "reasoning": "<2-3 paragraph explanation of the fit, covering strengths, gaps, and specific recommendations>"
}

Scoring guide:
- 90-100: Exceptional match — nearly all required and preferred qualifications met
- 75-89: Strong match — most required qualifications met, minor gaps
- 60-74: Moderate match — core qualifications met but notable gaps in required skills
- 40-59: Weak match — some relevant experience but significant gaps
- 0-39: Poor match — major misalignment between resume and role requirements

Focus on:
1. Hard skill alignment (technical skills, tools, certifications)
2. Experience level match (years, seniority, scope)
3. Industry/domain relevance
4. Keyword gaps that an ATS would flag

Be specific in your reasoning — reference actual content from both the resume and job description.

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
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const evaluation: EvaluationResult = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      evaluation,
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
