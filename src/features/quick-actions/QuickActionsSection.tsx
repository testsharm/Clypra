import React from "react";
import { useUIStore } from "@/store/uiStore";
import { useTimelineStore } from "@/store/timelineStore";

const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4, 8];

export const QuickActionsSection: React.FC = () => {
  const selectedClipIds = useUIStore((s) => s.selectedClipIds);
  const clip = useTimelineStore((s) => s.clips.find((c) => c.id === selectedClipIds[0]));

  if (!clip) return null;

  const setSpeed = (speed: number) => {
    useTimelineStore.getState().updateClip(clip.id, { speed } as any);
  };

  const toggleFreezeFrame = () => {
    const current = (clip as any).freezeFrameTime;
    const next = current === undefined ? (clip as any).duration * 0.5 : undefined;
    useTimelineStore.getState().updateClip(clip.id, { freezeFrameTime: next } as any);
  };

  return (
    <div className="space-y-3 p-3 bg-surface-raised/20 border border-border/40 rounded-xl">
      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {SPEED_PRESETS.map((speed) => (
          <button
            key={speed}
            onClick={() => setSpeed(speed)}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
              Math.abs(((clip as any).speed || 1) - speed) < 0.01
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-surface-raised hover:bg-surface-raised/80 border border-border/60 text-text-muted hover:text-text-primary"
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
      <button
        onClick={toggleFreezeFrame}
        className={`w-full px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
          (clip as any).freezeFrameTime !== undefined
            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            : "bg-surface-raised hover:bg-surface-raised/80 border border-border/60 text-text-muted hover:text-text-primary"
        }`}
      >
        {((clip as any).freezeFrameTime !== undefined) ? "Freeze Frame: ON" : "Freeze Frame: OFF"}
      </button>
    </div>
  );
};
