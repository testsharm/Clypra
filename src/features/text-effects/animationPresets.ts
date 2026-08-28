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
  {
    id: "extra-fade-in-up",
    name: "Fade In Up",
    property: "y",
    keyframes: [{"time":0,"value":50,"easing":"easeOut"},{"time":0.5,"value":0,"easing":"linear"}]
  },
  {
    id: "extra-fade-in-down",
    name: "Fade In Down",
    property: "y",
    keyframes: [{"time":0,"value":-50,"easing":"easeOut"},{"time":0.5,"value":0,"easing":"linear"}]
  },
  {
    id: "extra-slide-in-left",
    name: "Slide In Left",
    property: "x",
    keyframes: [{"time":0,"value":-100,"easing":"easeOut"},{"time":0.5,"value":0,"easing":"linear"}]
  },
  {
    id: "extra-slide-in-right",
    name: "Slide In Right",
    property: "x",
    keyframes: [{"time":0,"value":100,"easing":"easeOut"},{"time":0.5,"value":0,"easing":"linear"}]
  },
  {
    id: "extra-pop",
    name: "Pop",
    property: "scale",
    keyframes: [{"time":0,"value":0.8,"easing":"easeOut"},{"time":0.3,"value":1.1,"easing":"easeInOut"},{"time":0.5,"value":1,"easing":"linear"}]
  },
  {
    id: "extra-pulse",
    name: "Pulse",
    property: "opacity",
    keyframes: [{"time":0,"value":1},{"time":0.3,"value":0.6},{"time":0.6,"value":1}]
  },
  {
    id: "extra-bounce",
    name: "Bounce",
    property: "y",
    keyframes: [{"time":0,"value":0},{"time":0.2,"value":-20},{"time":0.4,"value":0},{"time":0.6,"value":-10},{"time":0.8,"value":0}]
  },
  {
    id: "extra-shake",
    name: "Shake",
    property: "x",
    keyframes: [{"time":0,"value":0},{"time":0.1,"value":-8},{"time":0.2,"value":8},{"time":0.3,"value":-6},{"time":0.4,"value":6},{"time":0.5,"value":0}]
  },
  {
    id: "extra-rotate",
    name: "Rotate",
    property: "rotation",
    keyframes: [{"time":0,"value":0},{"time":0.5,"value":360}]
  },
  {
    id: "extra-flash",
    name: "Flash",
    property: "opacity",
    keyframes: [{"time":0,"value":0},{"time":0.15,"value":1},{"time":0.3,"value":0},{"time":0.45,"value":1}]
  },
];
export function applyTextAnimation(clip: any, presetId: string): any {
  const preset = TEXT_ANIMATION_PRESETS.find((p) => p.id === presetId);
  if (!preset) return clip;
  const keyframes = preset.keyframes.map((k) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
