"use client";

import { useState } from "react";
import { EvaluationResult } from "@/types/evaluation";
import { CopyButton } from "./CopyButton";

interface ImproveResumeButtonProps {
  resumeText: string;
  jobDescription: string;
  evaluation: EvaluationResult;
  model?: string;
}

export function ImproveResumeButton({
  resumeText,
  jobDescription,
  evaluation,
  model,
}: ImproveResumeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    improved_resume: string;
    changes_summary: string[];
  } | null>(null);
  const [error, setError] = useState("");

  async function handleImprove() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, evaluation, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to improve resume");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve resume");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!result && (
        <button
          onClick={handleImprove}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Improving..." : "Improve Resume"}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Changes Made
              </h3>
            </div>
            <ul className="space-y-1">
              {result.changes_summary.map((change, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-blue-500 shrink-0">&bull;</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Improved Resume
              </h3>
              <CopyButton text={result.improved_resume} />
            </div>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {result.improved_resume}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
