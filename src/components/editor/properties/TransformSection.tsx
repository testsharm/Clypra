import React, { useCallback } from "react";
import { Move, Timer, RotateCcw, FlipHorizontal2, FlipVertical2, Lock, Unlock, Crosshair, Gauge, Plus } from "lucide-react";
import { getPlaybackClock } from "@/hooks/usePlaybackClock";
import type { Clip } from "@/types";
import { type ClipFitModeExtended } from "@/lib/timeline/timelineClip";
import { PropertySlider } from "./primitives/PropertySlider";
import { PropertySelect } from "./primitives/PropertySelect";
import { PropertySection } from "./primitives/PropertySection";

interface TransformSectionProps {
  selectedClip: Clip;
  isVisualClip: boolean;
  handleUpdate: (key: string, value: any) => void;
  handleUpdateMultiple: (fields: Record<string, any>) => void;
  handleApplyFit: (fitMode: ClipFitModeExtended) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const FIT_OPTIONS = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
  { value: "stretch", label: "Stretch" },
  { value: "original", label: "Original" },
];

function getOpacityPercent(opacity: number): number {
  const value = Number.isFinite(opacity) ? opacity : 1;
  const normalized = value > 1 ? value / 100 : value;
  return Math.round(Math.max(0, Math.min(1, normalized)) * 100);
}

export const TransformSection: React.FC<TransformSectionProps> = ({ selectedClip, isVisualClip, handleUpdate, handleUpdateMultiple, handleApplyFit, canvasWidth = 1920, canvasHeight = 1080 }) => {
  const isAspectLocked = selectedClip.aspectRatioLocked ?? true;
  const aspectRatio = selectedClip.sourceAspectRatio ?? (selectedClip.width && selectedClip.height ? Math.abs(selectedClip.width) / Math.abs(selectedClip.height) : 16 / 9);
  const isFlippedH = selectedClip.width < 0;
  const isFlippedV = selectedClip.height < 0;
  const opacityPercent = getOpacityPercent(selectedClip.opacity);
  const speedValue = Number.isFinite(selectedClip.speed) && selectedClip.speed ? selectedClip.speed : 1;
  const speedKeyframes = selectedClip.speedKeyframes || [];

  const handleAddSpeedKeyframe = useCallback(() => {
    const playbackTime = getPlaybackClock().time;
    const rawLocalTime = playbackTime - selectedClip.startTime;
    const localTime = Math.max(0, Math.min(selectedClip.duration, rawLocalTime));
    const nextKfs = [
      ...speedKeyframes,
      { id: `spd-${Date.now()}`, time: localTime, speed: speedValue, easing: "linear" },
    ].sort((a, b) => a.time - b.time);
    handleUpdate("speedKeyframes", nextKfs);
  }, [selectedClip.startTime, selectedClip.duration, speedValue, speedKeyframes, handleUpdate]);

  const handleRemoveSpeedKeyframe = useCallback(
    (id: string) => {
      handleUpdate("speedKeyframes", speedKeyframes.filter((kf) => kf.id !== id));
    },
    [speedKeyframes, handleUpdate],
  );

  const isRotationKeyframed = (selectedClip.visualKeyframes?.rotation?.length || 0) > 0;
  const isOpacityKeyframed = (selectedClip.visualKeyframes?.opacity?.length || 0) > 0;
  const isXKeyframed = (selectedClip.visualKeyframes?.x?.length || 0) > 0;
  const isYKeyframed = (selectedClip.visualKeyframes?.y?.length || 0) > 0;
  const isWidthKeyframed = (selectedClip.visualKeyframes?.width?.length || 0) > 0;
  const isHeightKeyframed = (selectedClip.visualKeyframes?.height?.length || 0) > 0;

  const handleToggleVisualKeyframe = useCallback(
    (prop: "x" | "y" | "width" | "height" | "rotation" | "opacity", value: number) => {
      const currentKfs = selectedClip.visualKeyframes?.[prop] || [];
      const playbackTime = getPlaybackClock().time;
      const rawLocalTime = playbackTime - selectedClip.startTime;
      const localTime = Math.max(0, Math.min(selectedClip.duration, rawLocalTime));
      const existingIdx = currentKfs.findIndex((kf) => Math.abs(kf.time - localTime) < 0.05);

      let nextKfs: any[];
      if (existingIdx >= 0) {
        nextKfs = currentKfs.filter((_, idx) => idx !== existingIdx);
      } else {
        nextKfs = [...currentKfs, { id: `kf-${Date.now()}`, time: localTime, value, easing: "easeInOut" }].sort((a, b) => a.time - b.time);
      }

      handleUpdate("visualKeyframes", {
        ...(selectedClip.visualKeyframes || {}),
        [prop]: nextKfs,
      });
    },
    [selectedClip.visualKeyframes, handleUpdate],
  );

  const applyQuickAnimation = useCallback(
    (type: string) => {
      if (!selectedClip) return;
      const dur = Math.max(selectedClip.duration, 0.1);
      const mk = (time: number, value: number) => ({
        id: `kf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        time,
        value,
        easing: "linear" as const,
      });
      const nextKfs = { ...(selectedClip.visualKeyframes || {}) } as Record<string, any[]>;

      if (type === "fade-in") {
        nextKfs.opacity = [mk(0, 0), mk(dur, 1)];
        handleUpdateMultiple({ visualKeyframes: nextKfs, opacity: 1 });
      } else if (type === "fade-out") {
        nextKfs.opacity = [mk(0, 1), mk(dur, 0)];
        handleUpdateMultiple({ visualKeyframes: nextKfs, opacity: 1 });
      } else if (type === "slide-left") {
        nextKfs.x = [mk(0, selectedClip.x + 200), mk(dur, selectedClip.x)];
        handleUpdateMultiple({ visualKeyframes: nextKfs });
      } else if (type === "slide-right") {
        nextKfs.x = [mk(0, selectedClip.x - 200), mk(dur, selectedClip.x)];
        handleUpdateMultiple({ visualKeyframes: nextKfs });
      } else if (type === "zoom-in") {
        const startW = Math.round(Math.abs(selectedClip.width) * 0.7);
        const startH = Math.round(Math.abs(selectedClip.height) * 0.7);
        nextKfs.width = [mk(0, startW), mk(dur, Math.abs(selectedClip.width))];
        nextKfs.height = [mk(0, startH), mk(dur, Math.abs(selectedClip.height))];
        handleUpdateMultiple({ visualKeyframes: nextKfs });
      } else if (type === "zoom-out") {
        const endW = Math.round(Math.abs(selectedClip.width) * 0.7);
        const endH = Math.round(Math.abs(selectedClip.height) * 0.7);
        nextKfs.width = [mk(0, Math.abs(selectedClip.width)), mk(dur, endW)];
        nextKfs.height = [mk(0, Math.abs(selectedClip.height)), mk(dur, endH)];
        handleUpdateMultiple({ visualKeyframes: nextKfs });
      }
    },
    [selectedClip, handleUpdateMultiple],
  );

  const handleCenterOnCanvas = useCallback(() => {
    const w = Math.abs(selectedClip.width);
    const h = Math.abs(selectedClip.height);
    handleUpdateMultiple({
      x: Math.round((canvasWidth - w) / 2),
      y: Math.round((canvasHeight - h) / 2),
    });
  }, [selectedClip.width, selectedClip.height, canvasWidth, canvasHeight, handleUpdateMultiple]);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      const width = isFlippedH ? -Math.abs(newWidth) : Math.abs(newWidth);
      if (isAspectLocked && aspectRatio) {
        const newHeight = Math.round(Math.abs(newWidth) / aspectRatio);
        handleUpdateMultiple({
          width,
          height: isFlippedV ? -newHeight : newHeight,
        });
        return;
      }
      handleUpdate("width", width);
    },
    [handleUpdate, handleUpdateMultiple, isAspectLocked, aspectRatio, isFlippedH, isFlippedV],
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      const height = isFlippedV ? -Math.abs(newHeight) : Math.abs(newHeight);
      if (isAspectLocked && aspectRatio) {
        const newWidth = Math.round(Math.abs(newHeight) * aspectRatio);
        handleUpdateMultiple({
          height,
          width: isFlippedH ? -newWidth : newWidth,
        });
        return;
      }
      handleUpdate("height", height);
    },
    [handleUpdate, handleUpdateMultiple, isAspectLocked, aspectRatio, isFlippedH, isFlippedV],
  );

  return (
    <div className="space-y-3">
      {/* Transform Section */}
      <PropertySection title="Transform" icon={<Move className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          {/* Conform Mode (visual clips only) */}
          {isVisualClip && (
            <div className="space-y-3 border-b border-border/40 pb-3 mb-1">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <PropertySelect
                    label="Conform Mode"
                    value={selectedClip.conform?.mode ?? "fit"}
                    options={[
                      { value: "fit", label: "Fit" },
                      { value: "fill", label: "Fill" },
                      { value: "none", label: "None" },
                    ]}
                    onChange={(v) => {
                      const existing = selectedClip.conform || {
                        mode: "fit",
                        sourceWidth: selectedClip.width || 0,
                        sourceHeight: selectedClip.height || 0,
                        userScale: 1,
                        userOffsetX: 0,
                        userOffsetY: 0,
                      };
                      handleUpdate("conform", { ...existing, mode: v as any });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdate("conform", {
                      mode: "fit",
                      sourceWidth: selectedClip.conform?.sourceWidth || selectedClip.width || 0,
                      sourceHeight: selectedClip.conform?.sourceHeight || selectedClip.height || 0,
                      userScale: 1,
                      userOffsetX: 0,
                      userOffsetY: 0,
                    });
                  }}
                  className="px-2.5 py-1.5 text-[10px] font-medium bg-surface-raised border border-border/60 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all active:scale-[0.97] cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Conform Scale Slider */}
              <PropertySlider
                label="Conform Scale"
                value={Math.round((selectedClip.conform?.userScale ?? 1) * 100)}
                min={0}
                max={400}
                step={1}
                suffix="%"
                onChange={(v) => {
                  const existing = selectedClip.conform || {
                    mode: "fit",
                    sourceWidth: selectedClip.width || 0,
                    sourceHeight: selectedClip.height || 0,
                    userScale: 1,
                    userOffsetX: 0,
                    userOffsetY: 0,
                  };
                  handleUpdate("conform", { ...existing, userScale: v / 100 });
                }}
              />

              {/* Conform Offset X Slider */}
              <PropertySlider
                label="Conform Offset X"
                value={Math.round(selectedClip.conform?.userOffsetX ?? 0)}
                min={-1000}
                max={1000}
                step={1}
                suffix="px"
                onChange={(v) => {
                  const existing = selectedClip.conform || {
                    mode: "fit",
                    sourceWidth: selectedClip.width || 0,
                    sourceHeight: selectedClip.height || 0,
                    userScale: 1,
                    userOffsetX: 0,
                    userOffsetY: 0,
                  };
                  handleUpdate("conform", { ...existing, userOffsetX: v });
                }}
              />

              {/* Conform Offset Y Slider */}
              <PropertySlider
                label="Conform Offset Y"
                value={Math.round(selectedClip.conform?.userOffsetY ?? 0)}
                min={-1000}
                max={1000}
                step={1}
                suffix="px"
                onChange={(v) => {
                  const existing = selectedClip.conform || {
                    mode: "fit",
                    sourceWidth: selectedClip.width || 0,
                    sourceHeight: selectedClip.height || 0,
                    userScale: 1,
                    userOffsetX: 0,
                    userOffsetY: 0,
                  };
                  handleUpdate("conform", { ...existing, userOffsetY: v });
                }}
              />
            </div>
          )}

          {/* Position: X / Y */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-text-muted select-none">Position</span>
              <button onClick={handleCenterOnCanvas} className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-all cursor-pointer" title="Center on canvas">
                <Crosshair className="w-3 h-3" />
                Center
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[9px] text-text-muted/60 select-none">X</label>
                  <button onClick={() => handleToggleVisualKeyframe("x", selectedClip.x)} className={`w-4 h-4 rounded-full border ${isXKeyframed ? "bg-accent border-accent" : "border-border/60 hover:border-accent"} cursor-pointer`} title="Toggle X keyframe" />
                </div>
                <input type="number" value={Math.round(selectedClip.x)} onChange={(e) => handleUpdate("x", Number(e.target.value))} className="w-full bg-surface-raised border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-accent tabular-nums selectable" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[9px] text-text-muted/60 select-none">Y</label>
                  <button onClick={() => handleToggleVisualKeyframe("y", selectedClip.y)} className={`w-4 h-4 rounded-full border ${isYKeyframed ? "bg-accent border-accent" : "border-border/60 hover:border-accent"} cursor-pointer`} title="Toggle Y keyframe" />
                </div>
                <input type="number" value={Math.round(selectedClip.y)} onChange={(e) => handleUpdate("y", Number(e.target.value))} className="w-full bg-surface-raised border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-accent tabular-nums selectable" />
              </div>
            </div>
          </div>

          {/* Size: W / H + Aspect Lock */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-text-muted select-none">Size</span>
              <button onClick={() => handleUpdate("aspectRatioLocked", !isAspectLocked)} className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] rounded transition-all cursor-pointer ${isAspectLocked ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-surface-raised"}`} title={isAspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}>
                {isAspectLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isAspectLocked ? "Locked" : "Free"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[9px] text-text-muted/60 select-none">W</label>
                  <button onClick={() => handleToggleVisualKeyframe("width", Math.abs(selectedClip.width))} className={`w-4 h-4 rounded-full border ${isWidthKeyframed ? "bg-accent border-accent" : "border-border/60 hover:border-accent"} cursor-pointer`} title="Toggle W keyframe" />
                </div>
                <input type="number" value={Math.round(Math.abs(selectedClip.width))} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full bg-surface-raised border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-accent tabular-nums selectable" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[9px] text-text-muted/60 select-none">H</label>
                  <button onClick={() => handleToggleVisualKeyframe("height", Math.abs(selectedClip.height))} className={`w-4 h-4 rounded-full border ${isHeightKeyframed ? "bg-accent border-accent" : "border-border/60 hover:border-accent"} cursor-pointer`} title="Toggle H keyframe" />
                </div>
                <input type="number" value={Math.round(Math.abs(selectedClip.height))} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full bg-surface-raised border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-accent tabular-nums selectable" />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <PropertySlider
                label="Rotation"
                value={selectedClip.rotation}
                min={-180}
                max={180}
                step={1}
                suffix="°"
                onChange={(v) => handleUpdate("rotation", v)}
                keyframeActive={isRotationKeyframed}
                onToggleKeyframe={() => handleToggleVisualKeyframe("rotation", selectedClip.rotation)}
              />
            </div>
            {selectedClip.rotation !== 0 && (
              <button onClick={() => handleUpdate("rotation", 0)} className="p-1 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-all cursor-pointer mb-0.5" title="Reset rotation">
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Opacity */}
          <PropertySlider
            label="Opacity"
            value={opacityPercent}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={(v) => handleUpdate("opacity", v / 100)}
            keyframeActive={isOpacityKeyframed}
            onToggleKeyframe={() => handleToggleVisualKeyframe("opacity", opacityPercent / 100)}
          />

          {/* Speed */}
          <div className="border-t border-border/40 pt-3 mt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-text-muted select-none">Speed</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={speedValue}
                  step={0.1}
                  min={0.1}
                  max={10}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const nextSpeed = Math.min(10, Math.max(0.1, raw));
                    const sourceDuration = selectedClip.trimOut - selectedClip.trimIn;
                    handleUpdateMultiple({
                      speed: nextSpeed,
                      duration: sourceDuration / nextSpeed,
                    });
                  }}
                  className="w-16 bg-surface-raised border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-accent tabular-nums selectable"
                />
                <span className="text-[10px] text-text-muted">x</span>
              </div>
            </div>
            <PropertySlider
              label="Speed"
              value={speedValue}
              min={0.1}
              max={10}
              step={0.1}
              suffix="x"
              onChange={(v) => {
                const nextSpeed = Math.min(10, Math.max(0.1, v));
                const sourceDuration = selectedClip.trimOut - selectedClip.trimIn;
                handleUpdateMultiple({
                  speed: nextSpeed,
                  duration: sourceDuration / nextSpeed,
                });
              }}
            />
            <div className="flex gap-1 mt-2">
              {[0.25, 0.5, 1, 2, 4, 10].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    const sourceDuration = selectedClip.trimOut - selectedClip.trimIn;
                    handleUpdateMultiple({
                      speed: preset,
                      duration: sourceDuration / preset,
                    });
                  }}
                  className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition-all cursor-pointer ${speedValue === preset ? "bg-accent/15 text-accent border-accent" : "bg-surface-raised text-text-muted border-border/60 hover:text-text-primary hover:border-accent/40"}`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* Speed Ramp Points */}
          <div className="mt-2 border-t border-border/40 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-text-muted select-none">Speed Ramp</span>
              <button
                onClick={handleAddSpeedKeyframe}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-accent/10 border border-accent/20 text-accent rounded hover:bg-accent/15 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Point
              </button>
            </div>
            {speedKeyframes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {speedKeyframes.map((kf: any) => (
                  <span key={kf.id} className="inline-flex items-center gap-1 rounded bg-surface-raised border border-border/50 px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
                    <input
                      type="number"
                      value={kf.time}
                      step={0.1}
                      min={0}
                      max={selectedClip.duration}
                      onChange={(e) => {
                        const val = Math.min(selectedClip.duration, Math.max(0, Number(e.target.value)));
                        const nextKfs = speedKeyframes.map((item) => item.id === kf.id ? { ...item, time: val } : item).sort((a,b)=>a.time-b.time);
                        handleUpdate("speedKeyframes", nextKfs);
                      }}
                      className="w-10 bg-bg border border-border/60 rounded px-1 py-0.5 text-[9px] text-text-primary outline-none focus:border-accent tabular-nums selectable"
                    />
                    s
                    <input
                      type="number"
                      value={kf.speed}
                      step={0.1}
                      min={0.1}
                      max={10}
                      onChange={(e) => {
                        const val = Math.min(10, Math.max(0.1, Number(e.target.value)));
                        const nextKfs = speedKeyframes.map((item) => item.id === kf.id ? { ...item, speed: val } : item);
                        handleUpdate("speedKeyframes", nextKfs);
                      }}
                      className="w-12 bg-bg border border-border/60 rounded px-1 py-0.5 text-[9px] text-text-primary outline-none focus:border-accent tabular-nums selectable"
                    />
                    x
                    <button
                      onClick={() => handleRemoveSpeedKeyframe(kf.id)}
                      className="text-text-muted hover:text-red-400 cursor-pointer"
                      title="Remove speed point"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Flip buttons */}
          <div>
            <span className="text-[10px] font-medium text-text-muted select-none block mb-1.5">Flip</span>
            <div className="flex gap-2">
              <button onClick={() => handleUpdate("width", -selectedClip.width)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${isFlippedH ? "bg-accent/15 text-accent border-accent/30" : "bg-surface-raised text-text-muted border-border/60 hover:text-text-primary hover:bg-surface-raised/80"}`} title="Flip Horizontal">
                <FlipHorizontal2 className="w-3.5 h-3.5" />
                Horizontal
              </button>
              <button onClick={() => handleUpdate("height", -selectedClip.height)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${isFlippedV ? "bg-accent/15 text-accent border-accent/30" : "bg-surface-raised text-text-muted border-border/60 hover:text-text-primary hover:bg-surface-raised/80"}`} title="Flip Vertical">
                <FlipVertical2 className="w-3.5 h-3.5" />
                Vertical
              </button>
            </div>
          </div>
        </div>
      </PropertySection>

      {/* Quick Animations */}
      <div className="border-t border-border/40 pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-text-muted select-none">Quick Animations</span>
          {Object.values(selectedClip.visualKeyframes || {}).some((kfs: any) => kfs && kfs.length > 0) && (
            <button onClick={() => handleUpdate("visualKeyframes", {})} className="text-[9px] text-destructive hover:text-red-400 transition-colors cursor-pointer">
              Reset All
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "fade-in", label: "Fade In" },
            { id: "fade-out", label: "Fade Out" },
            { id: "slide-left", label: "Slide Left" },
            { id: "slide-right", label: "Slide Right" },
            { id: "zoom-in", label: "Zoom In" },
            { id: "zoom-out", label: "Zoom Out" },
          ].map((anim) => (
            <button
              key={anim.id}
              onClick={() => applyQuickAnimation(anim.id)}
              className="px-2 py-1.5 rounded-md bg-surface-raised border border-border/60 text-[10px] font-medium text-text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timing Section */}
      <PropertySection title="Timing" icon={<Timer className="w-3.5 h-3.5" />} defaultCollapsed>
        <div className="space-y-2.5">
          <PropertySlider label="Trim In" value={selectedClip.trimIn} min={0} max={Math.max(selectedClip.trimOut - 0.1, 0)} step={0.01} suffix="s" onChange={(v) => handleUpdate("trimIn", v)} />
          <PropertySlider label="Trim Out" value={selectedClip.trimOut} min={selectedClip.trimIn + 0.1} max={selectedClip.trimIn + selectedClip.duration + 30} step={0.01} suffix="s" onChange={(v) => handleUpdate("trimOut", v)} />
        </div>
      </PropertySection>
    </div>
  );
};
