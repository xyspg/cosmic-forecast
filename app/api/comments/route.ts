import { NextResponse } from "next/server";
import { getKV, key } from "@/lib/kv";

const COMMENT_TTL = 60 * 60 * 24; // 1 day
const MAX_COMMENTS = 100;
const PAGE_SIZE = 50;

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

  const kv = await getKV();
  const list =
    (await kv.get<StoredComment[]>(key("comments", slug), "json")) ?? [];
  return NextResponse.json({ comments: list.slice(0, PAGE_SIZE) });
}

export async function POST(request: Request) {
  try {
    const { slug, username, text, color } = (await request.json()) as {
      slug?: string;
      username?: string;
      text?: string;
      color?: string;
    };

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
    const kv = await getKV();
    const existing = (await kv.get<StoredComment[]>(k, "json")) ?? [];
    const next = [comment, ...existing].slice(0, MAX_COMMENTS);
    await kv.put(k, JSON.stringify(next), { expirationTtl: COMMENT_TTL });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comment POST failed:", error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}
