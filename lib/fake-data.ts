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
  const amounts = [2, 3, 5, 5, 5, 10, 10, 12, 15, 20, 25, 50, 75, 100];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

export function randomSide(): "YES" | "NO" {
  return Math.random() > 0.5 ? "YES" : "NO";
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(0)}M`;
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

// --- Fake usernames and comments for Polymarket-style comment feed ---

const USERNAMES = [
  "MooreM",
  "CryptoKing99",
  "DegenTrader",
  "Blue31",
  "Cardenas",
  "ghachu",
  "It-aint-much",
  "hodl4life",
  "95Wal-1yX28",
  "ONTHE7THDAY",
  "bearish_bill",
  "CosmicDegen",
  "yolo_finance",
  "MarketMaker42",
  "AlphaSeeker",
  "diamond_hands",
  "paper_hands",
  "whale_watcher",
  "data_nerd",
  "prediction_pro",
];

const COMMENTS = [
  "This is easy money",
  "I just keep buying. Seems like the best risk/reward in the field",
  "Happens every year!",
  "Waiting for more data before I go bigger",
  "The market is wrong on this one",
  "I refreshed like 500 times today :D",
  "Waiting for 1min market",
  "I've been studying this market for several hours now... My conclusion is that it can go either way",
  "You can like only one comment at a time",
  "Buying the dip",
  "This feels like free money tbh",
  "No way this hits",
  "Already priced in",
  "The odds are off. This should be higher",
  "Sold my position. Taking profits",
  "Just went all in",
  "Anyone else seeing this price action?",
  "Markets are irrational",
  "Trust the process",
  "This is the one",
  "I'm not selling",
  "Doubling down here",
  "Interesting setup. Watching closely",
  "The smart money is on the other side",
  "Let's see how this plays out",
];

const AVATAR_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#c084fc",
];

export function randomUsername(): string {
  return USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
}

export function randomComment(): string {
  return COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Category icon/emoji for market cards
const CATEGORY_ICONS: Record<string, string> = {
  Politics: "🏛️",
  Crypto: "₿",
  Sports: "⚽",
  Tech: "💻",
  Culture: "🎬",
  Science: "🔬",
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "📊";
}
