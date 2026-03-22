"use client";

import { useState } from "react";
import { StoredEvaluation } from "@/types/candidate";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreVectorChart } from "@/components/ScoreVectorChart";
import Link from "next/link";

interface TrendsAnalysis {
  total_evaluations: number;
  average_score: number;
  vector_averages: { name: string; average: number }[];
  recurring_strengths: string[];
  recurring_gaps: string[];
  best_fit_roles: { role: string; score: number }[];
}

interface TrendsData {
  candidate: string;
  evaluations: StoredEvaluation[];
  analysis: TrendsAnalysis | null;
}

export default function TrendsPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrendsData | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `/api/trends?name=${encodeURIComponent(name.trim())}`
      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load trends");

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }

  async function handleListCandidates() {
    setShowCandidates(true);
    try {
      const res = await fetch("/api/trends");
      const json = await res.json();
      setCandidates(json.candidates || []);
    } catch {
      setCandidates([]);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Candidate Trends
            </h1>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to evaluator
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Search by candidate name to view evaluation history, score trends,
            and recurring patterns.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter candidate name..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {!data && !loading && (
          <div className="text-center py-8">
            <button
              onClick={handleListCandidates}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              View all candidates
            </button>
            {showCandidates && (
              <div className="mt-4 space-y-2">
                {candidates.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No candidates stored yet
                  </p>
                ) : (
                  candidates.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setName(c);
                        setShowCandidates(false);
                      }}
                      className="block mx-auto text-sm text-blue-600 hover:text-blue-800"
                    >
                      {c}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && data.evaluations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No evaluations found for &quot;{data.candidate}&quot;
          </div>
        )}

        {data && data.analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{data.candidate}</h2>
                <span className="text-sm text-gray-500">
                  {data.analysis.total_evaluations} evaluation
                  {data.analysis.total_evaluations !== 1 ? "s" : ""}
                </span>
              </div>
              <ScoreBadge score={data.analysis.average_score} />
              <p className="text-xs text-gray-400 mt-2">Average score</p>
            </div>

            {/* Average vector scores */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Average Score Breakdown
              </h3>
              <ScoreVectorChart
                vectors={data.analysis.vector_averages.map((v) => ({
                  name: v.name,
                  score: v.average,
                  explanation: "",
                }))}
              />
            </div>

            {/* Best-fit roles */}
            {data.analysis.best_fit_roles.length > 0 && (
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Best-fit Roles
                </h3>
                <ul className="space-y-2">
                  {data.analysis.best_fit_roles.map((r, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>{r.role}</span>
                      <span className="tabular-nums font-medium">
                        {r.score}/100
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recurring strengths */}
            {data.analysis.recurring_strengths.length > 0 && (
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-medium text-green-700 uppercase tracking-wide mb-3">
                  Recurring Strengths
                </h3>
                <ul className="space-y-2">
                  {data.analysis.recurring_strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-green-500 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recurring gaps */}
            {data.analysis.recurring_gaps.length > 0 && (
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-3">
                  Recurring Gaps
                </h3>
                <ul className="space-y-2">
                  {data.analysis.recurring_gaps.map((g, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 shrink-0">~</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evaluation history */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Evaluation History
              </h3>
              <div className="space-y-3">
                {data.evaluations.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {e.role_title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(e.timestamp).toLocaleDateString()} &middot;{" "}
                        {e.model_used}
                      </p>
                    </div>
                    <span className="text-lg font-bold tabular-nums">
                      {e.evaluation.overall_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t text-center text-sm text-gray-400">
          Powered by Claude (Anthropic)
        </footer>
      </div>
    </div>
  );
}
