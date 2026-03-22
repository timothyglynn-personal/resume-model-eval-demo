export interface ModelConfig {
  id: string;
  label: string;
  cost: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  { id: "claude-sonnet-4-20250514", label: "Sonnet", cost: "$" },
  { id: "claude-opus-4-20250514", label: "Opus", cost: "$$$" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku", cost: "$" },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

const MODEL_IDS = new Set(AVAILABLE_MODELS.map((m) => m.id));

export function validateModel(model: string | undefined): string {
  if (model && MODEL_IDS.has(model)) return model;
  return DEFAULT_MODEL;
}
