import { useTimelineStore } from "@/store/timelineStore";
import type { JsonTimeline, JsonClip } from "./types";

export function exportEditJson(): JsonTimeline {
  const store = useTimelineStore.getState();
  const clips: JsonClip[] = store.clips.map((clip: any) => ({
    id: clip.id,
    type: clip.kind === "text" ? "text" : clip.kind === "video-effect" ? "effect" : clip.kind === "filter" ? "filter" : clip.kind === "sticker" ? "sticker" : clip.kind === "audio" ? "audio" : "video",
    name: clip.name,
    startTime: clip.startTime,
    duration: clip.duration,
    trackId: clip.trackId,
    mediaId: clip.mediaId,
    x: clip.x,
    y: clip.y,
    width: clip.width,
    height: clip.height,
    opacity: clip.opacity,
    rotation: clip.rotation,
    text: clip.text,
    fontFamily: clip.fontFamily,
    fontSize: clip.fontSize,
    color: clip.color,
    fontWeight: clip.fontWeight,
    fontStyle: clip.fontStyle,
    stroke: clip.stroke,
    shadow: clip.shadow,
    background: clip.background,
    effectId: clip.renderer || clip.effectId,
    renderer: clip.renderer,
    params: clip.params,
    intensity: clip.intensity,
    filterId: clip.filter?.id,
    stickerUrl: clip.stickerUrl,
    stickerEmoji: clip.stickerEmoji,
    visualKeyframes: clip.visualKeyframes,
    volumeKeyframes: clip.volumeKeyframes,
    speedKeyframes: clip.speedKeyframes,
  }));

  const transitions = store.transitions.map((t: any) => ({
    fromClipId: t.fromClipId,
    toClipId: t.toClipId,
    type: t.type,
    duration: t.duration,
  }));

  return { clips, transitions };
}

export function downloadEditJson(): void {
  const data = exportEditJson();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kandel-edit.json";
  a.click();
  URL.revokeObjectURL(url);
}
