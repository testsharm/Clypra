import { TRANSITION_PRESETS } from "@clypra-studio/engine";
import type { TransitionAsset } from "./types";

/**
 * Local transition catalog, sourced from the engine's built-in TRANSITION_PRESETS.
 * Each preset maps to a real, distinct 2D-canvas renderer (fade, slide, wipe,
 * zoom, dissolve, creative) - no duplicate/fake entries.
 */
export const LOCAL_TRANSITIONS: TransitionAsset[] = TRANSITION_PRESETS.map((preset) => ({
  id: preset.id,
  name: preset.name,
  type: "transition",
  category: preset.category,
  description: preset.description,
  thumbnail: preset.thumbnail || "",
  preview: "",
  renderer: preset.renderer,
  params: preset.params,
  duration: {
    min: preset.durationConstraints?.min ?? 0.2,
    max: preset.durationConstraints?.max ?? 3,
    default: preset.defaultDuration,
  },
  tags: preset.tags,
  isPremium: preset.isPremium,
}));
