import React from "react";
import { useTimelineStore } from "@/store/timelineStore";
import type { TextClip } from "@/types";

interface KaraokeCaptionEditorProps {
  textClip: TextClip;
  handleUpdateMultiple: (fields: Record<string, any>) => void;
}

export const KaraokeCaptionEditor: React.FC<KaraokeCaptionEditorProps> = ({
  textClip,
  handleUpdateMultiple,
}) => {
  const words = textClip.words || [];
  const wordColors = (textClip as any).wordColors || {};

  const setWordColor = (wordIndex: number, color: string) => {
    const nextColors = { ...wordColors, [wordIndex]: color };
    handleUpdateMultiple({ wordColors: nextColors });
  };

  return (
    <div className="space-y-3 p-3 bg-surface-raised/20 border border-border/40 rounded-xl">
      <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Karaoke Word Colors</p>
      {words.length === 0 ? (
        <p className="text-[10px] text-text-muted">No word timestamps available. Auto-generate captions first.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((word, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-[10px] text-text-primary">{word.word}</span>
              <input
                type="color"
                value={wordColors[idx] || "#ffffff"}
                onChange={(e) => setWordColor(idx, e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border border-border/60 bg-transparent"
                title={`Set color for "${word.word}"`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
