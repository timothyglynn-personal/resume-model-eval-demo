export function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-100 text-red-800";
  let label = "Poor Match";
  if (score >= 90) {
    color = "bg-green-100 text-green-800";
    label = "Exceptional Match";
  } else if (score >= 75) {
    color = "bg-emerald-100 text-emerald-800";
    label = "Strong Match";
  } else if (score >= 60) {
    color = "bg-yellow-100 text-yellow-800";
    label = "Moderate Match";
  } else if (score >= 40) {
    color = "bg-orange-100 text-orange-800";
    label = "Weak Match";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-5xl font-bold tabular-nums">{score}</div>
      <div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
        >
          {label}
        </span>
        <div className="text-sm text-gray-500 mt-1">out of 100</div>
      </div>
    </div>
  );
}
