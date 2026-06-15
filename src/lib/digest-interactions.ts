export type DigestInteractions = {
  todos: Record<string, boolean>;
  reading: Record<string, boolean>;
  keyPoints: Record<string, boolean>;
};

export const DIGEST_INTERACTIONS_KEY = "later.digest-interactions.v1";

function storageKey(userId: string, artifactId: string) {
  return `${DIGEST_INTERACTIONS_KEY}.${userId}.${artifactId}`;
}

const emptyInteractions = (): DigestInteractions => ({
  todos: {},
  reading: {},
  keyPoints: {},
});

export function readDigestInteractions(userId: string, artifactId: string): DigestInteractions {
  if (typeof window === "undefined") return emptyInteractions();
  try {
    const raw = window.localStorage.getItem(storageKey(userId, artifactId));
    if (!raw) return emptyInteractions();
    const parsed = JSON.parse(raw) as Partial<DigestInteractions>;
    return {
      todos: parsed.todos ?? {},
      reading: parsed.reading ?? {},
      keyPoints: parsed.keyPoints ?? {},
    };
  } catch {
    return emptyInteractions();
  }
}

export function writeDigestInteractions(
  userId: string,
  artifactId: string,
  state: DigestInteractions,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId, artifactId), JSON.stringify(state));
}

export function todoBlockId(index: number) {
  return `todo-${index}`;
}

export function readingBlockId(index: number) {
  return `reading-${index}`;
}

export function keyPointBlockId(readingIndex: number, pointIndex: number) {
  return `reading-${readingIndex}-kp-${pointIndex}`;
}
