/** Hours after which a Tier-1 (gov) citation is treated as stale. */
export const TIER1_STALE_HOURS = 36;

export function isGovSource(label: string, url: string): boolean {
  return (
    /\b(PIB|RBI|PRS|Ministry|Gov|\.gov\.in)\b/i.test(label) || /\.gov\.in/i.test(url)
  );
}

export function formatSourceAge(isoOrMs: string | number, now = Date.now()): string | null {
  const t = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (Number.isNaN(t)) return null;
  const hours = Math.max(0, (now - t) / 3600_000);
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins}m ago`;
  }
  if (hours < 48) {
    return `${Math.round(hours)}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function isTier1Stale(publishedAt: string | number, now = Date.now()): boolean {
  const t = typeof publishedAt === "number" ? publishedAt : Date.parse(publishedAt);
  if (Number.isNaN(t)) return false;
  const hours = (now - t) / 3600_000;
  return hours >= TIER1_STALE_HOURS;
}

/** Normalize URLs for matching AI citations to RSS links. */
export function normalizeSourceUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    u.pathname = path;
    return u.href;
  } catch {
    return url.trim().replace(/\/+$/, "");
  }
}
