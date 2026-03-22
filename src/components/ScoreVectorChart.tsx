import { ScoreVector } from "@/types/evaluation";

function barColor(score: number): string {
  if (score >= 16) return "bg-green-500";
  if (score >= 12) return "bg-emerald-500";
  if (score >= 8) return "bg-yellow-500";
  if (score >= 4) return "bg-orange-500";
  return "bg-red-500";
}

export function ScoreVectorChart({ vectors }: { vectors: ScoreVector[] }) {
  return (
    <div className="space-y-4">
      {vectors.map((v) => (
        <div key={v.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{v.name}</span>
            <span className="tabular-nums text-gray-500">{v.score}/20</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(v.score)}`}
              style={{ width: `${(v.score / 20) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{v.explanation}</p>
        </div>
      ))}
    </div>
  );
}
