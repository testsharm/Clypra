import { TRANSITION_PRESETS } from "@clypra-studio/engine";
import type { TransitionAsset } from "./types";

/**
 * Local transition catalog, sourced from the engine's built-in TRANSITION_PRESETS.
 * Each preset maps to a real, distinct 2D-canvas renderer (fade, slide, wipe,
 * zoom, dissolve, creative) - no duplicate/fake entries.
 */
const ENGINE_TRANSITIONS: TransitionAsset[] = TRANSITION_PRESETS.map((preset) => ({
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


const CUSTOM_TRANSITIONS: TransitionAsset[] = [
  { id: "fade-black", name: "Fade Black", type: "transition", category: "fade", description: "Fade through black", thumbnail: "", preview: "", renderer: "fade", params: { color: "#000000" }, duration: { min: 0.2, max: 3, default: 0.5 }, tags: ["fade", "black"], isPremium: false },
  { id: "fade-white", name: "Fade White", type: "transition", category: "fade", description: "Fade through white", thumbnail: "", preview: "", renderer: "fade", params: { color: "#ffffff" }, duration: { min: 0.2, max: 3, default: 0.5 }, tags: ["fade", "white"], isPremium: false },
  { id: "dissolve-fast", name: "Dissolve Fast", type: "transition", category: "dissolve", description: "Fast dissolve", thumbnail: "", preview: "", renderer: "dissolve", params: {}, duration: { min: 0.1, max: 1, default: 0.3 }, tags: ["dissolve", "fast"], isPremium: false },
  { id: "slide-up", name: "Slide Up", type: "transition", category: "slide", description: "Slide up", thumbnail: "", preview: "", renderer: "slide", params: { direction: "up" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["slide", "up"], isPremium: false },
  { id: "slide-down", name: "Slide Down", type: "transition", category: "slide", description: "Slide down", thumbnail: "", preview: "", renderer: "slide", params: { direction: "down" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["slide", "down"], isPremium: false },
  { id: "wipe-top", name: "Wipe Top", type: "transition", category: "wipe", description: "Wipe from top", thumbnail: "", preview: "", renderer: "wipe", params: { direction: "top" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["wipe", "top"], isPremium: false },
  { id: "wipe-bottom", name: "Wipe Bottom", type: "transition", category: "wipe", description: "Wipe from bottom", thumbnail: "", preview: "", renderer: "wipe", params: { direction: "bottom" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["wipe", "bottom"], isPremium: false },
  { id: "zoom-in", name: "Zoom In", type: "transition", category: "zoom", description: "Zoom in", thumbnail: "", preview: "", renderer: "zoom", params: { scale: 1.2 }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["zoom", "in"], isPremium: false },
  { id: "zoom-out", name: "Zoom Out", type: "transition", category: "zoom", description: "Zoom out", thumbnail: "", preview: "", renderer: "zoom", params: { scale: 0.8 }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["zoom", "out"], isPremium: false },
  { id: "push-left", name: "Push Left", type: "transition", category: "push", description: "Push left", thumbnail: "", preview: "", renderer: "push", params: { direction: "left" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["push", "left"], isPremium: false },
  { id: "push-right", name: "Push Right", type: "transition", category: "push", description: "Push right", thumbnail: "", preview: "", renderer: "push", params: { direction: "right" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["push", "right"], isPremium: false },
  { id: "split-vertical", name: "Split Vertical", type: "transition", category: "split", description: "Split vertical", thumbnail: "", preview: "", renderer: "split", params: { direction: "vertical" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["split", "vertical"], isPremium: false },
  { id: "split-horizontal", name: "Split Horizontal", type: "transition", category: "split", description: "Split horizontal", thumbnail: "", preview: "", renderer: "split", params: { direction: "horizontal" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["split", "horizontal"], isPremium: false },
  { id: "spin-cw", name: "Spin CW", type: "transition", category: "creative", description: "Spin clockwise", thumbnail: "", preview: "", renderer: "spin", params: { direction: "cw" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["spin", "cw"], isPremium: false },
  { id: "spin-ccw", name: "Spin CCW", type: "transition", category: "creative", description: "Spin counter-clockwise", thumbnail: "", preview: "", renderer: "spin", params: { direction: "ccw" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["spin", "ccw"], isPremium: false },
  { id: "blur-fade", name: "Blur Fade", type: "transition", category: "creative", description: "Blur fade", thumbnail: "", preview: "", renderer: "blur", params: {}, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["blur", "fade"], isPremium: false },
  { id: "flash-black", name: "Flash Black", type: "transition", category: "creative", description: "Flash black", thumbnail: "", preview: "", renderer: "flash", params: { color: "#000000" }, duration: { min: 0.1, max: 1, default: 0.3 }, tags: ["flash", "black"], isPremium: false },
  { id: "flash-white", name: "Flash White", type: "transition", category: "creative", description: "Flash white", thumbnail: "", preview: "", renderer: "flash", params: { color: "#ffffff" }, duration: { min: 0.1, max: 1, default: 0.3 }, tags: ["flash", "white"], isPremium: false },
];

export const LOCAL_TRANSITIONS: TransitionAsset[] = [...ENGINE_TRANSITIONS, ...CUSTOM_TRANSITIONS];

