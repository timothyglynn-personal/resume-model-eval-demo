PRD Version: v1
Last Updated: March 2026
Owner: Timothy Glynn

# AI Resume Fit Evaluator

## Overview

The AI Resume Fit Evaluator is a lightweight web application that helps job seekers understand how well their resume matches a specific job posting.

The product also serves as a demonstration tool for comparing AI model evaluation quality across different models (e.g., OpenAI, Anthropic).

The system allows users to submit a job description and their resume, then evaluates their fit using selectable AI models. The tool returns a match score, missing keywords, and suggested improvements.

The product is intentionally designed as both:

1. A useful job search assistant
2. A model evaluation demonstration platform

---

# Goals

### User Goals

Help candidates:

* understand how well their resume matches a role
* identify missing keywords or skills
* quickly generate improved resume drafts
* draft a tailored cover letter

### Creator Goals

Allow the creator to:

* compare different LLM outputs
* observe model quality differences
* evaluate model performance using metrics such as:

  * ranking consistency
  * precision of keyword extraction
  * evaluation reasoning quality

---

# MVP Features

## 1 Job Listing Input

User pastes a URL from:

* LinkedIn job posting
* company careers page

The system extracts:

* role title
* job description
* required skills
* preferred qualifications

---

## 2 Resume Upload

User uploads:

* PDF
* DOCX

The system extracts resume text.

---

## 3 Model Selection

User chooses evaluation model.

Example options:

* GPT-4o
* Claude Sonnet
* Claude Opus

---

## 4 Fit Evaluation Output

The system returns:

### Fit Score

Example:

```
Fit Score: 72 / 100
```

Based on:

* skill alignment
* experience match
* keyword overlap

---

### Missing Keywords

Example output:

* payments infrastructure
* risk modeling
* SQL analytics
* platform product management

---

### Explanation

Short explanation describing the reasoning.

---

## 5 Resume Improvement Button

Button: **Improve My Resume**

System:

1. rewrites the resume
2. preserves one-page format
3. inserts relevant keywords
4. improves phrasing

Outputs downloadable document.

---

## 6 Cover Letter Generation

Button: **Generate Cover Letter**

Produces a tailored cover letter referencing:

* company
* role
* resume experience

---

# Advanced Features (Post MVP)

### Candidate Memory

The system stores previous evaluations.

This allows pattern analysis.

---

### Pattern Analysis

Example insights:

* applying to roles requiring 8+ years experience
* missing SQL/data skills across multiple roles
* strongest matches appear in product operations roles

---

### Evaluation Framework

The creator can compare model outputs.

Metrics:

* keyword extraction precision
* scoring consistency
* explanation quality
* ranking agreement

---

# Success Criteria

Within 2 weeks the product should:

* run as a public web demo
* support at least two models
* generate a fit score
* suggest resume improvements
* generate cover letters

---

# Risks

* job page scraping failures
* resume parsing complexity
* prompt reliability across models

---

# Non Goals (MVP)

* perfect resume rewriting
* production-grade ATS parsing
* full analytics platform

The goal is demonstration quality.
