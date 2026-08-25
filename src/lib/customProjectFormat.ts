/**
 * Custom Project Format – Human‑readable, versioned JSON.
 *
 * This format is independent of Rust's internal structure.
 * Use it for manual editing, backups, or sharing projects.
 *
 * Schema version: 1
 */

import type { Project, MediaAsset, Track, Clip, TransitionTimelineItem, TimelineMarker, AspectRatio, CanvasBackgroundConfig } from "@/types";
import type { Gap } from "@/types/gap";

export interface CustomProjectV1 {
  schemaVersion: 1;
  project: {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    aspectRatio: AspectRatio;
    canvasWidth: number;
    canvasHeight: number;
    frameRate: 24 | 30 | 60;
    duration: number;
    thumbnail?: string;
    canvasBackground?: CanvasBackgroundConfig;
  };
  mediaAssets: MediaAsset[];
  tracks: Track[];
  clips: Clip[];
  transitions: TransitionTimelineItem[];
  gaps: Gap[];
  markers: TimelineMarker[];
}

/**
 * Convert internal project + timeline state to custom JSON format.
 */
export function toCustomProject(
  project: Project,
  timelineData: {
    tracks: Track[];
    clips: Clip[];
    transitions: TransitionTimelineItem[];
    gaps: Gap[];
    markers: TimelineMarker[];
    mediaAssets: MediaAsset[];
  },
): CustomProjectV1 {
  return {
    schemaVersion: 1,
    project: {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      aspectRatio: project.aspectRatio,
      canvasWidth: project.canvasWidth,
      canvasHeight: project.canvasHeight,
      frameRate: project.frameRate,
      duration: project.duration,
      thumbnail: project.thumbnail,
      canvasBackground: project.canvasBackground,
    },
    mediaAssets: timelineData.mediaAssets,
    tracks: timelineData.tracks,
    clips: timelineData.clips,
    transitions: timelineData.transitions,
    gaps: timelineData.gaps,
    markers: timelineData.markers,
  };
}

/**
 * Convert custom JSON format back to internal project + timeline data.
 *
 * @throws If schemaVersion is not supported.
 */
export function fromCustomProject(json: any): {
  project: Project;
  timelineData: {
    tracks: Track[];
    clips: Clip[];
    transitions: TransitionTimelineItem[];
    gaps: Gap[];
    markers: TimelineMarker[];
    mediaAssets: MediaAsset[];
  };
} {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid project JSON: expected object");
  }

  const version = json.schemaVersion;
  if (version !== 1) {
    throw new Error(`Unsupported schema version: ${version}`);
  }

  const projData = json.project;
  if (!projData) {
    throw new Error("Missing 'project' field in custom project file");
  }

  const project: Project = {
    id: projData.id,
    name: projData.name,
    createdAt: projData.createdAt,
    updatedAt: projData.updatedAt,
    aspectRatio: projData.aspectRatio,
    canvasWidth: projData.canvasWidth,
    canvasHeight: projData.canvasHeight,
    frameRate: projData.frameRate,
    duration: projData.duration,
    thumbnail: projData.thumbnail,
    canvasBackground: projData.canvasBackground,
  };

  const timelineData = {
    tracks: json.tracks || [],
    clips: json.clips || [],
    transitions: json.transitions || [],
    gaps: json.gaps || [],
    markers: json.markers || [],
    mediaAssets: json.mediaAssets || [],
  };

  return { project, timelineData };
}

/**
 * Generate a downloadable JSON blob of the custom project format.
 *
 * @param project - Current project
 * @param timelineData - Timeline state
 * @param pretty - Pretty‑print the JSON (default: true)
 * @returns Blob
 */
export function createCustomProjectBlob(
  project: Project,
  timelineData: {
    tracks: Track[];
    clips: Clip[];
    transitions: TransitionTimelineItem[];
    gaps: Gap[];
    markers: TimelineMarker[];
    mediaAssets: MediaAsset[];
  },
  pretty = true,
): Blob {
  const custom = toCustomProject(project, timelineData);
  const json = pretty ? JSON.stringify(custom, null, 2) : JSON.stringify(custom);
  return new Blob([json], { type: "application/json;charset=utf-8" });
}

/**
 * Parse a custom project JSON file (Blob or string) into internal format.
 *
 * @param input - File content as string, or Blob/File
 * @returns Parsed project and timeline data
 */
export async function parseCustomProjectFile(input: string | Blob | File): Promise<{
  project: Project;
  timelineData: {
    tracks: Track[];
    clips: Clip[];
    transitions: TransitionTimelineItem[];
    gaps: Gap[];
    markers: TimelineMarker[];
    mediaAssets: MediaAsset[];
  };
}> {
  let text: string;
  if (typeof input === "string") {
    text = input;
  } else {
    text = await input.text();
  }
  const json = JSON.parse(text);
  return fromCustomProject(json);
}
