import { useTimelineStore } from "@/store/timelineStore";
import { createTextClip } from "@/lib/text/textClip";

interface AssCue {
  start: number;
  end: number;
  text: string;
  style?: Record<string, string>;
  alignment?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  fontSize?: number;
  marginL?: number;
  marginR?: number;
  marginV?: number;
}

function parseAssTime(t: string): number {
  const parts = t.trim().split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = Number(parts[2]);
  return h * 3600 + m * 60 + s;
}

function parseAlignment(align: string): "left" | "center" | "right" {
  const n = Number(align);
  // ASS alignment: 1-3 bottom left/center/right, 4-6 middle, 7-9 top
  const col = (n % 3) || 3;
  if (col === 1) return "left";
  if (col === 2) return "center";
  return "right";
}

function parseColor(raw: string): string {
  // ASS &HAABBGGRR or &HBBGGRR&; simplify to RRGGBB
  const hex = raw.replace(/[&H]/gi, "").slice(0, 6);
  if (hex.length !== 6) return "#ffffff";
  const bgr = hex;
  const r = bgr.slice(4, 6);
  const g = bgr.slice(2, 4);
  const b = bgr.slice(0, 2);
  return `#${r}${g}${b}`;
}

function parseStyles(content: string): Map<string, Record<string, string>> {
  const map = new Map<string, Record<string, string>>();
  const styleSection = content.match(/\[V4\+ Styles\][\s\S]*?(?=\[|$)/i);
  if (!styleSection) return map;
  const lines = styleSection[0].split("\n");
  for (const line of lines) {
    if (!line.startsWith("Style:")) continue;
    const parts = line.slice(6).split(",").map((p) => p.trim());
    if (parts.length < 18) continue;
    map.set(parts[0], {
      name: parts[0],
      fontFamily: parts[1],
      fontSize: parts[2],
      primaryColor: parts[3],
      secondaryColor: parts[4],
      outlineColor: parts[5],
      backColor: parts[6],
      bold: parts[7],
      italic: parts[8],
      alignment: parts[18] || "2",
      marginL: parts[19] || "0",
      marginR: parts[20] || "0",
      marginV: parts[21] || "0",
    });
  }
  return map;
}

function stripOverrideTags(raw: string): { text: string; color?: string; bold?: boolean; italic?: boolean } {
  let text = raw;
  const colorMatch = raw.match(/\\c&H([0-9A-Fa-f]+)&/);
  const color = colorMatch ? parseColor(colorMatch[1]) : undefined;
  const bold = /\\b1/.test(raw);
  const italic = /\\i1/.test(raw);
  text = text.replace(/\{[^}]*\}/g, "");
  text = text.replace(/\\[Nnh]/g, "\n");
  return { text: text.trim(), color, bold, italic };
}

export async function importAssFile(file: File): Promise<{ count: number }> {
  const content = await file.text();
  const styles = parseStyles(content);
  const events = content.match(/\[Events\][\s\S]*?(?=\[|$)/i);
  if (!events) throw new Error("No [Events] section found");

  const cues: AssCue[] = [];
  const lines = events[0].split("\n");
  for (const line of lines) {
    if (!line.startsWith("Dialogue:")) continue;
    const parts = line.slice(9).split(",").map((p) => p.trim());
    if (parts.length < 9) continue;
    const start = parseAssTime(parts[1]);
    const end = parseAssTime(parts[2]);
    const styleName = parts[3];
    const style = styles.get(styleName);
    const rawText = parts.slice(9).join(",");
    const parsed = stripOverrideTags(rawText);
    if (!parsed.text) continue;

    cues.push({
      start,
      end,
      text: parsed.text,
      fontFamily: style?.fontFamily || "Arial",
      fontSize: Number(style?.fontSize || 48),
      color: parsed.color || (style ? parseColor(style.primaryColor) : "#ffffff"),
      bold: parsed.bold ?? (style?.bold === "-1"),
      italic: parsed.italic ?? (style?.italic === "-1"),
      alignment: Number(style?.alignment || 2),
      marginL: Number(style?.marginL || 0),
      marginR: Number(style?.marginR || 0),
      marginV: Number(style?.marginV || 0),
    });
  }

  if (cues.length === 0) throw new Error("No valid ASS dialogue cues found");

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
        fontSize: cue.fontSize,
        fontFamily: cue.fontFamily,
        color: cue.color,
        fontWeight: cue.bold ? 700 : 400,
        fontStyle: cue.italic ? "italic" : "normal",
        position: "bottom",
        textRole: "caption",
      });
      (clip as any).align = parseAlignment(String(cue.alignment));
      store.addClip(clip as any);
    }
  });

  return { count: cues.length };
}
