import { NextResponse } from "next/server";
import { getRedis, key } from "@/lib/redis";

const COMMENT_TTL = 60 * 60 * 24; // 1 day
const MAX_COMMENTS = 100;

export interface StoredComment {
  id: string;
  username: string;
  text: string;
  color: string;
  timestamp: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const redis = getRedis();
  const comments = await redis.lrange<StoredComment>(
    key("comments", slug),
    0,
    49,
  );
  return NextResponse.json({ comments: comments || [] });
}

export async function POST(request: Request) {
  try {
    const { slug, username, text, color } = await request.json();

    if (!slug || !username || !text) {
      return NextResponse.json(
        { error: "slug, username, and text required" },
        { status: 400 },
      );
    }

    const comment: StoredComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: username.slice(0, 30),
      text: text.slice(0, 280),
      color: color || "#60a5fa",
      timestamp: Date.now(),
    };

    const k = key("comments", slug);

    // Pipeline: single HTTP round-trip for all three operations
    const redis = getRedis();
    const pipe = redis.pipeline();
    pipe.lpush(k, comment);
    pipe.ltrim(k, 0, MAX_COMMENTS - 1);
    pipe.expire(k, COMMENT_TTL);
    await pipe.exec();

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comment POST failed:", error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}
