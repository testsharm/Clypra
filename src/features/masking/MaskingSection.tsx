import React from "react";
import { useUIStore } from "@/store/uiStore";
import { useTimelineStore } from "@/store/timelineStore";

export const MaskingSection: React.FC = () => {
  const selectedClipIds = useUIStore((s) => s.selectedClipIds);
  const clip = useTimelineStore((s) => s.clips.find((c) => c.id === selectedClipIds[0]));

  if (!clip) return null;

  const setMask = (type: "none" | "rectangle" | "ellipse", feather = 20) => {
    useTimelineStore.getState().updateClip(clip.id, {
      mask: type === "none" ? undefined : { type, feather },
    } as any);
  };

  return (
    <div className="space-y-3 p-3 bg-surface-raised/20 border border-border/40 rounded-xl">
      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Mask</p>
      <div className="flex gap-2">
        <button onClick={() => setMask("none")} className="px-2 py-1 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border/60 text-[10px] font-semibold text-text-muted cursor-pointer">
          None
        </button>
        <button onClick={() => setMask("rectangle", 20)} className="px-2 py-1 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border/60 text-[10px] font-semibold text-text-muted cursor-pointer">
          Rectangle
        </button>
        <button onClick={() => setMask("ellipse", 20)} className="px-2 py-1 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border/60 text-[10px] font-semibold text-text-muted cursor-pointer">
          Ellipse
        </button>
      </div>
    </div>
  );
};
