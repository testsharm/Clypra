import React, { useState } from "react";
import type { TabProps } from "../types";

const STICKER_BASE = "https://raw.githubusercontent.com/testsharm/Clypra/main/public/stickers";

const STICKERS = [
  { id: "star", name: "Star", ext: "webp", emoji: "⭐" },
  { id: "heart", name: "Heart", ext: "webp", emoji: "❤️" },
  { id: "fire", name: "Fire", ext: "webp", emoji: "🔥" },
  { id: "sparkles", name: "Sparkles", ext: "webp", emoji: "✨" },
  { id: "crown", name: "Crown", ext: "webp", emoji: "👑" },
  { id: "arrow", name: "Arrow", ext: "webp", emoji: "➡️" },
  { id: "check", name: "Check", ext: "webp", emoji: "✅" },
  { id: "lightning", name: "Lightning", ext: "webp", emoji: "⚡" },
  { id: "music", name: "Music", ext: "webp", emoji: "🎵" },
  { id: "camera", name: "Camera", ext: "webp", emoji: "📷" },
  { id: "gift", name: "Gift", ext: "webp", emoji: "🎁" },
  { id: "balloon", name: "Balloon", ext: "webp", emoji: "🎈" },
  { id: "confetti", name: "Confetti", ext: "webp", emoji: "🎉" },
  { id: "smile", name: "Smile", ext: "webp", emoji: "😀" },
  { id: "thumb", name: "Thumb", ext: "webp", emoji: "👍" },
  { id: "rocket", name: "Rocket", ext: "webp", emoji: "🚀" },
  { id: "earth", name: "Earth", ext: "webp", emoji: "🌍" },
  { id: "moon", name: "Moon", ext: "webp", emoji: "🌙" },
  { id: "snowflake", name: "Snowflake", ext: "webp", emoji: "❄️" },
  { id: "flower", name: "Flower", ext: "webp", emoji: "🌸" },
  { id: "butterfly", name: "Butterfly", ext: "webp", emoji: "🦋" },
  { id: "rainbow", name: "Rainbow", ext: "webp", emoji: "🌈" },
  { id: "diamond", name: "Diamond", ext: "webp", emoji: "💎" },
  { id: "trophy", name: "Trophy", ext: "webp", emoji: "🏆" },
  { id: "bell", name: "Bell", ext: "webp", emoji: "🔔" },
  { id: "bubble", name: "Bubble", ext: "webp", emoji: "💬" },
  { id: "magic", name: "Magic", ext: "webp", emoji: "🪄" },
  { id: "party", name: "Party", ext: "webp", emoji: "🥳" },
  { id: "cool", name: "Cool", ext: "webp", emoji: "😎" },
  { id: "love", name: "Love", ext: "webp", emoji: "💖" }
];

interface StickerCardProps {
  sticker: typeof STICKERS[number];
  onAdd: () => void;
}

function StickerCard({ sticker, onAdd }: StickerCardProps) {
  const [failed, setFailed] = useState(false);
  const url = `${STICKER_BASE}/${sticker.id}.${sticker.ext}`;

  return (
    <button
      onClick={onAdd}
      className="aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer"
      title={`Add ${sticker.name}`}
    >
      {failed ? (
        <span className="text-3xl select-none">{sticker.emoji}</span>
      ) : (
        <img
          src={url}
          alt={sticker.name}
          className="w-3/4 h-3/4 object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </button>
  );
}

export const StickersTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const handleAddSticker = (sticker: typeof STICKERS[number]) => {
    onAddToTimeline?.(
      {
        id: `github-sticker-${sticker.id}`,
        name: sticker.name,
        kind: "sticker",
        url: `${STICKER_BASE}/${sticker.id}.${sticker.ext}`,
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
