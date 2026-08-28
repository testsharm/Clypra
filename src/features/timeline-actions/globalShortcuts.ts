import { useTimelineStore } from "@/store/timelineStore";
import { useUIStore } from "@/store/uiStore";
import { getPlaybackClock } from "@/hooks/usePlaybackClock";

export function registerTimelineShortcuts(): () => void {
  const handler = (e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const key = e.key.toLowerCase();

    // SRT / ASS import shortcuts
    if (e.altKey && key === "s") {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".srt";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const { importSrtFile } = await import("@/features/srt-import/importSrt");
          const result = await importSrtFile(file);
          console.info(`[SRT Import] ${result.count} captions added`);
        } catch (err) {
          console.error("[SRT Import] failed:", err);
        }
      };
      input.click();
      return;
    }

    if (e.altKey && key === "a") {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".ass";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const { importAssFile } = await import("@/features/srt-import/importAss");
          const result = await importAssFile(file);
          console.info(`[ASS Import] ${result.count} captions added`);
        } catch (err) {
          console.error("[ASS Import] failed:", err);
        }
      };
      input.click();
      return;
    }
    const store = useTimelineStore.getState();
    const ui = useUIStore.getState();
    const selected = ui.selectedClipIds;

    if (key === "b" && selected.length > 0) {
      e.preventDefault();
      const time = getPlaybackClock().time;
      const clip = store.clips.find((c) => c.id === selected[0]);
      if (clip) {
        const splitAt = Math.min(clip.duration, Math.max(0, time - clip.startTime));
        const left = { ...clip, id: `${clip.id}-left`, duration: splitAt, trimOut: clip.trimIn + splitAt };
        const right = { ...clip, id: `${clip.id}-right`, startTime: time, duration: clip.duration - splitAt, trimIn: clip.trimIn + splitAt };
        store.withBatch(() => {
          store.removeClip(clip.id);
          store.addClip(left as any);
          store.addClip(right as any);
        });
      }
    } else if (key === "delete" && selected.length > 0) {
      e.preventDefault();
      selected.forEach((id) => store.removeClip(id));
      ui.clearSelection?.();
    } else if (key === "d" && selected.length > 0) {
      e.preventDefault();
      // Duplicate selected clips at playhead
      const time = getPlaybackClock().time;
      const newClips = selected
        .map((id) => store.clips.find((c) => c.id === id))
        .filter(Boolean)
        .map((clip: any) => ({
          ...clip,
          id: `${clip.id}-copy-${Date.now()}`,
          startTime: time,
        }));
      newClips.forEach((clip) => store.addClip(clip));
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
