"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  randomUsername,
  randomComment,
  randomAvatarColor,
} from "@/lib/fake-data";

interface Comment {
  id: number;
  username: string;
  text: string;
  color: string;
  likes: number;
}

export function CommentFeed() {
  const [comments, setComments] = useState<Comment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll smoothly
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.1; // px per frame — very slow, elegant

    const scroll = () => {
      if (el.scrollTop < el.scrollHeight - el.clientHeight) {
        el.scrollTop += speed;
      }
      raf = requestAnimationFrame(scroll);
    };

    raf = requestAnimationFrame(scroll);

    // Pause on hover
    const pause = () => cancelAnimationFrame(raf);
    const resume = () => {
      raf = requestAnimationFrame(scroll);
    };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [comments.length]);

  // Add new comments at bottom
  useEffect(() => {
    // Initial batch
    const initial: Comment[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      username: randomUsername(),
      text: randomComment(),
      color: randomAvatarColor(),
      likes: Math.floor(Math.random() * 20),
    }));
    setComments(initial);
    let nextId = 15;

    const interval = setInterval(
      () => {
        setComments((prev) => [
          ...prev,
          {
            id: nextId++,
            username: randomUsername(),
            text: randomComment(),
            color: randomAvatarColor(),
            likes: 0,
          },
        ]);
      },
      3500 + Math.random() * 2500,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Comments</h3>
        <span className="text-xs text-gray-400">{comments.length}</span>
      </div>

      {/* Comment input (cosmetic) */}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gray-200" />
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm text-gray-500 bg-transparent outline-none placeholder-gray-400"
            readOnly
          />
        </div>
      </div>

      {/* Smoothly scrolling comment list */}
      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto scrollbar-none">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{
                opacity: { duration: 0.4, ease: "easeOut" },
                height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
              }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0">
                <div
                  className="mt-0.5 h-6 w-6 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-bold text-gray-900">
                    {c.username}
                  </span>
                  <p className="text-sm text-gray-600 leading-snug mt-0.5">
                    {c.text}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {c.likes > 0 && <span>{c.likes}</span>}
                    </button>
                    <button type="button" className="hover:text-gray-600">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
