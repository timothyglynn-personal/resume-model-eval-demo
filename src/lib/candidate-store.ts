import { StoredEvaluation } from "@/types/candidate";

// In-memory fallback for local dev when KV env vars aren't set
const localStore = new Map<string, StoredEvaluation[]>();

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

function normalizeKey(name: string): string {
  return `candidate:${name.toLowerCase().trim().replace(/\s+/g, "-")}`;
}

export async function saveEvaluation(
  evaluation: StoredEvaluation
): Promise<void> {
  const key = normalizeKey(evaluation.candidate_name);

  if (useKV()) {
    const kv = await getKV();
    const existing = (await kv.get<StoredEvaluation[]>(key)) || [];
    existing.push(evaluation);
    await kv.set(key, existing);

    // Maintain a set of all candidate names
    await kv.sadd("candidates", evaluation.candidate_name.trim());
  } else {
    const existing = localStore.get(key) || [];
    existing.push(evaluation);
    localStore.set(key, existing);
  }
}

export async function getEvaluations(
  name: string
): Promise<StoredEvaluation[]> {
  const key = normalizeKey(name);

  if (useKV()) {
    const kv = await getKV();
    return (await kv.get<StoredEvaluation[]>(key)) || [];
  } else {
    return localStore.get(key) || [];
  }
}

export async function listCandidates(): Promise<string[]> {
  if (useKV()) {
    const kv = await getKV();
    return (await kv.smembers("candidates")) || [];
  } else {
    const names = new Set<string>();
    for (const evals of localStore.values()) {
      for (const e of evals) {
        names.add(e.candidate_name);
      }
    }
    return Array.from(names);
  }
}
