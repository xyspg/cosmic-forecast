const WALLET_PREFIXES = [
  "0x7f3a",
  "0xb2c1",
  "0x4d8e",
  "0xa1f7",
  "0x9c3b",
  "0xe5d2",
  "0x6a9f",
  "0x8b4c",
  "0xd7e1",
  "0x3f6a",
  "0xc2b8",
  "0x5e9d",
  "0xf1a3",
  "0x2d7c",
  "0x8e4b",
  "0xa6f9",
  "0x1b3e",
  "0xd4c7",
  "0x7a2f",
  "0xe8b1",
];

const WALLET_SUFFIXES = [
  "...a4f2",
  "...7b1c",
  "...e3d9",
  "...2f8a",
  "...c6e5",
  "...9d3b",
  "...4a7f",
  "...b1e8",
  "...6c2d",
  "...f9a3",
  "...3e7b",
  "...8d4c",
  "...a2f6",
  "...5b9e",
  "...d7c1",
  "...1f3a",
  "...e4b8",
  "...7c6d",
  "...b9a2",
  "...3d5f",
];

export function randomWallet(): string {
  const prefix =
    WALLET_PREFIXES[Math.floor(Math.random() * WALLET_PREFIXES.length)];
  const suffix =
    WALLET_SUFFIXES[Math.floor(Math.random() * WALLET_SUFFIXES.length)];
  return `${prefix}${suffix}`;
}

export function randomAmount(): number {
  const amounts = [5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

export function randomSide(): "YES" | "NO" {
  return Math.random() > 0.5 ? "YES" : "NO";
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}K`;
  }
  return `$${volume}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
