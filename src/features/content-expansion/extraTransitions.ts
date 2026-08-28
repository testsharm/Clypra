import type { TransitionAsset } from "@/features/transitions/types";
export const EXTRA_TRANSITIONS: TransitionAsset[] = [
  { id: "x-trans-1", name: "Fade Up", type: "transition", category: "fade", description: "Fade with upward slide", thumbnail: "", preview: "", renderer: "fade", params: { direction: "up" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["fade","up"], isPremium: false },
  { id: "x-trans-2", name: "Fade Down", type: "transition", category: "fade", description: "Fade with downward slide", thumbnail: "", preview: "", renderer: "fade", params: { direction: "down" }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["fade","down"], isPremium: false },
  { id: "x-trans-3", name: "Zoom Blur", type: "transition", category: "zoom", description: "Zoom with blur", thumbnail: "", preview: "", renderer: "zoom", params: { blur: true }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["zoom","blur"], isPremium: false },
  { id: "x-trans-4", name: "Spin Fade", type: "transition", category: "creative", description: "Spin with fade", thumbnail: "", preview: "", renderer: "spin", params: { fade: true }, duration: { min: 0.2, max: 2, default: 0.5 }, tags: ["spin","fade"], isPremium: false },
  { id: "x-trans-5", name: "Glitch Wipe", type: "transition", category: "creative", description: "Glitchy wipe", thumbnail: "", preview: "", renderer: "glitch", params: {}, duration: { min: 0.1, max: 1, default: 0.3 }, tags: ["glitch","wipe"], isPremium: false }
];
