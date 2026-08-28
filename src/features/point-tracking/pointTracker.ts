import { useUIStore } from "@/store/uiStore";
import { useTimelineStore } from "@/store/timelineStore";
import type { VisualPropertyKeyframe } from "@/types";
import { generateId } from "@/lib/utils/id";

type Point = { x: number; y: number };

const TEMPLATE_SIZE = 32;
const SEARCH_RADIUS = 24;
const MAX_KEYFRAMES = 120;

let tracking = false;
let template: { data: Uint8ClampedArray; width: number; height: number } | null = null;
let lastPoint: Point = { x: 0, y: 0 };
let intervalId: number | null = null;
let keyframeCount = 0;
let clipId: string | null = null;

export function isTracking(): boolean {
  return tracking;
}

export function startTracking(point: Point): void {
  const canvas = (window as any).__kandelPreviewCanvas as HTMLCanvasElement | undefined;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const selectedClipIds = useUIStore.getState().selectedClipIds;
  if (selectedClipIds.length === 0) return;
  clipId = selectedClipIds[0];
  lastPoint = point;

  const sx = Math.max(0, Math.min(canvas.width - TEMPLATE_SIZE, Math.round(point.x - TEMPLATE_SIZE / 2)));
  const sy = Math.max(0, Math.min(canvas.height - TEMPLATE_SIZE, Math.round(point.y - TEMPLATE_SIZE / 2)));
  const imageData = ctx.getImageData(sx, sy, TEMPLATE_SIZE, TEMPLATE_SIZE);
  const gray = new Uint8ClampedArray(TEMPLATE_SIZE * TEMPLATE_SIZE);
  for (let i = 0; i < TEMPLATE_SIZE * TEMPLATE_SIZE; i++) {
    const idx = i * 4;
    gray[i] = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
  }
  template = { data: gray, width: TEMPLATE_SIZE, height: TEMPLATE_SIZE };
  tracking = true;
  intervalId = window.setInterval(trackStep, 1000 / 30);
}

export function stopTracking(): void {
  tracking = false;
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
  template = null;
  clipId = null;
  keyframeCount = 0;
}

function trackStep(): void {
  if (!tracking || !template || !clipId) return;

  const canvas = (window as any).__kandelPreviewCanvas as HTMLCanvasElement | undefined;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const prevPoint = lastPoint;
  const searchStartX = Math.max(0, Math.round(prevPoint.x - SEARCH_RADIUS));
  const searchStartY = Math.max(0, Math.round(prevPoint.y - SEARCH_RADIUS));
  const searchEndX = Math.min(canvas.width - template.width, Math.round(prevPoint.x + SEARCH_RADIUS));
  const searchEndY = Math.min(canvas.height - template.height, Math.round(prevPoint.y + SEARCH_RADIUS));

  if (searchEndX <= searchStartX || searchEndY <= searchStartY) return;

  const searchData = ctx.getImageData(searchStartX, searchStartY, searchEndX - searchStartX, searchEndY - searchStartY);
  let bestX = prevPoint.x;
  let bestY = prevPoint.y;
  let bestScore = Number.MAX_SAFE_INTEGER;

  const tpl = template.data;
  const tplSize = template.width;
  const searchW = searchEndX - searchStartX;
  const searchH = searchEndY - searchStartY;

  for (let sy = 0; sy <= searchH - tplSize; sy++) {
    for (let sx = 0; sx <= searchW - tplSize; sx++) {
      let score = 0;
      for (let ty = 0; ty < tplSize; ty++) {
        for (let tx = 0; tx < tplSize; tx++) {
          const searchIdx = ((sy + ty) * searchW + (sx + tx)) * 4;
          const gray = (searchData.data[searchIdx] + searchData.data[searchIdx + 1] + searchData.data[searchIdx + 2]) / 3;
          score += Math.abs(gray - tpl[ty * tplSize + tx]);
        }
      }
      if (score < bestScore) {
        bestScore = score;
        bestX = searchStartX + sx + tplSize / 2;
        bestY = searchStartY + sy + tplSize / 2;
      }
    }
  }

  lastPoint = { x: bestX, y: bestY };

  const scale = (window as any).__kandelPreviewScale ?? 1;
  const offsetX = (window as any).__kandelPreviewOffsetX ?? 0;
  const offsetY = (window as any).__kandelPreviewOffsetY ?? 0;
  const projectX = (bestX - offsetX) / scale;
  const projectY = (bestY - offsetY) / scale;

  if (keyframeCount >= MAX_KEYFRAMES) return;
  keyframeCount++;

  const timelineStore = useTimelineStore.getState();
  const clip = timelineStore.clips.find((c) => c.id === clipId);
  if (!clip) return;

  const now = getCurrentClipTime(clip);
  const newX: VisualPropertyKeyframe = { id: generateId("kf"), time: now, value: projectX, easing: "linear" };
  const newY: VisualPropertyKeyframe = { id: generateId("kf"), time: now, value: projectY, easing: "linear" };

  const existingX = clip.visualKeyframes?.x ?? [];
  const existingY = clip.visualKeyframes?.y ?? [];

  timelineStore.updateClip(clipId, {
    visualKeyframes: {
      ...clip.visualKeyframes,
      x: [...existingX, newX].slice(-MAX_KEYFRAMES),
      y: [...existingY, newY].slice(-MAX_KEYFRAMES),
    },
  });
}

function getCurrentClipTime(clip: any): number {
  const clock = (window as any).__kandelPlaybackClock;
  const time = clock?.time ?? 0;
  return Math.max(0, Math.min(clip.duration, time - clip.startTime));
}
