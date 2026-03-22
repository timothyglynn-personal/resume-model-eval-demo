import { EvaluationResult } from "./evaluation";

export interface StoredEvaluation {
  id: string;
  candidate_name: string;
  timestamp: string;
  role_title: string;
  job_description_snippet: string;
  model_used: string;
  evaluation: EvaluationResult;
}
