import { Craft } from "@/lib/types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function uniqueTokens(value: string): Set<string> {
  return new Set(tokenize(value));
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }

  return (2 * overlap) / (a.size + b.size);
}

function craftCorpus(craft: Craft): string {
  return [
    craft.name,
    craft.state,
    craft.category,
    craft.material,
    craft.technique,
    craft.summary,
    craft.history,
    craft.artisan,
  ].join(" ");
}

export function searchCrafts(query: string, crafts: Craft[], limit = 50): (Craft & { similarity: number })[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const querySet = new Set(tokens);

  const ranked = crafts
    .map((craft) => {
      const corpusSet = uniqueTokens(craftCorpus(craft));
      const similarity = overlapRatio(querySet, corpusSet);
      return { ...craft, similarity };
    })
    .filter((craft) => craft.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);

  return ranked.slice(0, limit);
}

export function findBestDuplicate(
  candidate: Pick<Craft, "name" | "state" | "summary" | "category" | "material" | "technique">,
  existing: Craft[]
): { similarity: number; match: Pick<Craft, "name" | "state"> | null } {
  const candidateText = [
    candidate.name,
    candidate.state,
    candidate.category,
    candidate.material,
    candidate.technique,
    candidate.summary,
  ].join(" ");

  const candidateSet = uniqueTokens(candidateText);
  let bestScore = 0;
  let bestMatch: Pick<Craft, "name" | "state"> | null = null;

  for (const craft of existing) {
    const score = overlapRatio(candidateSet, uniqueTokens(craftCorpus(craft)));
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { name: craft.name, state: craft.state };
    }
  }

  return { similarity: bestScore, match: bestMatch };
}
