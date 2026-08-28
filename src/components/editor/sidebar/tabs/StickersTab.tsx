import React from "react";
import type { TabProps } from "../types";

const LOCAL_STICKERS = [
  "😀", "😂", "😍", "😎", "🥳", "😭", "😡", "😱", "🤔", "🙄",
  "💖", "💔", "🔥", "✨", "⭐", "🌈", "☀️", "🌙", "⚡", "❄️",
  "🎉", "🎂", "🎁", "🏆", "🎯", "📌", "❤️", "👍", "👎", "👏",
  "🙏", "💪", "🫶", "🤝", "👀", "💋", "💯", "🔔", "📣", "💬",
  "🧸", "🐻", "🐼", "🐨", "🦊", "🐱", "🐶", "🦄", "🐝", "🌸",
  "🍕", "🍔", "🍟", "🍩", "🍿", "☕", "🍺", "🎵", "🎶", "🎤",
  "🚀", "✈️", "🚗", "🏠", "🌍", "🏖️", "⛰️", "🏕️", "🎡", "🎢",
  "💎", "💰", "🤑", "💳", "📱", "💻", "⌚", "📷", "🎬", "🎮",
];

interface StickerCardProps {
  emoji: string;
  onAdd: () => void;
}

function StickerCard({ emoji, onAdd }: StickerCardProps) {
  return (
    <button
      onClick={onAdd}
      className="aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex items-center justify-center text-3xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      title={`Add ${emoji} sticker`}
    >
      <span className="select-none">{emoji}</span>
    </button>
  );
}

export const StickersTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const handleAddSticker = (emoji: string) => {
    onAddToTimeline?.(
      {
        id: `local-sticker-${emoji.codePointAt(0)}`,
        name: `Sticker ${emoji}`,
        kind: "sticker",
        emoji,
      },
      "stickers"
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin">
      <div className="grid grid-cols-4 gap-2">
        {LOCAL_STICKERS.map((emoji) => (
          <StickerCard key={emoji} emoji={emoji} onAdd={() => handleAddSticker(emoji)} />
        ))}
      </div>
    </div>
  );
};
