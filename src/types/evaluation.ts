export interface ScoreVector {
  name: string;
  score: number;
  explanation: string;
}

export interface EvaluationResult {
  overall_score: number;
  role_title: string;
  model_used: string;
  score_vectors: ScoreVector[];
  strengths: string[];
  possible_gaps: string[];
  areas_to_address: string[];
  missing_keywords: string[];
  reasoning: string;
}
