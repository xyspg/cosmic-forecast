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
    <div className="scrollbar-none border-rule flex border-b py-[10px] font-mono text-[11px] tracking-[0.1em] uppercase max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:whitespace-nowrap">
      {CATEGORIES.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`-mb-[11px] cursor-pointer border-0 border-b-2 bg-transparent px-[14px] py-1 font-[inherit] tracking-[inherit] text-[inherit] uppercase ${
              isActive
                ? "border-ink text-ink font-semibold"
                : "text-ink-3 border-transparent font-normal"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
