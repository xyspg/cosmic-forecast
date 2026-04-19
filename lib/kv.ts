import { getCloudflareContext } from "@opennextjs/cloudflare";

const PREFIX = "hou:";

export async function getKV(): Promise<KVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  const kv = env.KV as KVNamespace | undefined;
  if (!kv) {
    throw new Error(
      "KV binding missing. Add a `KV` kv_namespaces entry to wrangler.jsonc and re-run `bun run cf-typegen`.",
    );
  }
  return kv;
}

export function key(...parts: string[]): string {
  return PREFIX + parts.join(":");
}
