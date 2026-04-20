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
    <div className="scrollbar-none flex border-b border-rule py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:whitespace-nowrap">
      {CATEGORIES.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`-mb-[11px] cursor-pointer border-0 bg-transparent px-[14px] py-1 font-[inherit] text-[inherit] uppercase tracking-[inherit] border-b-2 ${
              isActive
                ? "border-ink font-semibold text-ink"
                : "border-transparent font-normal text-ink-3"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
