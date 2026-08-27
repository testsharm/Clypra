/**
 * Export Preset Definitions
 *
 * Single source of truth for all export presets.
 *
 * FIX (BUG-L4): Previously PRESET_CONFIGS lived in ExportDialog.tsx and a
 * separate manual copy lived in videoExport.ts's getExportPresets(). Divergence
 * between the two was silent — UI showed one thing, export ran another. This
 * module is now imported by both to guarantee they stay in sync.
 */

import type { ExportPreset, PresetConfig } from "@/components/ui/ExportPresetCard";

export type { ExportPreset };

export const PRESET_CONFIGS: Record<ExportPreset, PresetConfig> = {
  "720p": {
    label: "720p",
    shortLabel: "720p",
    resolution: "1280×720",
    codec: "H.264",
    codecLabel: "H.264",
    tier: "fast",
    tierLabel: "Fast",
    width: 1280,
    height: 720,
    codecValue: "h264",
    preset: "ultrafast",
    crf: 28,
    pixelFormat: "yuv420p",
    estimatedBitrateMbps: 4,
  },
  "1080p": {
    label: "1080p",
    shortLabel: "1080p",
    resolution: "1920×1080",
    codec: "H.264",
    codecLabel: "H.264",
    tier: "fast",
    tierLabel: "Fast",
    width: 1920,
    height: 1080,
    codecValue: "h264",
    preset: "ultrafast",
    crf: 28,
    pixelFormat: "yuv420p",
    estimatedBitrateMbps: 8,
  },
  "1440p": {
    label: "1440p",
    shortLabel: "1440p",
    resolution: "2560×1440",
    codec: "H.264",
    codecLabel: "H.264",
    tier: "fast",
    tierLabel: "Fast",
    width: 2560,
    height: 1440,
    codecValue: "h264",
    preset: "fast",
    crf: 23,
    pixelFormat: "yuv420p",
    estimatedBitrateMbps: 16,
  },
  "4k": {
    label: "4K",
    shortLabel: "4K",
    resolution: "3840×2160",
    codec: "H.264",
    codecLabel: "H.264",
    tier: "fast",
    tierLabel: "Fast",
    width: 3840,
    height: 2160,
    codecValue: "h264",
    preset: "fast",
    crf: 23,
    pixelFormat: "yuv420p",
    estimatedBitrateMbps: 30,
  },
};

export const PRESET_ORDER: ExportPreset[] = [
  "720p",
  "1080p",
  "1440p",
  "4k",
];

