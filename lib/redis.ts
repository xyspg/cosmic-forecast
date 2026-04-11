import { Redis } from "@upstash/redis";

const PREFIX = "hou:";

const cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID;
const cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  ...(cfAccessClientId && cfAccessClientSecret
    ? {
        headers: {
          "CF-Access-Client-Id": cfAccessClientId,
          "CF-Access-Client-Secret": cfAccessClientSecret,
        },
      }
    : {}),
});

export function key(...parts: string[]): string {
  return PREFIX + parts.join(":");
}
