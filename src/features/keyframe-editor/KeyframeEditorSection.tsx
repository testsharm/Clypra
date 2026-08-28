import React from "react";
import { useUIStore } from "@/store/uiStore";
import { useTimelineStore } from "@/store/timelineStore";
import { generateId } from "@/lib/utils/id";
import type { VisualPropertyKey, VisualPropertyKeyframe } from "@/types";

const PROPERTIES: Array<{ key: VisualPropertyKey; label: string; min: number; max: number; step: number }> = [
  { key: "x", label: "X Position", min: -4000, max: 4000, step: 1 },
  { key: "y", label: "Y Position", min: -4000, max: 4000, step: 1 },
  { key: "width", label: "Width", min: 1, max: 4000, step: 1 },
  { key: "height", label: "Height", min: 1, max: 4000, step: 1 },
  { key: "opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
  { key: "rotation", label: "Rotation", min: -360, max: 360, step: 1 },
];

export const KeyframeEditorSection: React.FC = () => {
  const selectedClipIds = useUIStore((s) => s.selectedClipIds);
  const clip = useTimelineStore((s) => s.clips.find((c) => c.id === selectedClipIds[0]));

  if (!clip) return null;
  const visualKeyframes = (clip as any).visualKeyframes || {};

  const addKeyframe = (prop: VisualPropertyKey) => {
    const current = (clip as any)[prop] ?? 0;
    const time = 0;
    const kf: VisualPropertyKeyframe = { id: generateId("kf"), time, value: current, easing: "linear" };
    const list = visualKeyframes[prop] || [];
    useTimelineStore.getState().updateClip(clip.id, {
      visualKeyframes: { ...visualKeyframes, [prop]: [...list, kf] },
    } as any);
  };

  const removeKeyframe = (prop: VisualPropertyKey, id: string) => {
    const list = (visualKeyframes[prop] || []).filter((k: any) => k.id !== id);
    useTimelineStore.getState().updateClip(clip.id, {
      visualKeyframes: { ...visualKeyframes, [prop]: list },
    } as any);
  };

  const updateKeyframe = (prop: VisualPropertyKey, id: string, value: number) => {
    const list = (visualKeyframes[prop] || []).map((k: any) => (k.id === id ? { ...k, value } : k));
    useTimelineStore.getState().updateClip(clip.id, {
      visualKeyframes: { ...visualKeyframes, [prop]: list },
    } as any);
  };

  return (
    <div className="space-y-4 p-3 bg-surface-raised/20 border border-border/40 rounded-xl">
      <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Keyframe Editor</p>
      {PROPERTIES.map((prop) => {
        const kfs = visualKeyframes[prop.key] || [];
        return (
          <div key={prop.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">{prop.label}</span>
              <button onClick={() => addKeyframe(prop.key)} className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] hover:bg-accent/25 cursor-pointer">
                + Keyframe
              </button>
            </div>
            {kfs.length === 0 ? (
              <p className="text-[10px] text-text-muted">No keyframes yet</p>
            ) : (
              <div className="space-y-1.5">
                {kfs.map((kf: any) => (
                  <div key={kf.id} className="flex items-center gap-2">
                    <span className="text-[9px] text-text-muted w-12 shrink-0">t={Number(kf.time).toFixed(2)}s</span>
                    <input
                      type="number"
                      value={Number(kf.value)}
                      min={prop.min}
                      max={prop.max}
                      step={prop.step}
                      onChange={(e) => updateKeyframe(prop.key, kf.id, Number(e.target.value))}
                      className="flex-1 bg-surface-raised border border-border/60 rounded px-2 py-1 text-[10px] text-text-primary outline-none"
                    />
                    <button onClick={() => removeKeyframe(prop.key, kf.id)} className="text-red-400 hover:text-red-300 text-[10px]">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
