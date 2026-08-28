import React from "react";
import type { TabProps } from "../types";

const STICKER_BASE = "https://raw.githubusercontent.com/testsharm/Clypra/main/public/stickers";

const STICKERS = [
  { id: "star", name: "Star", ext: "webp" },
  { id: "heart", name: "Heart", ext: "webp" },
  { id: "fire", name: "Fire", ext: "webp" },
  { id: "sparkles", name: "Sparkles", ext: "webp" },
  { id: "crown", name: "Crown", ext: "webp" },
  { id: "arrow", name: "Arrow", ext: "webp" },
  { id: "check", name: "Check", ext: "webp" },
  { id: "lightning", name: "Lightning", ext: "webp" },
  { id: "music", name: "Music", ext: "webp" },
  { id: "camera", name: "Camera", ext: "webp" },
  { id: "gift", name: "Gift", ext: "webp" },
  { id: "balloon", name: "Balloon", ext: "webp" },
  { id: "confetti", name: "Confetti", ext: "webp" },
  { id: "smile", name: "Smile", ext: "webp" },
  { id: "thumb", name: "Thumb", ext: "webp" },
  { id: "rocket", name: "Rocket", ext: "webp" },
  { id: "earth", name: "Earth", ext: "webp" },
  { id: "moon", name: "Moon", ext: "webp" },
  { id: "snowflake", name: "Snowflake", ext: "webp" },
  { id: "flower", name: "Flower", ext: "webp" },
  { id: "butterfly", name: "Butterfly", ext: "webp" },
  { id: "rainbow", name: "Rainbow", ext: "webp" },
  { id: "diamond", name: "Diamond", ext: "webp" },
  { id: "trophy", name: "Trophy", ext: "webp" },
  { id: "bell", name: "Bell", ext: "webp" },
  { id: "bubble", name: "Bubble", ext: "webp" },
  { id: "magic", name: "Magic", ext: "webp" },
  { id: "party", name: "Party", ext: "webp" },
  { id: "cool", name: "Cool", ext: "webp" },
  { id: "love", name: "Love", ext: "webp" }
];

interface StickerCardProps {
  sticker: typeof STICKERS[number];
  onAdd: () => void;
}

function StickerCard({ sticker, onAdd }: StickerCardProps) {
  const url = `${STICKER_BASE}/${sticker.id}.${sticker.ext}`;
  return (
    <button
      onClick={onAdd}
      className="aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer"
      title={`Add ${sticker.name}`}
    >
      <img src={url} alt={sticker.name} className="w-3/4 h-3/4 object-contain" loading="lazy" />
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
