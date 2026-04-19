"use client";

import { useCallback, useRef, useState } from "react";

export function Sparkline({
  series,
  width = 620,
  height = 180,
  showAxis = true,
  onHoverChange,
  labelForIndex,
}: {
  series: number[];
  width?: number;
  height?: number;
  showAxis?: boolean;
  onHoverChange?: (index: number | null) => void;
  labelForIndex?: (index: number) => string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const w = width;
  const h = height;
  const pad = showAxis
    ? { t: 12, r: 36, b: 22, l: 8 }
    : { t: 4, r: 4, b: 4, l: 4 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = series.length;

  const pt = (v: number, i: number): [number, number] => [
    pad.l + (i / (n - 1)) * innerW,
    pad.t + (1 - v) * innerH,
  ];

  const yesPath = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${pt(v, i).join(",")}`)
    .join(" ");
  const noPath = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${pt(1 - v, i).join(",")}`)
    .join(" ");

  const last = series[n - 1];
  const [lx, ly] = pt(last, n - 1);
  const [lxN, lyN] = pt(1 - last, n - 1);

  const updateHover = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || n === 0) return;
      const rect = svg.getBoundingClientRect();
      const relX = ((clientX - rect.left) / rect.width) * w;
      const clamped = Math.max(pad.l, Math.min(pad.l + innerW, relX));
      const ratio = (clamped - pad.l) / innerW;
      const idx = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
      setHoverIndex(idx);
      onHoverChange?.(idx);
    },
    [innerW, n, onHoverChange, pad.l, w],
  );

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) =>
    updateHover(e.clientX);
  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    const t = e.touches[0];
    if (t) updateHover(t.clientX);
  };
  const handleLeave = () => {
    setHoverIndex(null);
    onHoverChange?.(null);
  };

  const hoverYes = hoverIndex !== null ? series[hoverIndex] : null;
  const [hx, hy] =
    hoverIndex !== null && hoverYes !== null
      ? pt(hoverYes, hoverIndex)
      : [0, 0];
  const [hxN, hyN] =
    hoverIndex !== null && hoverYes !== null
      ? pt(1 - hoverYes, hoverIndex)
      : [0, 0];

  const hoverLabel =
    hoverIndex !== null && labelForIndex ? labelForIndex(hoverIndex) : null;

  const yesCent = hoverYes !== null ? Math.round(hoverYes * 100) : null;
  const noCent = hoverYes !== null ? 100 - Math.round(hoverYes * 100) : null;

  // Tooltip positioning: clamp so it doesn't overflow right edge
  const tooltipW = 110;
  const tooltipH = 38;
  const tooltipX =
    hoverIndex !== null
      ? Math.min(pad.l + innerW - tooltipW, Math.max(pad.l, hx - tooltipW / 2))
      : 0;
  const tooltipY = pad.t - 2;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: chart hover is mouse-only augmentation; screen-reader view is the surrounding text.
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        maxWidth: "100%",
        cursor: hoverIndex !== null ? "crosshair" : "default",
      }}
      role="presentation"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleLeave}
    >
      <title>Price history</title>

      {showAxis &&
        Array.from({ length: 5 }).map((_, i) => {
          const y = pad.t + (i / 4) * innerH;
          const pct = 100 - i * 25;
          return (
            <g key={`grid-${pct}`}>
              <line
                x1={pad.l}
                y1={y}
                x2={pad.l + innerW}
                y2={y}
                stroke="var(--rule)"
                strokeWidth="0.5"
                strokeDasharray={i === 0 || i === 4 ? "" : "2 3"}
              />
              <text
                x={pad.l + innerW + 6}
                y={y + 3}
                fontFamily="var(--ff-mono)"
                fontSize="9"
                fill="var(--ink-4)"
              >
                {pct}
              </text>
            </g>
          );
        })}

      <path
        d={noPath}
        fill="none"
        stroke="var(--ink-4)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path d={yesPath} fill="none" stroke="var(--ink)" strokeWidth="1.5" />

      {hoverIndex === null && (
        <>
          <circle
            cx={lx.toFixed(3)}
            cy={ly.toFixed(3)}
            r="3"
            fill="var(--ink)"
          />
          <circle
            cx={lxN.toFixed(3)}
            cy={lyN.toFixed(3)}
            r="2"
            fill="var(--paper)"
            stroke="var(--ink-4)"
            strokeWidth="1"
          />
        </>
      )}

      {hoverIndex !== null && hoverYes !== null && (
        <g>
          {/* crosshair */}
          <line
            x1={hx.toFixed(3)}
            y1={pad.t}
            x2={hx.toFixed(3)}
            y2={pad.t + innerH}
            stroke="var(--ink)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          {/* YES dot */}
          <circle
            cx={hx.toFixed(3)}
            cy={hy.toFixed(3)}
            r="3.5"
            fill="var(--ink)"
          />
          <circle
            cx={hx.toFixed(3)}
            cy={hy.toFixed(3)}
            r="6"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.5"
            opacity="0.35"
          />
          {/* NO dot */}
          <circle
            cx={hxN.toFixed(3)}
            cy={hyN.toFixed(3)}
            r="2.5"
            fill="var(--paper)"
            stroke="var(--ink-4)"
            strokeWidth="1"
          />

          {/* tooltip */}
          <g transform={`translate(${tooltipX.toFixed(3)}, ${tooltipY})`}>
            <rect
              x="0"
              y="0"
              width={tooltipW}
              height={tooltipH}
              fill="var(--paper)"
              stroke="var(--ink)"
              strokeWidth="0.75"
            />
            <text
              x="8"
              y="14"
              fontFamily="var(--ff-mono)"
              fontSize="10"
              fill="var(--ink)"
            >
              YES {yesCent}¢
            </text>
            <text
              x="8"
              y="28"
              fontFamily="var(--ff-mono)"
              fontSize="10"
              fill="var(--ink-3)"
            >
              NO {noCent}¢
            </text>
            {hoverLabel && (
              <text
                x={tooltipW - 8}
                y="14"
                textAnchor="end"
                fontFamily="var(--ff-mono)"
                fontSize="9"
                fill="var(--ink-4)"
                letterSpacing="0.05em"
              >
                {hoverLabel}
              </text>
            )}
          </g>
        </g>
      )}
    </svg>
  );
}

export function MiniSpark({
  series,
  width = 120,
  height = 36,
  color = "var(--ink)",
}: {
  series: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const n = series.length;
  const pt = (v: number, i: number): [number, number] => [
    (i / (n - 1)) * width,
    (1 - v) * height,
  ];
  const d = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${pt(v, i).join(",")}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", width, height, maxWidth: "100%" }}
      role="presentation"
    >
      <title>Mini sparkline</title>
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
