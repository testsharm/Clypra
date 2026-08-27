/**
 * Project Store
 *
 * OWNERSHIP: Project persistence orchestration (facade, not domain owner)
 * PERSISTENCE: Persistent (saves to disk via Tauri)
 * MUTABILITY: Orchestrates mutations, doesn't own mutable state
 *
 * Responsibilities:
 * - Load project metadata from disk
 * - Save project metadata to disk
 * - Manage media assets list
 * - Trigger auto-save on changes
 * - Coordinate project lifecycle (create/open/close)
 *
 * Does NOT:
 * - Own live timeline state (timelineStore is source of truth)
 * - Mutate timeline directly (delegates to timelineStore.hydrateFromProject)
 * - Manage runtime resources (ProjectSession handles that)
 *
 * Architecture principle:
 * This is a persistence facade. It reads timelineStore for save,
 * and delegates to timelineStore.hydrateFromProject() for load.
 * It NEVER directly mutates timeline state via setState().
 */

import { create } from "zustand";
import { platform } from "@/core/platform";
import type { Project, MediaAsset, TransitionTimelineItem, TimelineMarker } from "@/types";
import type { Gap } from "@/types/gap";
import { MAX_PROJECT_NAME_LENGTH } from "@/types";
import { toRustProject } from "@/types/serialization";
import { generateId } from "@/lib/utils/id";
import { convertRawConfigToDefinition } from "@/features/text-effects/lib/definitionConversion";
import { useEffectsStore } from "@/features/text-effects/store/effectsStore";
import { calculateTextClipSize } from "@/lib/text/textClip";
import { useSettingsStore } from "./settingsStore";
import { saveSnapshot, clearSnapshot } from "@/core/runtime/CrashRecoveryService";
import { lifecycleMonitor } from "@/core/monitoring/LifecycleMonitor";
import { TRACK_TYPE_CONFIG } from "@/lib/timeline/trackTypeConfig";
import { getActiveSessionOrNull } from "@/core/runtime/ProjectSession";
import { toast } from "@/lib/toast";
import { suppressAutoSave, enableAutoSave } from "./middleware/autoSaveMiddleware";
// import { TIMELINE_PPS_PER_ZOOM, TIMELINE_ZOOM_DEFAULT } from "@/lib/timelineZoom";

interface ProjectStore {
  project: Project | null;
  mediaAssets: MediaAsset[];
  recentProjects: Project[];
  toastMessage: string | null;
  toastVariant: "success" | "error" | "warning";
  lastSavedHash: string; // Added to prevent toast spam
  setToastMessage: (message: string | null, variant?: "success" | "error" | "warning") => void;
  /** Convenience: show toast with variant and auto-dismiss. */
  showToast: (message: string, variant?: "success" | "error" | "warning", durationMs?: number) => void;
  createProject: (name: string, aspectRatio: string, frameRate: 24 | 30 | 60) => void;
  createProjectFromTemplate: (templateId: string, customName?: string) => Promise<void>;
  loadProject: (
    project: Project,
    payload?: {
      tracks?: any[];
      clips?: any[];
      transitions?: TransitionTimelineItem[];
      gaps?: Gap[];
      markers?: TimelineMarker[];
      mediaAssets?: MediaAsset[];
    },
  ) => Promise<void> | void;
  addMediaAsset: (asset: MediaAsset) => void;
  updateMediaAsset: (assetId: string, updates: Partial<MediaAsset>) => void;
  removeMediaAsset: (assetId: string) => void;
  updateProject: (updates: Partial<Project>) => void;
  setProjectThumbnail: (thumbnail: string) => void;
  setRecentProjects: (projects: Project[]) => void;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  closeProject: () => Promise<void> | void;
  scheduleAutoSave: () => void;
}

const graphemeSegmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

// ✅ FIX-005: Load mutex to prevent concurrent project loads
let loadInProgress: Promise<void> | null = null;
let currentLoadId = 0;

const countGraphemes = (str: string): number => {
  return Array.from(graphemeSegmenter.segment(str)).length;
};

const truncateGraphemes = (str: string, max: number): string => {
  const segments = Array.from(graphemeSegmenter.segment(str));
  return segments
    .slice(0, max)
    .map((s) => s.segment)
    .join("");
};

const sanitizeProjectName = (name: string): string => {
  const trimmed = name.trim();
  if (countGraphemes(trimmed) === 0) return "Untitled Project";
  if (countGraphemes(trimmed) > MAX_PROJECT_NAME_LENGTH) {
    return truncateGraphemes(trimmed, MAX_PROJECT_NAME_LENGTH);
  }
  return trimmed;
};

const getAspectRatioDimensions = (ratio: string): { width: number; height: number } => {
  const map: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "4:3": { width: 1440, height: 1080 },
    "21:9": { width: 2520, height: 1080 },
  };
  return map[ratio] || map["16:9"];
};

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_SAVE_DELAY = 500; // ms

// Wire up ResourceTracker's active project ID resolver after the module is fully evaluated.
// queueMicrotask ensures this runs after all static imports are resolved (avoids TDZ issues).
// The resolver lets findLeaks() classify which tracked resources belong to a stale project.
queueMicrotask(() => {
  import("@/core/monitoring/ResourceTracker").then(({ resourceTracker }) => {
    resourceTracker.setActiveProjectIdResolver(() => useProjectStore.getState().project?.id ?? null);
  });
});

async function preloadTextEffectDefinitionsFromClips(clips: any[] | undefined): Promise<void> {
  if (!clips?.length) return;

  const styleIds = Array.from(new Set(clips.map((clip) => clip?.styleId).filter((id): id is string => typeof id === "string" && id.length > 0)));
  const embeddedDefinitions = clips.map((clip) => clip?.styleDefinition ?? clip?.style_definition).filter((definition) => definition && typeof definition.id === "string");

  if (styleIds.length === 0 && embeddedDefinitions.length === 0) return;

  try {
    const { useEffectsStore } = await import("@/features/text-effects/store/effectsStore");

    if (embeddedDefinitions.length > 0) {
      useEffectsStore.setState((state) => {
        const definitions = { ...state.definitions };
        for (const definition of embeddedDefinitions) {
          definitions[definition.id] = convertRawConfigToDefinition(definition);
        }
        return { definitions };
      });
    }

    const store = useEffectsStore.getState();
    const missingStyleIds = styleIds.filter((id) => !useEffectsStore.getState().definitions[id]);
    if (missingStyleIds.length === 0) return;

    await Promise.allSettled(missingStyleIds.map((id) => store.fetchDefinitionOnlyById(id)));
  } catch (err) {
    // Preload failed silently
  }
}

function normalizeLoadedTextEffectClipBounds(clips: any[] | undefined, project: Project): any[] {
  if (!clips?.length) return clips ?? [];

  try {
    const definitions = useEffectsStore.getState().definitions;

    return clips.map((clip) => {
      if (clip?.kind !== "text" || !clip.styleId) return clip;

      const effectDefinition = definitions[clip.styleId] ?? clip.styleDefinition;
      if (!effectDefinition) return clip;

      const nativeDefinition = effectDefinition as any;
      const nativeWidth = nativeDefinition.canvasWidth ?? nativeDefinition.width;
      const nativeHeight = nativeDefinition.canvasHeight ?? nativeDefinition.height;
      const nativeFontSize = nativeDefinition.fontSize;
      if (!nativeWidth || !nativeHeight || !nativeFontSize || !clip.fontSize) return clip;

      const nativeScale = clip.fontSize / nativeFontSize;
      const oldNativeWidth = nativeWidth * nativeScale;
      const oldNativeHeight = nativeHeight * nativeScale;
      const widthMatchesOldNative = Math.abs((clip.width ?? 0) - oldNativeWidth) <= Math.max(2, oldNativeWidth * 0.02);
      const heightMatchesOldNative = Math.abs((clip.height ?? 0) - oldNativeHeight) <= Math.max(2, oldNativeHeight * 0.02);
      if (!widthMatchesOldNative && !heightMatchesOldNative) return clip;

      const sizing = calculateTextClipSize({
        text: clip.text ?? "Text",
        fontFamily: clip.fontFamily ?? effectDefinition.font?.family ?? "Inter, system-ui, sans-serif",
        fontSize: clip.fontSize,
        fontWeight: clip.fontWeight ?? effectDefinition.font?.weight,
        letterSpacing: clip.letterSpacing ?? effectDefinition.font?.letterSpacing,
        lineHeight: clip.lineHeight ?? effectDefinition.font?.lineHeight,
        styleId: clip.styleId,
        effectDefinition,
        stroke: clip.stroke,
        shadow: clip.shadow,
        background: clip.background,
        canvasWidth: project.canvasWidth,
      });

      const centerX = (clip.x ?? 0) + (clip.width ?? sizing.width) / 2;
      const centerY = (clip.y ?? 0) + (clip.height ?? sizing.height) / 2;
      return {
        ...clip,
        x: centerX - sizing.width / 2,
        y: centerY - sizing.height / 2,
        width: sizing.width,
        height: sizing.height,
      };
    });
  } catch {
    return clips;
  }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,
  mediaAssets: [],
  recentProjects: [],
  toastMessage: null,
  toastVariant: "success" as const,
  lastSavedHash: "", // Initially empty

  setToastMessage: (message, variant) => set({ toastMessage: message, ...(variant ? { toastVariant: variant } : {}) }),

  showToast: (message, variant = "success", durationMs = 3000) => {
    set({ toastMessage: message, toastVariant: variant });
    const toastId = `project-toast-${variant}`;
    if (variant === "error") {
      toast.error(message, { id: toastId, duration: durationMs });
    } else if (variant === "warning") {
      toast.warning(message, { id: toastId, duration: durationMs });
    } else {
      toast.success(message, { id: toastId, duration: durationMs });
    }
    if (durationMs > 0) {
      setTimeout(() => set({ toastMessage: null }), durationMs);
    }
  },

  createProject: async (name, aspectRatio, frameRate) => {
    // Dispose any existing session BEFORE resetting singletons (BUG-007 fix)
    try {
      const { disposeActiveSession } = await import("@/core/runtime/ProjectSession");
      await disposeActiveSession();
    } catch {}

    // Reset all state from any previous project BEFORE creating new one
    try {
      const { resetAllProjectState } = await import("@/core/runtime/ProjectStateReset");
      await resetAllProjectState();
    } catch {}

    const sanitizedName = sanitizeProjectName(name);
    const dims = getAspectRatioDimensions(aspectRatio);
    const project: Project = {
      id: generateId("project"),
      name: sanitizedName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      aspectRatio: aspectRatio as any,
      canvasWidth: dims.width,
      canvasHeight: dims.height,
      frameRate,
      duration: 0,
      timelineSchemaVersion: 1,
    };

    set({ project, mediaAssets: [], lastSavedHash: "" });

    // Let timelineStore reset its own state
    try {
      const { useTimelineStore } = await import("./timelineStore");
      useTimelineStore.getState().hydrateFromProject({ tracks: [], clips: [], transitions: [], gaps: [] });
    } catch {}

    // Initialize runtime session
    try {
      const { createProjectSession } = await import("@/core/runtime/ProjectSession");
      await createProjectSession(project.id);
    } catch {}

    get().scheduleAutoSave();
  },

  createProjectFromTemplate: async (templateId, customName) => {
    const { getTemplateById } = await import("@/features/templates/projectTemplates");
    const template = getTemplateById(templateId);
    if (!template) {
      return;
    }

    const name = customName || template.name;
    await get().createProject(name, template.aspectRatio, template.frameRate);

    const currentProj = get().project;
    if (currentProj) {
      const updatedProj = { ...currentProj, canvasWidth: template.width, canvasHeight: template.height };
      set({ project: updatedProj });
    }

    const { useTimelineStore } = await import("./timelineStore");
    const initialTracks = template.initialTracks.map((t) => ({
      id: generateId("track"),
      type: t.type as any,
      name: t.name,
      muted: false,
      locked: false,
      visible: true,
      height: TRACK_TYPE_CONFIG[t.type as keyof typeof TRACK_TYPE_CONFIG]?.height ?? 30,
    }));

    useTimelineStore.getState().hydrateFromProject({
      tracks: initialTracks,
      clips: [],
      transitions: [],
      gaps: [],
    });
  },

  loadProject: async (project, payload) => {
    const loadId = ++currentLoadId;

    // ✅ FIX-005: Wait for previous load to complete to prevent concurrent load races
    if (loadInProgress) {
      await loadInProgress;
    }

    // Check if we were superceded while waiting for the previous load
    if (loadId !== currentLoadId) {
      return;
    }

    // Wrap load logic in a promise we can track
    loadInProgress = (async () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }
      suppressAutoSave();
      try {
        // ═══════════════════════════════════════════════════════════════════════════════
        // PHASE 1: Dispose Previous Runtime & Reset State
        // ═══════════════════════════════════════════════════════════════════════════════
        try {
          const { disposeActiveSession } = await import("@/core/runtime/ProjectSession");
          await disposeActiveSession();
        } catch (err) {}

        if (currentLoadId !== loadId) return;

        // Reset all project-scoped state BEFORE loading new project
        try {
          const { resetAllProjectState } = await import("@/core/runtime/ProjectStateReset");
          await resetAllProjectState();
        } catch (err) {}

        if (currentLoadId !== loadId) return;

        // ═══════════════════════════════════════════════════════════════════════════════
        // PHASE 2: Load Project & Media Assets
        // ═══════════════════════════════════════════════════════════════════════════════
        const providedAssets = payload?.mediaAssets ?? [];
        const recoveredAssets: MediaAsset[] = [];
        for (const clip of (payload?.clips ?? []) as any[]) {
          try {
            const mediaId = clip?.mediaId;
            if (!mediaId || !["video", "audio", "image"].includes(clip?.kind)) continue;
            if (providedAssets.some((a) => a.id === mediaId) || recoveredAssets.some((a) => a.id === mediaId)) continue;
            const sourcePath = clip?.path || clip?.audioPath || clip?.sourcePath || "";
            if (!sourcePath) continue;
            recoveredAssets.push({
              id: mediaId,
              name: clip?.name || clip?.fileName || mediaId,
              path: sourcePath,
              type: clip.kind,
              duration: typeof clip?.duration === "number" ? clip.duration : 0,
              width: typeof clip?.width === "number" ? clip.width : 0,
              height: typeof clip?.height === "number" ? clip.height : 0,
              posterFrame: clip?.posterFrame,
              coverArt: clip?.coverArt,
              size: typeof clip?.size === "number" ? clip.size : 0,
            } as MediaAsset);
          } catch {}
        }
        const mergedMediaAssets = [...providedAssets, ...recoveredAssets];
        set({ project, mediaAssets: mergedMediaAssets, lastSavedHash: "" });

        await preloadTextEffectDefinitionsFromClips(payload?.clips);
        if (currentLoadId !== loadId) return;

        // Preload filters from clips
        try {
          const { filterCacheManager } = await import("@/features/filters/cache/filterCache");
          await filterCacheManager.initialize();

          const filterClips = (payload?.clips ?? []).filter((clip: any) => clip.kind === "filter" && clip.mediaId);

          if (filterClips.length > 0) {
            for (const clip of filterClips) {
              try {
                // Check if already cached
                if (!filterCacheManager.isCached(clip.mediaId)) {
                  // Create FilterAsset from complete clip data (stored on save)
                  const filterAsset = {
                    id: clip.mediaId,
                    name: clip.name || "Filter",
                    type: "filter" as const,
                    category: clip.category || "essentials", // Use stored category
                    description: "",
                    thumbnail: "",
                    url: clip.url, // Stored URL for re-fetching if needed
                    pipeline: clip.pipeline,
                    gradingParams: clip.gradingParams, // Critical: GPU shader parameters
                    effectStack: clip.effectStack,
                  };

                  await filterCacheManager.ensureDownloaded(filterAsset as any);
                }
              } catch (err) {}
            }
          }
        } catch (err) {
          // Non-fatal - filters will be downloaded on-demand
        }

        if (currentLoadId !== loadId) return;

        // Preload text templates and their fonts with persistent caching
        try {
          const { useTemplateStore } = await import("@/features/text-templates/templateStore");
          await useTemplateStore.getState().preloadTemplatesAndFontsForClips(payload?.clips ?? []);
        } catch (err) {
          // Preload failed silently
        }

        if (currentLoadId !== loadId) return;

        // ═══════════════════════════════════════════════════════════════════════════════
        // PHASE 3: Hydrate Timeline State
        // ═══════════════════════════════════════════════════════════════════════════════
        try {
          const { useTimelineStore } = await import("./timelineStore");
          const normalizedClips = normalizeLoadedTextEffectClipBounds(payload?.clips ?? [], project);
          useTimelineStore.getState().hydrateFromProject({
            tracks: payload?.tracks ?? [],
            clips: normalizedClips,
            transitions: payload?.transitions ?? [],
            gaps: payload?.gaps ?? [],
            markers: payload?.markers ?? [],
            cleanEmptyTracks: true,
          });
        } catch (err) {
          // On error, reset timeline to empty state
          import("./timelineStore").then(({ useTimelineStore }) => useTimelineStore.getState().hydrateFromProject({ tracks: [], clips: [], transitions: [], gaps: [] })).catch(() => {});
        }

        if (currentLoadId !== loadId) return;

        // ═══════════════════════════════════════════════════════════════════════════════
        // PHASE 4: Initialize New Runtime Session
        // ═══════════════════════════════════════════════════════════════════════════════
        try {
          const { createProjectSession } = await import("@/core/runtime/ProjectSession");
          await createProjectSession(project.id);
        } catch (err) {}

        if (currentLoadId !== loadId) return;

        // ═══════════════════════════════════════════════════════════════════════════════
        // PHASE 5: Prewarm Video Decoders (Background)
        // ═══════════════════════════════════════════════════════════════════════════════
        // Eager prewarm removed to eliminate project-load/import lag.
        // The render runtime creates decoders lazily when playback starts.
      } finally {
        enableAutoSave();
        // ✅ FIX-005: Clear load mutex after completion
        loadInProgress = null;
      }
    })();

    return loadInProgress;
  },

  addMediaAsset: (asset) => {
    set((state) => {
      // Check if asset with same path already exists
      const existingAsset = state.mediaAssets.find((a) => a.path === asset.path);

      if (existingAsset) {
        return state; // No change
      }

      return {
        mediaAssets: [...state.mediaAssets, asset],
      };
    });
    get().scheduleAutoSave();

    // Trigger eager background baseline preload for video assets on project import.
    // Bounded to <=300 L0 tiles at low concurrency so tiles are warm before timeline drop.
    if (asset.type === "video" && asset.path && typeof asset.duration === "number" && asset.duration > 0) {
      // Defer baseline preloading slightly so the import UI remains responsive.
      setTimeout(() => {
        try {
          const session = getActiveSessionOrNull();
          if (session && session.state === "active") {
            session.renderRuntime.preloadAssetCoarseBaseline({
              videoPath: asset.path,
              duration: asset.duration,
            });
          }
        } catch (err) {
          console.warn("[projectStore] Failed to trigger coarse baseline preload for asset:", asset.path, err);
        }
      }, 500);
    }
  },

  updateMediaAsset: (assetId, updates) => {
    set((state) => ({
      mediaAssets: state.mediaAssets.map((a) =>
        a.id === assetId ? { ...a, ...updates } : a
      ),
    }));
    get().scheduleAutoSave();
  },

  removeMediaAsset: (assetId) => {
    set((state) => ({
      mediaAssets: state.mediaAssets.filter((a) => a.id !== assetId),
    }));
    get().scheduleAutoSave();
  },

  updateProject: (updates) => {
    set((state) => ({
      project: state.project ? { ...state.project, ...updates, updatedAt: Date.now() } : null,
    }));
    get().scheduleAutoSave();
  },

  setProjectThumbnail: (thumbnail) => {
    set((state) => {
      if (!state.project || state.project.thumbnail === thumbnail) return state;
      const updatedProject = { ...state.project, thumbnail };
      const updatedRecent = state.recentProjects.map((p) =>
        p.id === updatedProject.id ? { ...p, thumbnail } : p,
      );
      return {
        project: updatedProject,
        recentProjects: updatedRecent,
      };
    });
  },

  setRecentProjects: (projects) => {
    set({ recentProjects: projects });
  },

  renameProject: async (projectId, newName) => {
    const sanitizedName = sanitizeProjectName(newName);
    try {
      await platform.renameProject(projectId, sanitizedName);

      // Update in recent projects list
      set((state) => ({
        recentProjects: state.recentProjects.map((p) => (p.id === projectId ? { ...p, name: sanitizedName } : p)),
      }));

      // If this project is currently open, update it too
      const currentProject = get().project;
      if (currentProject && currentProject.id === projectId) {
        set((state) => ({
          project: state.project ? { ...state.project, name: sanitizedName } : null,
        }));
      }

      get().showToast("Project renamed");
    } catch (error) {
      get().showToast("Failed to rename project", "error");
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await platform.deleteProject(projectId);

      // Remove from recent projects list
      set((state) => ({
        recentProjects: state.recentProjects.filter((p) => p.id !== projectId),
      }));

      // If the deleted project is currently open, close it
      const currentProject = get().project;
      if (currentProject && currentProject.id === projectId) {
        set({ project: null, mediaAssets: [] });
      }
    } catch (error) {
      get().showToast("Failed to delete project", "error");
      throw error;
    }
  },

  closeProject: async () => {
    currentLoadId++; // Cancel any active load

    // Ensure any pending auto-save completes before closing
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null; // ✅ FIX-002: Clear timer reference to prevent stale timer from firing
      const state = get();
      const { project, mediaAssets } = state;

      if (project) {
        try {
          const { useTimelineStore } = await import("./timelineStore");
          const { tracks, clips, transitions, gaps, markers } = useTimelineStore.getState();

          // Convert camelCase to snake_case using centralized serialization
          const rustProject = toRustProject(project, { tracks, clips, transitions, gaps, markers, mediaAssets });

          await platform.saveProject(JSON.stringify(rustProject));

          get().showToast("Project saved");
        } catch (error) {
          get().showToast("Failed to save before closing", "error");
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHASE 1: Dispose Runtime Session
    // ═══════════════════════════════════════════════════════════════════════════════
    // Dispose runtime after we've saved timeline state to avoid save-read race
    try {
      const { disposeActiveSession } = await import("@/core/runtime/ProjectSession");
      await disposeActiveSession();
    } catch (err) {}

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHASE 2: Reset All Project-Scoped State (CENTRALIZED)
    // ═══════════════════════════════════════════════════════════════════════════════
    try {
      const { resetAllProjectState } = await import("@/core/runtime/ProjectStateReset");
      await resetAllProjectState();
    } catch (err) {}

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHASE 3: Clear ProjectStore State
    // ═══════════════════════════════════════════════════════════════════════════════
    const closedProjectId = get().project?.id;
    set({ project: null, mediaAssets: [], lastSavedHash: "" });

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHASE 4: Reset Timeline State
    // ═══════════════════════════════════════════════════════════════════════════════
    // Let timelineStore clear its own state
    try {
      const { useTimelineStore } = await import("./timelineStore");
      useTimelineStore.getState().hydrateFromProject({ tracks: [], clips: [], transitions: [], gaps: [] });
    } catch (err) {}

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHASE 5: Clear Crash-Recovery Snapshot & Thumbnail State
    // ═══════════════════════════════════════════════════════════════════════════════
    // On a clean close, remove the IndexedDB snapshot so we don't prompt for
    // recovery the next time the user opens the application.
    lifecycleMonitor.record("PROJECT_DISPOSE", { projectId: closedProjectId });
    clearSnapshot().catch(() => {});
    try {
      const { projectThumbnailService } = await import("@/core/thumbnails/ProjectThumbnailService");
      projectThumbnailService.reset();
    } catch {}
  },

  scheduleAutoSave: () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Respect the auto-save toggle from settings
    if (!useSettingsStore.getState().autoSave) return;

    // ✅ FIX-001: Capture project ID at schedule time to prevent cross-project corruption
    const scheduledProjectId = get().project?.id;
    if (!scheduledProjectId) return;

    autoSaveTimer = setTimeout(async () => {
      const state = get();
      const { project, mediaAssets, lastSavedHash } = state;

      if (!project) return;

      // ✅ FIX-001: Validate project hasn't changed during debounce window
      if (project.id !== scheduledProjectId) {
        return;
      }

      try {
        // Import timeline store to get tracks and clips
        const { useTimelineStore } = await import("./timelineStore");
        const { tracks, clips, transitions, gaps, markers, epoch } = useTimelineStore.getState();

        // Convert camelCase to snake_case using centralized serialization
        const rustProject = toRustProject(project, { tracks, clips, transitions, gaps, markers, mediaAssets });
        const serialized = JSON.stringify(rustProject);

        // Compute hash of the current state
        const currentHash = `${project.id}:${serialized}`;

        // Only show toast if the state has actually changed since last save
        const hasChanged = currentHash !== lastSavedHash;

        // Save regardless, but show toast only on change
        await platform.saveProject(serialized);
        if (hasChanged) {
          get().showToast("Project saved");
          set({ lastSavedHash: currentHash });
        }

        // ── Canonical Project Thumbnail Generation ───────────────────────
        try {
          const { projectThumbnailService } = await import("@/core/thumbnails/ProjectThumbnailService");
          projectThumbnailService.requestThumbnailUpdate(
            project,
            { tracks, clips, transitions, gaps, markers, mediaAssets, epoch },
            { isAutoSave: true },
          );
        } catch (_thumbError) {
          // Non-fatal background task
        }

        // ── Crash recovery snapshot ──────────────────────────────────────
        try {
          const { tracks, clips, transitions, gaps } = useTimelineStore.getState();
          lifecycleMonitor.record("AUTO_SAVE_SNAPSHOT_SAVED", { projectId: project.id });
          saveSnapshot({
            savedAt: new Date().toISOString(),
            project,
            mediaAssets,
            tracks,
            clips,
            transitions,
          }).catch(() => {});
        } catch (_snapshotError) {
          // Ignore — snapshot failures are non-fatal
        }
      } catch (error) {
        // Background operation — silent fail
      }
    }, AUTO_SAVE_DELAY);
  },
}));
