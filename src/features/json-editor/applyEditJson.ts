import { useTimelineStore } from "@/store/timelineStore";
import { useProjectStore } from "@/store/projectStore";
import { generateId } from "@/lib/utils/id";
import type { JsonTimeline } from "./types";

function ensureTrack(type: string, store: any): string {
  return store.ensureTrackForType(type);
}

export function applyEditJson(json: JsonTimeline): { added: number; errors: string[] } {
  const store = useTimelineStore.getState();
  const errors: string[] = [];
  let added = 0;

  try {
    store.withBatch(() => {
      for (const jc of json.clips) {
        try {
          const trackId = jc.trackId || ensureTrack(jc.type, store);
          const base = {
            id: jc.id || generateId("clip"),
            name: jc.name || jc.type,
            trackId,
            mediaId: jc.mediaId || "",
            startTime: jc.startTime,
            duration: jc.duration,
            trimIn: 0,
            trimOut: jc.duration,
            x: jc.x ?? 0,
            y: jc.y ?? 0,
            width: jc.width ?? 1920,
            height: jc.height ?? 1080,
            opacity: jc.opacity ?? 1,
            rotation: jc.rotation ?? 0,
          };

          let clip: any = { ...base };

          if (jc.type === "text") {
            clip = {
              ...base,
              kind: "text",
              text: jc.text || "Text",
              fontFamily: jc.fontFamily || "Inter",
              fontSize: jc.fontSize || 48,
              color: jc.color || "#ffffff",
              fontWeight: jc.fontWeight || 400,
              fontStyle: jc.fontStyle || "normal",
              stroke: jc.stroke,
              shadow: jc.shadow,
              background: jc.background,
              visualKeyframes: jc.visualKeyframes,
            };
          } else if (jc.type === "effect") {
            clip = {
              ...base,
              kind: "video-effect",
              renderer: jc.renderer || jc.effectId,
              params: jc.params || {},
              intensity: jc.intensity ?? 0.8,
            };
          } else if (jc.type === "filter") {
            clip = {
              ...base,
              kind: "filter",
              filter: { id: jc.filterId || jc.id, name: jc.name || "Custom Filter", intensity: jc.intensity ?? 1 },
            };
          } else if (jc.type === "sticker") {
            clip = {
              ...base,
              kind: "sticker",
              stickerUrl: jc.stickerUrl,
              stickerEmoji: jc.stickerEmoji,
            };
          } else {
            clip.kind = jc.type === "audio" ? "audio" : "video";
            if (jc.volumeKeyframes) clip.volumeKeyframes = jc.volumeKeyframes;
            if (jc.speedKeyframes) clip.speedKeyframes = jc.speedKeyframes;
            if (jc.visualKeyframes) clip.visualKeyframes = jc.visualKeyframes;
          }

          store.addClip(clip as any);
          added++;
        } catch (e: any) {
          errors.push(`Clip ${jc.name || jc.id || jc.type}: ${e?.message || e}`);
        }
      }

      if (json.transitions) {
        for (const tr of json.transitions) {
          try {
            store.createTransitionBetweenClips(tr.fromClipId, tr.toClipId, tr.type as any, tr.duration);
          } catch (e: any) {
            errors.push(`Transition ${tr.type}: ${e?.message || e}`);
          }
        }
      }
    });
  } catch (e: any) {
    errors.push(`Global error: ${e?.message || e}`);
  }

  return { added, errors };
}
