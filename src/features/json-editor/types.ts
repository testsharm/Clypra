export interface JsonClip {
  id?: string;
  type: "video" | "audio" | "text" | "sticker" | "effect" | "filter" | "transition";
  name?: string;
  startTime: number;
  duration: number;
  trackId?: string;
  mediaId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  rotation?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  stroke?: { color: string; width: number };
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  background?: { color: string; padding: number; borderRadius: number };
  effectId?: string;
  renderer?: string;
  params?: Record<string, any>;
  intensity?: number;
  filterId?: string;
  transitionType?: string;
  visualKeyframes?: Partial<Record<string, Array<{ time: number; value: number; easing?: string }>>>;
  volumeKeyframes?: Array<{ time: number; value: number }>;
  speedKeyframes?: Array<{ time: number; speed: number }>;
  stickerUrl?: string;
  stickerEmoji?: string;
}

export interface JsonTimeline {
  clips: JsonClip[];
  transitions?: Array<{
    fromClipId: string;
    toClipId: string;
    type: string;
    duration: number;
  }>;
}
