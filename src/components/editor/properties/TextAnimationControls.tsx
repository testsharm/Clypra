/**
 * Text Animation Controls Component
 *
 * UI controls for applying entrance and exit animations to text clips.
 * Uses handleUpdate/handleUpdateMultiple props to integrate with the
 * undo/redo history system (TransformClipCommand).
 */

import React, { useCallback } from "react";
import { Sparkles } from "lucide-react";
import type { TextClip, TextAnimation } from "@/types";
import { ENTRANCE_PRESETS, EXIT_PRESETS, createDefaultAnimation } from "@/lib/text/textAnimation";
import { PropertySlider } from "./primitives/PropertySlider";
import { PropertySelect } from "./primitives/PropertySelect";
import { PropertySection } from "./primitives/PropertySection";

interface TextAnimationControlsProps {
  clip: TextClip;
  handleUpdate: (key: string, value: any) => void;
  handleUpdateMultiple: (fields: Record<string, any>) => void;
}

const EASING_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
];


const PREVIEW_KEYFRAMES = `
@keyframes kap-fade { 0% { opacity:0; } 100% { opacity:1; } }
@keyframes kap-slide-up { 0% { opacity:0; transform: translateY(24px); } 100% { opacity:1; transform: translateY(0); } }
@keyframes kap-slide-down { 0% { opacity:0; transform: translateY(-24px); } 100% { opacity:1; transform: translateY(0); } }
@keyframes kap-slide-left { 0% { opacity:0; transform: translateX(24px); } 100% { opacity:1; transform: translateX(0); } }
@keyframes kap-slide-right { 0% { opacity:0; transform: translateX(-24px); } 100% { opacity:1; transform: translateX(0); } }
@keyframes kap-zoom-in { 0% { opacity:0; transform: scale(.5); } 100% { opacity:1; transform: scale(1); } }
@keyframes kap-zoom-out { 0% { opacity:0; transform: scale(1.6); } 100% { opacity:1; transform: scale(1); } }
@keyframes kap-pop { 0% { opacity:0; transform: scale(.6); } 60% { opacity:1; transform: scale(1.15); } 100% { opacity:1; transform: scale(1); } }
@keyframes kap-bounce { 0% { opacity:0; transform: translateY(10px) scale(.8); } 50% { opacity:1; transform: translateY(-4px) scale(1.05); } 100% { opacity:1; transform: translateY(0) scale(1); } }
@keyframes kap-flip { 0% { opacity:0; transform: rotateX(90deg); } 100% { opacity:1; transform: rotateX(0); } }
@keyframes kap-rotate { 0% { opacity:0; transform: rotate(-12deg) scale(.8); } 100% { opacity:1; transform: rotate(0) scale(1); } }
`;

function getPreviewAnimation(type?: string): React.CSSProperties {
  if (!type || type === "none") return { animation: "none" };
  const map: Record<string, string> = {
    fade: "kap-fade",
    slide_up: "kap-slide-up",
    slide_down: "kap-slide-down",
    slide_left: "kap-slide-left",
    slide_right: "kap-slide-right",
    zoom_in: "kap-zoom-in",
    zoom_out: "kap-zoom-out",
    pop: "kap-pop",
    bounce: "kap-bounce",
    flip: "kap-flip",
    rotate: "kap-rotate",
  };
  const anim = map[type] || "kap-fade";
  return { animation: `${anim} 1s ease-in-out infinite alternate` };
}

function MiniTextAnimationPreview({ entrance, exit }: { entrance?: TextAnimation; exit?: TextAnimation }) {
  const activeType = entrance?.type || exit?.type || "none";
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-2 mb-3 overflow-hidden">
      <style>{PREVIEW_KEYFRAMES}</style>
      <div className="text-[10px] text-text-muted mb-1">Preview</div>
      <div className="h-8 flex items-center justify-center">
        <span key={activeType} className="text-sm font-bold text-accent" style={getPreviewAnimation(activeType)}>
          {entrance ? entrance.type : exit ? exit.type : "No animation"}
        </span>
      </div>
    </div>
  );
}

export const TextAnimationControls: React.FC<TextAnimationControlsProps> = ({ clip, handleUpdate }) => {
  const handleEntranceChange = useCallback(
    (type: string) => {
      const animation = type === "none" ? undefined : createDefaultAnimation(type as TextAnimation["type"]);
      handleUpdate("entranceAnimation", animation);
    },
    [handleUpdate],
  );

  const handleExitChange = useCallback(
    (type: string) => {
      const animation = type === "none" ? undefined : createDefaultAnimation(type as TextAnimation["type"]);
      handleUpdate("exitAnimation", animation);
    },
    [handleUpdate],
  );

  const handleEntranceDurationChange = useCallback(
    (duration: number) => {
      if (clip.entranceAnimation) {
        handleUpdate("entranceAnimation", {
          ...clip.entranceAnimation,
          duration: Math.max(0.1, Math.min(duration, clip.duration / 2)),
        });
      }
    },
    [clip.entranceAnimation, clip.duration, handleUpdate],
  );

  const handleExitDurationChange = useCallback(
    (duration: number) => {
      if (clip.exitAnimation) {
        handleUpdate("exitAnimation", {
          ...clip.exitAnimation,
          duration: Math.max(0.1, Math.min(duration, clip.duration / 2)),
        });
      }
    },
    [clip.exitAnimation, clip.duration, handleUpdate],
  );

  const handleEntranceEasingChange = useCallback(
    (easing: string) => {
      if (clip.entranceAnimation) {
        handleUpdate("entranceAnimation", {
          ...clip.entranceAnimation,
          easing: easing as TextAnimation["easing"],
        });
      }
    },
    [clip.entranceAnimation, handleUpdate],
  );

  const handleExitEasingChange = useCallback(
    (easing: string) => {
      if (clip.exitAnimation) {
        handleUpdate("exitAnimation", {
          ...clip.exitAnimation,
          easing: easing as TextAnimation["easing"],
        });
      }
    },
    [clip.exitAnimation, handleUpdate],
  );

  const entranceOptions = ENTRANCE_PRESETS.map((p) => ({ value: p.type, label: p.name }));
  const exitOptions = EXIT_PRESETS.map((p) => ({ value: p.type, label: p.name }));

  return (
    <PropertySection title="Text Animations" icon={<Sparkles className="w-3.5 h-3.5" />}>
      <MiniTextAnimationPreview entrance={clip.entranceAnimation} exit={clip.exitAnimation} />
      <div className="space-y-4">
        {/* Entrance Animation */}
        <div className="space-y-2.5">
          <PropertySelect label="Entrance" value={clip.entranceAnimation?.type || "none"} options={entranceOptions} onChange={handleEntranceChange} />

          {clip.entranceAnimation && clip.entranceAnimation.type !== "none" && (
            <div className="space-y-2.5 pl-2.5 border-l-2 border-accent/25">
              <PropertySlider label="Duration" value={clip.entranceAnimation.duration} min={0.1} max={Math.max(clip.duration / 2, 0.2)} step={0.1} suffix="s" onChange={handleEntranceDurationChange} />
              <PropertySelect label="Easing" value={clip.entranceAnimation.easing} options={EASING_OPTIONS} onChange={handleEntranceEasingChange} />
            </div>
          )}
        </div>

        {/* Exit Animation */}
        <div className="space-y-2.5">
          <PropertySelect label="Exit" value={clip.exitAnimation?.type || "none"} options={exitOptions} onChange={handleExitChange} />

          {clip.exitAnimation && clip.exitAnimation.type !== "none" && (
            <div className="space-y-2.5 pl-2.5 border-l-2 border-accent/25">
              <PropertySlider label="Duration" value={clip.exitAnimation.duration} min={0.1} max={Math.max(clip.duration / 2, 0.2)} step={0.1} suffix="s" onChange={handleExitDurationChange} />
              <PropertySelect label="Easing" value={clip.exitAnimation.easing} options={EASING_OPTIONS} onChange={handleExitEasingChange} />
            </div>
          )}
        </div>

        {/* Animation Info */}
        {(clip.entranceAnimation?.type !== "none" || clip.exitAnimation?.type !== "none") && <div className="text-[10px] text-text-muted/60 italic pt-2 border-t border-border/20 select-none">Animations preview during playback</div>}
      </div>
    </PropertySection>
  );
};
