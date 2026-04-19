"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  randomUsername,
  randomComment,
  randomAvatarColor,
} from "@/lib/fake-data";

interface Comment {
  id: string;
  username: string;
  text: string;
  color: string;
  likes: number;
  isReal?: boolean;
}

const MAX_COMMENTS = 80;
const LIKE_STORAGE_KEY = "cosmic:comment-likes";

function getLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKE_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>) {
  // Only persist real comment likes (skip fake-* and temp-*)
  const realOnly = [...ids].filter(
    (id) => !id.startsWith("fake-") && !id.startsWith("temp-"),
  );
  localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(realOnly));
}

export function CommentFeed({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [inputText, setInputText] = useState("");
  const [posting, setPosting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load liked IDs from localStorage
  useEffect(() => {
    setLikedIds(getLikedIds());
  }, []);

  // Fetch real comments + generate fake ones
  useEffect(() => {
    let nextId = 0;

    const fakeComments: Comment[] = Array.from({ length: 10 }, () => ({
      id: `fake-${nextId++}`,
      username: randomUsername(),
      text: randomComment(),
      color: randomAvatarColor(),
      likes: Math.floor(Math.random() * 20),
    }));

    setComments(fakeComments);

    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json() as Promise<{
        comments?: Array<{
          id: string;
          username: string;
          text: string;
          color: string;
        }>;
      }>)
      .then((data) => {
        if (data.comments?.length) {
          const real: Comment[] = data.comments.map(
            (c) => ({
              id: c.id,
              username: c.username,
              text: c.text,
              color: c.color,
              likes: 0,
              isReal: true,
            }),
          );
          setComments((prev) => [...real, ...prev.filter((c) => !c.isReal)]);
        }
      })
      .catch(() => {});

    // Add fake comments periodically with varying intervals
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      timeout = setTimeout(
        () => {
          setComments((prev) => {
            const next = [
              ...prev,
              {
                id: `fake-${nextId++}`,
                username: randomUsername(),
                text: randomComment(),
                color: randomAvatarColor(),
                likes: 0,
              },
            ];
            return next.length > MAX_COMMENTS
              ? next.slice(-MAX_COMMENTS)
              : next;
          });
          scheduleNext();
        },
        5000 + Math.random() * 3000,
      );
    };
    scheduleNext();

    return () => clearTimeout(timeout);
  }, [slug]);

  // Smooth auto-scroll with rAF (pauses when tab hidden)
  useEffect(() => {
    let raf: number;
    let running = true;
    const scroll = () => {
      if (!running) return;
      const el = scrollRef.current;
      if (el && el.scrollHeight > el.clientHeight) {
        el.scrollTop += 0.15;
      }
      raf = requestAnimationFrame(scroll);
    };
    raf = requestAnimationFrame(scroll);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  // Post a real comment
  const handlePost = useCallback(async () => {
    const text = inputText.trim();
    if (!text || posting) return;

    setPosting(true);
    const username = randomUsername();
    const color = randomAvatarColor();

    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      username,
      text,
      color,
      likes: 0,
      isReal: true,
    };
    setComments((prev) => {
      const next = [optimistic, ...prev];
      return next.length > MAX_COMMENTS ? next.slice(0, MAX_COMMENTS) : next;
    });
    setInputText("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, username, text, color }),
      });
      const data = (await res.json()) as { comment?: { id: string } };
      if (data.comment) {
        const newId = data.comment.id;
        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? { ...optimistic, id: newId } : c)),
        );
      }
    } catch {
      // Keep the optimistic comment
    } finally {
      setPosting(false);
    }
  }, [inputText, posting, slug]);

  // Toggle like (local only, persists only real comment IDs)
  const toggleLike = useCallback((commentId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      saveLikedIds(next);
      return next;
    });
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Comments</h3>
        <span className="text-xs text-gray-400">{comments.length}</span>
      </div>

      {/* Comment input */}
      <div className="border-b border-gray-100 px-4 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handlePost();
          }}
        >
          <div className="h-7 w-7 shrink-0 rounded-full bg-blue-500" />
          <input
            type="text"
            placeholder="Add a comment..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={280}
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
          />
          {inputText.trim() && (
            <button
              type="submit"
              disabled={posting}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {posting ? "..." : "Post"}
            </button>
          )}
        </form>
      </div>

      {/* Comment list */}
      <div
        ref={scrollRef}
        className="max-h-[400px] overflow-y-auto scrollbar-none"
      >
        <AnimatePresence initial={false}>
          {comments.map((c) => {
            const isLiked = likedIds.has(c.id);
            const displayLikes = c.likes + (isLiked ? 1 : 0);

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{
                  opacity: { duration: 0.3 },
                  height: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div
                    className="mt-0.5 h-6 w-6 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {c.username}
                      </span>
                      {c.isReal && (
                        <span className="text-[10px] text-blue-500 font-medium">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-snug mt-0.5">
                      {c.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <button
                        type="button"
                        onClick={() => toggleLike(c.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          isLiked ? "text-red-500" : "hover:text-gray-600"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {displayLikes > 0 && <span>{displayLikes}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
