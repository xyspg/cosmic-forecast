import { Redis } from "@upstash/redis";

const PREFIX = "hou:";

export function getRedis(): Redis {
  const cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID;
  const cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // @upstash/redis@1.37.0 silently drops `config.headers` in its platform
  // wrappers (cloudflare.js, nodejs.js, fastly.js), so pass through the
  // internal HttpClient to inject CF Access Service Token headers.
  if (cfAccessClientId && cfAccessClientSecret) {
    const internal = redis as unknown as {
      client: { headers: Record<string, string> };
    };
    internal.client.headers["CF-Access-Client-Id"] = cfAccessClientId;
    internal.client.headers["CF-Access-Client-Secret"] = cfAccessClientSecret;
  }

  return redis;
}

export function key(...parts: string[]): string {
  return PREFIX + parts.join(":");
}
