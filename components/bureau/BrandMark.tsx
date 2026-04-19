export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ display: "block" }}
      role="presentation"
    >
      <title>Bureau seal</title>
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <circle
        cx="20"
        cy="20"
        r="14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <line
        x1="20"
        y1="2"
        x2="20"
        y2="8"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <line
        x1="20"
        y1="32"
        x2="20"
        y2="38"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <line
        x1="2"
        y1="20"
        x2="8"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <line
        x1="32"
        y1="20"
        x2="38"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = (20 + Math.cos(a) * 17).toFixed(3);
        const y1 = (20 + Math.sin(a) * 17).toFixed(3);
        const x2 = (20 + Math.cos(a) * 18.5).toFixed(3);
        const y2 = (20 + Math.sin(a) * 18.5).toFixed(3);
        return (
          <line
            key={`tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        );
      })}
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <line
        x1="20"
        y1="14"
        x2="20"
        y2="26"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <line
        x1="14"
        y1="20"
        x2="26"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );
}
