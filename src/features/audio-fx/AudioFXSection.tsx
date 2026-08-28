import React from "react";
import { useUIStore } from "@/store/uiStore";
import { useTimelineStore } from "@/store/timelineStore";
import { EXTRA_AUDIO_PRESETS } from "@/features/content-expansion/extraAudioPresets";

const AUDIO_PRESETS = [
  { id: "vocal-boost", name: "Vocal Boost", config: { eq: { high: 3, mid: 2, low: -1 } } },
  { id: "bass-boost", name: "Bass Boost", config: { eq: { low: 6, mid: 0, high: -2 } } },
  { id: "treble-boost", name: "Treble Boost", config: { eq: { high: 5, mid: 1, low: -1 } } },
  { id: "noise-reduction", name: "Noise Reduction", config: { noiseReduction: 0.7 } },
  { id: "compressor", name: "Compressor", config: { compressor: { threshold: -20, ratio: 4 } } },
  { id: "concert", name: "Concert", config: { reverb: 0.4, eq: { high: 2, mid: 1, low: 2 } } },
];

export const AudioFXSection: React.FC = () => {
  const selectedClipIds = useUIStore((s) => s.selectedClipIds);
  const clip = useTimelineStore((s) => s.clips.find((c) => c.id === selectedClipIds[0]));

  if (!clip) return null;
  if (clip.kind !== "audio" && !clip.mediaId) return null;

  const applyPreset = (presetId: string) => {
    const preset = AUDIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    useTimelineStore.getState().updateClip(clip.id, { audioFX: preset.config } as any);
  };

  return (
    <div className="space-y-3 p-3 bg-surface-raised/20 border border-border/40 rounded-xl">
      <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Audio FX</p>
      <div className="flex flex-wrap gap-2">
        {[...AUDIO_PRESETS, ...EXTRA_AUDIO_PRESETS].map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            className="px-2 py-1 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border/60 hover:border-green-400/50 text-[10px] font-semibold text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};
