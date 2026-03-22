import { EvaluationResult } from "@/types/evaluation";
import { ScoreBadge } from "./ScoreBadge";
import { ScoreVectorChart } from "./ScoreVectorChart";
import { ImproveResumeButton } from "./ImproveResumeButton";
import { CoverLetterButton } from "./CoverLetterButton";

interface EvaluationResultsProps {
  result: EvaluationResult;
  resumeText: string;
  jobDescription: string;
}

export function EvaluationResults({
  result,
  resumeText,
  jobDescription,
}: EvaluationResultsProps) {
  return (
    <div className="mt-10 space-y-6">
      <div className="border-t pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Results</h2>
            {result.role_title && (
              <p className="text-gray-500 text-sm">{result.role_title}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {result.model_used}
          </span>
        </div>
      </div>

      {/* Overall score */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <ScoreBadge score={result.overall_score} />
      </div>

      {/* Score vectors */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Score Breakdown
        </h3>
        <ScoreVectorChart vectors={result.score_vectors} />
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-green-700 uppercase tracking-wide mb-3">
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible gaps */}
      {result.possible_gaps.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-3">
            Possible Gaps
          </h3>
          <ul className="space-y-2">
            {result.possible_gaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 shrink-0">~</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas to address */}
      {result.areas_to_address.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-blue-700 uppercase tracking-wide mb-3">
            Areas to Address in Application
          </h3>
          <ul className="space-y-2">
            {result.areas_to_address.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5 shrink-0">&rarr;</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing keywords */}
      {result.missing_keywords.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missing_keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full analysis */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Full Analysis
        </h3>
        <div className="prose prose-gray prose-sm max-w-none">
          {result.reasoning.split("\n").map((paragraph, i) =>
            paragraph.trim() ? <p key={i}>{paragraph}</p> : null
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Next Steps
        </h3>
        <div className="flex gap-3 flex-wrap">
          <ImproveResumeButton
            resumeText={resumeText}
            jobDescription={jobDescription}
            evaluation={result}
            model={result.model_used}
          />
          <CoverLetterButton
            resumeText={resumeText}
            jobDescription={jobDescription}
            evaluation={result}
            model={result.model_used}
          />
        </div>
      </div>
    </div>
  );
}
