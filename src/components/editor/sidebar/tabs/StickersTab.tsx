import React from "react";
import type { TabProps } from "../types";

const svg = (body: string, w = 64, h = 64) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`)}`;

const STICKERS = [
  { id: "arrow-up", name: "Arrow Up", emoji: "⬆️", anim: "", url: svg(`<path d="M32 52V12M32 12L14 30M32 12l18 18" stroke="#00f0ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "arrow-down", name: "Arrow Down", emoji: "⬇️", anim: "", url: svg(`<path d="M32 12v40m0 0l18-18M32 52L14 34" stroke="#00f0ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "arrow-left", name: "Arrow Left", emoji: "⬅️", anim: "", url: svg(`<path d="M52 32H12m0 0l18-18M12 32l18 18" stroke="#00f0ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "arrow-right", name: "Arrow Right", emoji: "➡️", anim: "", url: svg(`<path d="M12 32h40m0 0l-18-18m18 18l-18 18" stroke="#00f0ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "arrow-rotate", name: "Rotate Arrow", emoji: "🔄", anim: "animate-spin-slow", url: svg(`<path d="M40 12a20 20 0 1 0 0 40M40 12V4m0 8l8-4" stroke="#ff2d55" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "circle-solid", name: "Solid Circle", emoji: "⭕", anim: "", url: svg(`<circle cx="32" cy="32" r="24" fill="none" stroke="#ffcc00" stroke-width="6"/>`) },
  { id: "circle-dotted", name: "Dotted Circle", emoji: "🔵", anim: "animate-pulse", url: svg(`<circle cx="32" cy="32" r="24" fill="none" stroke="#ffcc00" stroke-width="4" stroke-dasharray="4 6"/>`) },
  { id: "circle-dashed", name: "Dashed Circle", emoji: "🟣", anim: "animate-spin-slow", url: svg(`<circle cx="32" cy="32" r="24" fill="none" stroke="#00f0ff" stroke-width="4" stroke-dasharray="10 8"/>`) },
  { id: "circle-arrow", name: "Circle Arrow", emoji: "🔄", anim: "animate-spin-slow", url: svg(`<circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="5"/><path d="M42 22l8 8-8 8M50 30H30a10 10 0 0 0 0 20h4" stroke="#ff2d55" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "badge-check", name: "Badge Check", emoji: "✅", anim: "", url: svg(`<circle cx="32" cy="32" r="26" fill="#22c55e"/><path d="M20 32l8 8l16-18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "badge-star", name: "Badge Star", emoji: "⭐", anim: "animate-pulse", url: svg(`<path d="M32 8l7 18h18l-14 10 5 18-16-12-16 12 5-18L8 26h18z" fill="#f59e0b" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`) },
  { id: "heart-pulse", name: "Heart Pulse", emoji: "💖", anim: "animate-pulse", url: svg(`<path d="M32 52S12 38 12 24a10 10 0 0 1 20-2a10 10 0 0 1 20 2C52 38 32 52 32 52z" fill="#ff2d55"/>`) },
  { id: "fire", name: "Fire", emoji: "🔥", anim: "animate-bounce", url: svg(`<path d="M32 8c4 8 10 12 10 22a10 10 0 0 1-20 0c0-10 6-14 10-22z" fill="#f97316"/><circle cx="32" cy="34" r="5" fill="#facc15"/>`) },
  { id: "sparkle", name: "Sparkle", emoji: "✨", anim: "animate-pulse", url: svg(`<path d="M32 8l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#facc15"/><circle cx="50" cy="14" r="4" fill="#fff"/><circle cx="14" cy="50" r="4" fill="#fff"/>`) },
  { id: "lightning", name: "Lightning", emoji: "⚡", anim: "animate-pulse", url: svg(`<path d="M36 8L16 34h12l-4 22 20-28H32z" fill="#facc15" stroke="#fff" stroke-width="2"/>`) },
  { id: "music", name: "Music", emoji: "🎵", anim: "animate-bounce", url: svg(`<path d="M20 48V16l24-4v32" stroke="#00f0ff" stroke-width="5" fill="none"/><circle cx="16" cy="48" r="6" fill="#ff2d55"/><circle cx="40" cy="44" r="6" fill="#ff2d55"/>`) },
  { id: "camera", name: "Camera", emoji: "📷", anim: "", url: svg(`<rect x="8" y="20" width="48" height="28" rx="4" fill="none" stroke="#fff" stroke-width="4"/><circle cx="32" cy="34" r="8" fill="none" stroke="#fff" stroke-width="4"/><path d="M20 20l4-8h16l4 8" fill="none" stroke="#fff" stroke-width="4"/>`) },
  { id: "gift", name: "Gift", emoji: "🎁", anim: "animate-bounce", url: svg(`<rect x="8" y="24" width="48" height="24" rx="4" fill="#ff2d55"/><rect x="28" y="20" width="8" height="32" fill="#facc15"/><path d="M32 20c-4-6 4-8 6-2 1 3-2 4-6 6 4 2 7 3 6 6-2 6-10 4-6-2" fill="#facc15"/>`) },
  { id: "balloon", name: "Balloon", emoji: "🎈", anim: "animate-bounce", url: svg(`<ellipse cx="32" cy="24" rx="16" ry="20" fill="#ff2d55"/><path d="M32 44v12M28 56h8" stroke="#fff" stroke-width="3"/>`) },
  { id: "confetti", name: "Confetti", emoji: "🎉", anim: "animate-pulse", url: svg(`<circle cx="16" cy="20" r="4" fill="#facc15"/><circle cx="48" cy="16" r="4" fill="#ff2d55"/><circle cx="52" cy="40" r="4" fill="#00f0ff"/><rect x="20" y="40" width="8" height="8" fill="#22c55e"/><rect x="36" y="28" width="8" height="8" fill="#a855f7"/>`) },
  { id: "smile", name: "Smile", emoji: "😀", anim: "", url: svg(`<circle cx="32" cy="32" r="24" fill="#facc15"/><circle cx="24" cy="28" r="3" fill="#000"/><circle cx="40" cy="28" r="3" fill="#000"/><path d="M24 40c4 4 12 4 16 0" stroke="#000" stroke-width="3" fill="none"/>`) },
  { id: "thumb", name: "Thumb Up", emoji: "👍", anim: "animate-bounce", url: svg(`<path d="M12 28h10v20H12zM22 28l6-14c0-4 3-6 7-4l-2 12h12c4 0 7 3 7 7l-4 18H22" fill="#3b82f6" stroke="#fff" stroke-width="2"/>`) },
  { id: "rocket", name: "Rocket", emoji: "🚀", anim: "animate-bounce", url: svg(`<path d="M32 8c8 8 12 18 12 30l-12 4-12-4C20 26 24 16 32 8z" fill="#fff"/><circle cx="32" cy="36" r="6" fill="#ff2d55"/><path d="M32 8c-4 10-4 20 0 30m0-30c4 10 4 20 0 30" stroke="#facc15" stroke-width="3" fill="none"/>`) },
  { id: "earth", name: "Earth", emoji: "🌍", anim: "animate-spin-slow", url: svg(`<circle cx="32" cy="32" r="24" fill="#22c55e" stroke="#fff" stroke-width="3"/><path d="M16 24h32M16 40h32M32 8c-8 8-10 16-8 24 2 10 6 16 8 20 2-4 6-10 8-20 2-8 0-16-8-24" stroke="#fff" stroke-width="2" fill="none"/>`) },
  { id: "moon", name: "Moon", emoji: "🌙", anim: "", url: svg(`<path d="M48 44A20 20 0 1 1 20 16a16 16 0 0 0 28 28z" fill="#a855f7" stroke="#fff" stroke-width="2"/>`) },
  { id: "snowflake", name: "Snowflake", emoji: "❄️", anim: "animate-spin-slow", url: svg(`<path d="M32 8v48M16 20l32 24M48 20L16 44M20 8l24 48M44 8L20 56" stroke="#00f0ff" stroke-width="4" stroke-linecap="round"/>`) },
  { id: "flower", name: "Flower", emoji: "🌸", anim: "animate-pulse", url: svg(`<circle cx="32" cy="32" r="8" fill="#facc15"/><circle cx="16" cy="20" r="10" fill="#ff2d55"/><circle cx="48" cy="20" r="10" fill="#ff2d55"/><circle cx="16" cy="44" r="10" fill="#ff2d55"/><circle cx="48" cy="44" r="10" fill="#ff2d55"/>`) },
  { id: "butterfly", name: "Butterfly", emoji: "🦋", anim: "animate-bounce", url: svg(`<path d="M32 32C20 18 4 20 4 36c0 12 16 20 28 16 12 4 28-4 28-16 0-16-16-18-28-4z" fill="#ec4899"/><path d="M32 32V52" stroke="#000" stroke-width="3"/>`) },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", anim: "", url: svg(`<path d="M8 48a24 24 0 0 1 48 0" fill="none" stroke="#f00" stroke-width="4"/><path d="M16 48a16 16 0 0 1 32 0" fill="none" stroke="#facc15" stroke-width="4"/><path d="M24 48a8 8 0 0 1 16 0" fill="none" stroke="#22c55e" stroke-width="4"/>`) },
  { id: "diamond", name: "Diamond", emoji: "💎", anim: "animate-pulse", url: svg(`<path d="M20 8h24l8 16-20 32L12 24z" fill="#00f0ff" stroke="#fff" stroke-width="2"/><path d="M12 24h40M20 8l-8 16 20 32 20-32-8-16" fill="none" stroke="#fff" stroke-width="1"/>`) },
  { id: "trophy", name: "Trophy", emoji: "🏆", anim: "animate-bounce", url: svg(`<path d="M16 12h32v8a16 16 0 0 1-32 0zM16 12H8v6a6 6 0 0 0 8 6m32-12h8v6a6 6 0 0 1-8 6M32 32v8m0 8v4" stroke="#f59e0b" stroke-width="4" fill="none"/><circle cx="32" cy="20" r="8" fill="#f59e0b"/>`) },
  { id: "bell", name: "Bell", emoji: "🔔", anim: "animate-bounce", url: svg(`<path d="M16 36a16 16 0 1 1 32 0v8H16z" fill="#facc15"/><path d="M24 48h16M32 8V4" stroke="#fff" stroke-width="4"/>`) },
  { id: "bubble", name: "Bubble", emoji: "💬", anim: "animate-pulse", url: svg(`<rect x="8" y="12" width="48" height="32" rx="12" fill="#fff" stroke="#000" stroke-width="2"/><path d="M20 44l-6 12 14-12z" fill="#fff" stroke="#000" stroke-width="2"/>`) },
  { id: "magic", name: "Magic Wand", emoji: "🪄", anim: "animate-spin-slow", url: svg(`<path d="M40 8L56 24M28 36l8-8M8 56l36-36" stroke="#a855f7" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="16" r="3" fill="#facc15"/><circle cx="16" cy="48" r="3" fill="#facc15"/>`) },
  { id: "party", name: "Party", emoji: "🥳", anim: "animate-bounce", url: svg(`<circle cx="16" cy="16" r="6" fill="#facc15"/><circle cx="48" cy="16" r="6" fill="#ff2d55"/><circle cx="16" cy="48" r="6" fill="#00f0ff"/><circle cx="48" cy="48" r="6" fill="#22c55e"/><path d="M32 16v8m0 8v8m0 8v-4" stroke="#fff" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="#a855f7"/>`) },
  { id: "cool", name: "Cool", emoji: "😎", anim: "", url: svg(`<circle cx="32" cy="32" r="24" fill="#facc15"/><rect x="16" y="24" width="16" height="8" fill="#000"/><rect x="32" y="24" width="16" height="8" fill="#000"/><path d="M20 42c6 4 18 4 24 0" stroke="#000" stroke-width="3" fill="none"/>`) },
  { id: "love", name: "Love", emoji: "💖", anim: "animate-pulse", url: svg(`<path d="M32 50S10 38 10 24a10 10 0 0 1 20-2 10 10 0 0 1 20 2C50 38 32 50 32 50z" fill="#ff2d55" stroke="#fff" stroke-width="2"/><circle cx="24" cy="22" r="3" fill="#fff"/><circle cx="40" cy="22" r="3" fill="#fff"/>`) },
];

interface StickerCardProps {
  sticker: typeof STICKERS[number];
  onAdd: () => void;
}

function StickerCard({ sticker, onAdd }: StickerCardProps) {
  return (
    <button
      onClick={onAdd}
      className="aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer"
      title={`Add ${sticker.name}`}
    >
      <img src={sticker.url} alt={sticker.name} className="w-3/4 h-3/4 object-contain" loading="lazy" />
    </button>
  );
}

export const StickersTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const handleAddSticker = (sticker: typeof STICKERS[number]) => {
    onAddToTimeline?.(
      {
        id: `capcut-sticker-${sticker.id}`,
        name: sticker.name,
        kind: "sticker",
        url: sticker.url,
        emoji: sticker.emoji,
      },
      "stickers"
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin">
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} onAdd={() => handleAddSticker(sticker)} />
        ))}
      </div>
    </div>
  );
};
