"use client";

const CATEGORIES = [
  "All",
  "Politics",
  "Crypto",
  "Science",
  "Tech",
  "Sports",
  "Culture",
  "Resolved",
];

export function CategoryBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div
      className="bureau-category-bar"
      style={{
        display: "flex",
        gap: 0,
        padding: "10px 0",
        borderBottom: "1px solid var(--rule)",
        fontFamily: "var(--ff-mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {CATEGORIES.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            style={{
              background: "none",
              border: 0,
              padding: "4px 14px",
              cursor: "pointer",
              color: isActive ? "var(--ink)" : "var(--ink-3)",
              borderBottom: isActive
                ? "2px solid var(--ink)"
                : "2px solid transparent",
              marginBottom: -11,
              fontFamily: "inherit",
              fontSize: "inherit",
              letterSpacing: "inherit",
              textTransform: "inherit",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
