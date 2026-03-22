import { NextRequest, NextResponse } from "next/server";
import {
  getEvaluations,
  listCandidates,
} from "@/lib/candidate-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (name) {
      const evaluations = await getEvaluations(name);

      if (evaluations.length === 0) {
        return NextResponse.json({
          candidate: name,
          evaluations: [],
          analysis: null,
        });
      }

      // Compute analysis from history
      const scores = evaluations.map((e) => e.evaluation.overall_score);
      const avgScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );

      // Average per vector
      const vectorNames = evaluations[0].evaluation.score_vectors.map(
        (v) => v.name
      );
      const vectorAverages = vectorNames.map((name) => {
        const vectorScores = evaluations
          .map(
            (e) =>
              e.evaluation.score_vectors.find((v) => v.name === name)?.score ||
              0
          );
        return {
          name,
          average: Math.round(
            vectorScores.reduce((a, b) => a + b, 0) / vectorScores.length
          ),
        };
      });

      // Find recurring strengths and gaps (appear in 2+ evaluations)
      const strengthCounts = new Map<string, number>();
      const gapCounts = new Map<string, number>();
      for (const e of evaluations) {
        for (const s of e.evaluation.strengths) {
          strengthCounts.set(s, (strengthCounts.get(s) || 0) + 1);
        }
        for (const g of e.evaluation.possible_gaps) {
          gapCounts.set(g, (gapCounts.get(g) || 0) + 1);
        }
      }

      const recurringStrengths = Array.from(strengthCounts.entries())
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([s]) => s);

      const recurringGaps = Array.from(gapCounts.entries())
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([g]) => g);

      // Best-fit roles (highest scored)
      const bestFitRoles = evaluations
        .sort((a, b) => b.evaluation.overall_score - a.evaluation.overall_score)
        .slice(0, 3)
        .map((e) => ({
          role: e.role_title,
          score: e.evaluation.overall_score,
        }));

      return NextResponse.json({
        candidate: name,
        evaluations: evaluations.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        analysis: {
          total_evaluations: evaluations.length,
          average_score: avgScore,
          vector_averages: vectorAverages,
          recurring_strengths: recurringStrengths,
          recurring_gaps: recurringGaps,
          best_fit_roles: bestFitRoles,
        },
      });
    }

    // No name provided — list all candidates
    const candidates = await listCandidates();
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Trends error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
