import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { useTimelineStore } from "@/store/timelineStore";
import { SMART_OVERLAY_PRESETS, getSmartOverlayPreset, type SmartOverlayClip } from "@/types/smartOverlay";
import type { TabProps } from "../types";

export const SmartOverlaysTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const { addClip } = useTimelineStore();

  const handleAddPreset = (presetId: string) => {
    const preset = getSmartOverlayPreset(presetId);
    if (!preset) return;
    const trackId = useTimelineStore.getState().ensureTrackForType("animated-overlay");
    const newClip: SmartOverlayClip = {
      id: `smart-overlay-${Date.now()}`,
      kind: "smart-overlay",
      overlayType: preset.category,
      trackId,
      mediaId: "",
      startTime: 1.0,
      duration: 5.0,
      trimIn: 0,
      trimOut: 5.0,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      opacity: 1,
      rotation: 0,
      content: JSON.parse(JSON.stringify(preset.defaultContent)),
      style: { ...preset.style },
    };
    addClip(newClip);
    if (onAddToTimeline) onAddToTimeline(newClip, "smart-overlays");
  };

  return (
    <div className="flex flex-col h-full bg-background text-text-primary p-4 gap-4 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        {SMART_OVERLAY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleAddPreset(preset.id)}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg border bg-white/5 border-white/10 hover:border-accent hover:bg-white/8 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-text-primary">{preset.name}</span>
            <Plus className="w-3 h-3 text-text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
};
