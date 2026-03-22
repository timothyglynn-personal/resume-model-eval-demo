"use client";

import { useState } from "react";
import { EvaluationResult } from "@/types/evaluation";
import { CopyButton } from "./CopyButton";

interface CoverLetterButtonProps {
  resumeText: string;
  jobDescription: string;
  evaluation: EvaluationResult;
  model?: string;
}

export function CoverLetterButton({
  resumeText,
  jobDescription,
  evaluation,
  model,
}: CoverLetterButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ cover_letter: string } | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, evaluation, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate cover letter"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!result && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-4">
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Cover Letter
              </h3>
              <CopyButton text={result.cover_letter} />
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {result.cover_letter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
