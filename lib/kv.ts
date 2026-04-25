import type { Fetcher, KVNamespace } from "@cloudflare/workers-types";

const PREFIX = "hou:";

export type WorkerEnv = {
  KV: KVNamespace;
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
};

export function key(...parts: string[]): string {
  return PREFIX + parts.join(":");
}
