"use client";

import { useState, useRef } from "react";
import { EvaluationResult } from "@/types/evaluation";
import { EvaluationResults } from "@/components/EvaluationResults";

export default function Home() {
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResumeText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setFileName("");
    } finally {
      setUploading(false);
    }
  }

  async function handleEvaluate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobUrl: inputMode === "url" ? jobUrl : "",
          jobText: inputMode === "text" ? jobText : "",
          resumeText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed");
      }

      setResult(data.evaluation);
      setJobDescription(data.jobDescription || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    resumeText.trim() &&
    ((inputMode === "url" && jobUrl.trim()) ||
      (inputMode === "text" && jobText.trim()));

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Resume Fit Evaluator
          </h1>
          <p className="mt-2 text-gray-600">
            Paste a job posting and your resume to get an AI-powered fit
            evaluation with score vectors, gap analysis, and actionable
            recommendations.
          </p>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-6">
          {/* Job Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <div className="flex gap-1 text-sm">
                <button
                  type="button"
                  onClick={() => setInputMode("url")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === "url"
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === "text"
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {inputMode === "url" ? (
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            ) : (
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-y"
              />
            )}
          </div>

          {/* Resume Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Resume
            </label>

            {/* File upload */}
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Upload PDF, DOCX, or TXT"
                )}
              </button>
              {fileName && (
                <span className="ml-3 text-sm text-gray-500">{fileName}</span>
              )}
            </div>

            {/* Text area */}
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Or paste your resume text here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-y"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-3 px-6 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Evaluating...
              </span>
            ) : (
              "Evaluate Fit"
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <EvaluationResults
            result={result}
            resumeText={resumeText}
            jobDescription={jobDescription}
          />
        )}

        <footer className="mt-16 pt-8 border-t text-center text-sm text-gray-400">
          Powered by Claude (Anthropic) &middot; Resume data is not stored
        </footer>
      </div>
    </div>
  );
}
