import { useTimelineStore } from "@/store/timelineStore";
import { createTextClip } from "@/lib/text/textClip";

interface SrtCue {
  start: number;
  end: number;
  text: string;
}

function parseSrt(content: string): SrtCue[] {
  const blocks = content.replace(/\r/g, "").split(/\n\n+/);
  const cues: SrtCue[] = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [startRaw, endRaw] = timeLine.split("-->").map((s) => s.trim());
    const parseTime = (t: string): number => {
      const [h, m, sec] = t.replace(",", ".").split(":").map(Number);
      return (h || 0) * 3600 + (m || 0) * 60 + (sec || 0);
    };
    const start = parseTime(startRaw);
    const end = parseTime(endRaw);
    const text = lines.filter((l) => !l.includes("-->") && !/^\d+$/.test(l.trim())).join(" ");
    if (text.trim()) cues.push({ start, end, text: text.trim() });
  }
  return cues;
}

export async function importSrtFile(file: File): Promise<{ count: number }> {
  const text = await file.text();
  const cues = parseSrt(text);
  if (cues.length === 0) throw new Error("No valid SRT cues found");

  const store = useTimelineStore.getState();
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const trackId = store.ensureTrackForType("text");

  store.withBatch(() => {
    for (const cue of cues) {
      const clip = createTextClip({
        trackId,
        startTime: cue.start,
        duration: Math.max(0.5, cue.end - cue.start),
        text: cue.text,
        canvasWidth,
        canvasHeight,
        fontSize: 48,
        position: "bottom",
        textRole: "caption",
      });
      store.addClip(clip as any);
    }
  });

  return { count: cues.length };
}
