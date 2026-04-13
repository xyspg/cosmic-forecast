"use client";

/**
 * Simple animated number display. No fancy rolling — just clean tabular nums.
 * The previous rolling digit approach caused font misalignment issues.
 */
export function RollingNumber({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const formatted = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function RollingPrice({
  price,
  className = "",
}: {
  price: number;
  className?: string;
}) {
  const pct = Math.round(price * 100);
  return (
    <span className={`tabular-nums ${className}`}>
      {pct}
      <span className="text-[0.6em]">%</span>
    </span>
  );
}

export function RollingVolume({
  volume,
  className = "",
}: {
  volume: number;
  className?: string;
}) {
  let formatted: string;
  if (volume >= 1_000_000) formatted = `$${(volume / 1_000_000).toFixed(0)}M`;
  else if (volume >= 1_000) formatted = `$${(volume / 1_000).toFixed(0)}K`;
  else formatted = `$${volume}`;

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
}
