# Resume Model Evaluation Demo

## Overview

This project is a simple AI-powered tool that evaluates how well a resume matches a job listing.

The goal is to create a **public demonstration tool** that allows users to:

- Paste a job listing URL
- Upload or paste their resume
- Evaluate how well the resume matches the role
- Receive:
  - A fit score
  - Missing keywords
  - Reasoning

This project also serves as a **model evaluation platform** to compare how different large language models perform when evaluating candidate-job fit.

---

# Project Goals

## User Goals

Help job seekers:

- Understand how well their resume matches a role
- Identify missing skills or keywords
- Improve their resume for specific roles
- Generate tailored application materials

## Creator Goals

Demonstrate and evaluate AI model capabilities:

- Compare outputs across different models
- Measure evaluation consistency
- Explore tradeoffs in reasoning quality
- Understand ranking and scoring differences

---

# MVP Scope

The MVP focuses on a **simple working demonstration**.

A public webpage will allow a user to:

1. Paste a job listing URL
2. Paste their resume text
3. Click **Evaluate**
4. Receive:
   - Fit Score
   - Missing Keywords
   - Explanation

---

# Future Features

Planned improvements include:

### Resume Upload

Allow upload of:

- PDF
- DOCX

Automatically extract text.

---

### Resume Rewrite

Generate an improved resume version tailored to the role.

---

### Cover Letter Generation

Generate a tailored cover letter based on the job description.

---

### Model Comparison

Allow users to choose between:

- OpenAI models
- Anthropic Claude models
- Other LLM providers

Display differences in evaluation outputs.

---

### Candidate Memory

Track historical evaluations to allow pattern detection.

---

### Pattern Analysis

Identify recurring insights such as:

- Consistently missing skills
- Applying to overly senior roles
- Stronger matches in specific domains

---

# Tech Stack

Frontend + Backend


Next.js


Hosting


Vercel


LLM


OpenAI


Libraries


openai
axios
cheerio
pdf-parse
formidable


---

# Repository Setup Guide

This guide walks through building the MVP step by step.

---

# Step 1 — Install Node.js

Check if Node.js is installed:


node -v


If not installed, download the LTS version:

https://nodejs.org

---

# Step 2 — Clone the Repository

Clone the repository locally.


git clone https://github.com/timothyglynn-personal/resume-model-eval-demo.git


Enter the repository directory.


cd resume-model-eval-demo


---

# Step 3 — Create the Web App

Create a new Next.js application.


npx create-next-app@latest


Answer prompts exactly as follows:


Project name: resume-evaluator-app
Typescript: Yes
ESLint: Yes
Tailwind: Yes
src directory: Yes
App Router: Yes
Import alias: No


Enter the project directory:


cd resume-evaluator-app


Start the development server:


npm run dev


Open your browser:


http://localhost:3000


You should see the default Next.js page.

---

# Step 4 — Install Required Packages

Stop the server.

Install dependencies:


npm install openai axios cheerio pdf-parse formidable


Purpose of packages:

| Package | Purpose |
|------|------|
| openai | Call the OpenAI API |
| axios | Fetch job listing pages |
| cheerio | Parse and scrape HTML |
| pdf-parse | Parse resume PDFs |
| formidable | Handle file uploads |

---

# Step 5 — Create Environment Variables

Create a file in the root of the project:


.env.local


Add your OpenAI API key:


OPENAI_API_KEY=your_key_here


Create a key here:

https://platform.openai.com/api-keys

---

# Step 6 — Create the Evaluation API

Create a new API route:


src/app/api/evaluate/route.ts


Paste the following code:

```typescript
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import axios from "axios"
import cheerio from "cheerio"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { resumeText, jobUrl } = body

  const page = await axios.get(jobUrl)

  const $ = cheerio.load(page.data)

  const jobText = $("body").text().slice(0, 5000)

  const prompt = `
You are a recruiting assistant.

Evaluate how well this resume matches the job description.

Return JSON:

{
score: number 0-100,
missing_keywords: [],
reasoning: ""
}

JOB DESCRIPTION:
${jobText}

RESUME:
${resumeText}
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  })

  return NextResponse.json({
    result: response.choices[0].message.content
  })
}
Step 7 — Build the UI

Open:

src/app/page.tsx

Delete the default content.

Replace it with the following code:

"use client"

import { useState } from "react"

export default function Home() {
  const [jobUrl, setJobUrl] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [result, setResult] = useState("")

  async function handleSubmit() {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobUrl,
        resumeText
      })
    })

    const data = await res.json()

    setResult(data.result)
  }

  return (
    <div className="p-10 max-w-xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">
        AI Resume Fit Evaluator
      </h1>

      <input
        className="border p-2 w-full"
        placeholder="Paste Job URL"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
      />

      <textarea
        className="border p-2 w-full h-40"
        placeholder="Paste Resume Text"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2"
      >
        Evaluate
      </button>

      <pre className="border p-4 whitespace-pre-wrap">
        {result}
      </pre>

    </div>
  )
}
Step 8 — Run the Application

Start the development server.

npm run dev

Open:

http://localhost:3000

Test the application:

Paste a job listing URL

Paste resume text

Click Evaluate

The system should return a score and reasoning.

Step 9 — Push Code to GitHub

Add files:

git add .

Commit:

git commit -m "Initial MVP"

Push to GitHub:

git push
Step 10 — Deploy the Website

Create an account on:

https://vercel.com

Deploy the project:

Click New Project

Import your GitHub repository

Select:

resume-model-eval-demo

Add environment variable:

OPENAI_API_KEY

Deploy the project.

Vercel will generate a public URL like:

resume-model-eval-demo.vercel.app

Anyone can access the site.

What the MVP Includes

The MVP includes:

Public webpage

Job URL input

Resume text input

AI evaluation

Fit score output

Missing keyword suggestions

Explanation of reasoning

Next Development Steps

Planned improvements include:

Resume Upload

Allow users to upload PDF resumes.

Model Selector

Allow choosing between:

OpenAI models

Claude models

Resume Rewrite Button

Generate an improved resume tailored to the role.

Cover Letter Generation

Generate a tailored cover letter.

Candidate Memory

Store past evaluations for analysis.

Pattern Analysis

Identify trends in job applications and resume weaknesses.

Project Purpose

This project demonstrates:

AI product design

LLM prompt engineering

Model evaluation techniques

Resume-job matching automation

It is intended as a public AI product demonstration and portfolio project.


---

If you'd like, when you come back I can also give you **one more thing that will massively improve this project**:

- a **real evaluation framework** so you can actually compare models like a researcher (precision, ranking quality, consistency).

That will make this project look **10× more sophisticated in interviews.**
