import { Redis } from "@upstash/redis";

const PREFIX = "hou:";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function key(...parts: string[]): string {
  return PREFIX + parts.join(":");
}
