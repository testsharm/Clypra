import { generateId } from "@/lib/utils/id";
import type { VisualPropertyKeyframe, EasingType } from "@/types";

export interface TextAnimationPreset {
  id: string;
  name: string;
  property: "x" | "y" | "opacity" | "rotation" | "scale";
  keyframes: Array<{ time: number; value: number; easing?: EasingType }>;
}

function kf(time: number, value: number, easing: EasingType = "linear"): VisualPropertyKeyframe {
  return { id: generateId("kf"), time, value, easing };
}

export const TEXT_ANIMATION_PRESETS: TextAnimationPreset[] = [
  {
    id: "fade-in",
    name: "Fade In",
    property: "opacity",
    keyframes: [
      { time: 0, value: 0, easing: "easeOut" },
      { time: 0.5, value: 1, easing: "linear" },
    ],
  },
  {
    id: "fade-out",
    name: "Fade Out",
    property: "opacity",
    keyframes: [
      { time: 0, value: 1, easing: "linear" },
      { time: 0.5, value: 0, easing: "easeIn" },
    ],
  },
  {
    id: "slide-up",
    name: "Slide Up",
    property: "y",
    keyframes: [
      { time: 0, value: 100, easing: "easeOut" },
      { time: 0.5, value: 0, easing: "linear" },
    ],
  },
  {
    id: "slide-down",
    name: "Slide Down",
    property: "y",
    keyframes: [
      { time: 0, value: -100, easing: "easeOut" },
      { time: 0.5, value: 0, easing: "linear" },
    ],
  },
  {
    id: "slide-left",
    name: "Slide Left",
    property: "x",
    keyframes: [
      { time: 0, value: 100, easing: "easeOut" },
      { time: 0.5, value: 0, easing: "linear" },
    ],
  },
  {
    id: "slide-right",
    name: "Slide Right",
    property: "x",
    keyframes: [
      { time: 0, value: -100, easing: "easeOut" },
      { time: 0.5, value: 0, easing: "linear" },
    ],
  },
  {
    id: "bounce",
    name: "Bounce",
    property: "y",
    keyframes: [
      { time: 0, value: 0, easing: "easeOut" },
      { time: 0.2, value: -20, easing: "easeIn" },
      { time: 0.4, value: 0, easing: "easeOut" },
      { time: 0.6, value: -10, easing: "easeIn" },
      { time: 0.8, value: 0, easing: "linear" },
    ],
  },
  {
    id: "pulse",
    name: "Pulse",
    property: "opacity",
    keyframes: [
      { time: 0, value: 1, easing: "linear" },
      { time: 0.3, value: 0.5, easing: "easeInOut" },
      { time: 0.6, value: 1, easing: "linear" },
    ],
  },
];

export function applyTextAnimation(clip: any, presetId: string): any {
  const preset = TEXT_ANIMATION_PRESETS.find((p) => p.id === presetId);
  if (!preset) return clip;
  const keyframes = preset.keyframes.map((k) => ({
    id: generateId("kf"),
    time: k.time,
    value: k.value,
    easing: k.easing || "linear",
  }));
  return {
    ...clip,
    visualKeyframes: {
      ...clip.visualKeyframes,
      [preset.property]: keyframes,
    },
  };
}
