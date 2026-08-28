import { useTimelineStore } from "@/store/timelineStore";
import { useUIStore } from "@/store/uiStore";
import { getPlaybackClock } from "@/hooks/usePlaybackClock";

export function registerTimelineShortcuts(): () => void {
  const handler = (e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const key = e.key.toLowerCase();
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
