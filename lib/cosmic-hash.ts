/**
 * Determines market outcome using SHA-256 hash of NASA event data + market slug.
 * This is the satirical core: real astronomical data → deterministic but meaningless outcome.
 */

export async function computeCosmicOutcome(
  nasaEventId: string,
  date: string,
  marketSlug: string,
): Promise<{ outcome: "YES" | "NO"; hash: string }> {
  const input = `${nasaEventId}${date}${marketSlug}`;

  // Use Web Crypto API (works in both Node and Edge runtime)
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const lastChar = Number.parseInt(hash[hash.length - 1], 16);
  const outcome = lastChar % 2 === 0 ? "YES" : "NO";

  return { outcome, hash };
}
