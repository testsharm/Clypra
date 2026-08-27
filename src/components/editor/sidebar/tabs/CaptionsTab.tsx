import React, { useRef, useState } from "react";
import { Plus, Download, Upload, Trash2, Play, AlertCircle, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTimelineStore } from "@/store/timelineStore";
import { useProjectStore } from "@/store/projectStore";
import { useTransportControls } from "@/hooks/usePlaybackClock";
import { useCaptionStore } from "@/store/captionStore";
import { useUIStore } from "@/store/uiStore";
import { createTextClip } from "@/lib/text/textClip";
import { parseSubtitles, serializeSubtitles, formatSubtitleTime } from "@/features/subtitles/parser";
import { CAPTION_STYLE_PRESETS, getCaptionPresetById } from "@/features/subtitles/captionPresets";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@/core/platform";
import type { TabProps } from "../types";
import type { TextClip } from "@/types";

export const CaptionsTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const { clips, tracks, addClip, removeClip, updateClip, withBatch } = useTimelineStore();
  const { project } = useProjectStore();
  const { seek } = useTransportControls();
  const { captionSettings, karaokeOverlayEnabled, setKaraokeOverlayEnabled } = useCaptionStore();
  const { toggleSettingsModal } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionColor, setCaptionColor] = useState("#ffffff");
  const [captionFont, setCaptionFont] = useState("Outfit Variable");

  const mediaAssets = project?.mediaAssets || [];

  // Find the text track designated for captions
  const captionTrack = tracks.find((t) => t.type === "text" && (t.name.toLowerCase().includes("caption") || t.name.toLowerCase().includes("subtitle"))) || tracks.find((t) => t.type === "text");

  // Get all text clips belonging to the caption track
  const captionClips = captionTrack ? (clips.filter((c) => c.trackId === captionTrack.id) as TextClip[]).sort((a, b) => a.startTime - b.startTime) : [];

  // Ensure a caption track exists and return its ID.
  const ensureCaptionTrackId = (): string => {
    const previousTrack = captionTrack;
    const trackId = useTimelineStore.getState().ensureTrackForType("text");
    if (!previousTrack) {
      useTimelineStore.setState((state) => ({
        tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, name: "Auto Captions" } : t)),
      }));
    }
    return trackId;
  };

  // Trigger file import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle subtitle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const text = await file.text();
      const blocks = parseSubtitles(text);

      if (blocks.length === 0) {
        throw new Error("No subtitle blocks found. Please ensure the file is valid SRT or WebVTT.");
      }

      const trackId = ensureCaptionTrackId();
      const canvasWidth = project?.canvasWidth || 1920;
      const canvasHeight = project?.canvasHeight || 1080;

      withBatch(() => {
        blocks.forEach((block) => {
          const textClip = createTextClip({
            trackId,
            startTime: block.startTime,
            duration: Math.max(0.2, block.endTime - block.startTime),
            text: block.text,
            canvasWidth,
            canvasHeight,
            fontSize: 32,
            bold: true,
            position: "bottom",
            textRole: "caption",
            styleId: "neon-crimson",
            fontFamily: "Outfit Variable",
          });
          addClip(textClip);
        });
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse subtitle file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Export captions as SRT or VTT
  const handleExport = (format: "srt" | "vtt") => {
    if (captionClips.length === 0) return;

    const subtitleBlocks = captionClips.map((clip) => ({
      id: clip.id,
      startTime: clip.startTime,
      endTime: clip.startTime + clip.duration,
      text: clip.text,
    }));

    const content = serializeSubtitles(subtitleBlocks, format);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `captions.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add a manual caption at the current playhead time
  const handleAddManualCaption = () => {
    const trackId = ensureCaptionTrackId();
    const timeline = useTimelineStore.getState();
    const playheadTime = timeline.clips.length > 0 ? (window as any)._lastPlayheadTime || 0 : 0;

    const canvasWidth = project?.canvasWidth || 1920;
    const canvasHeight = project?.canvasHeight || 1080;

    const textClip = createTextClip({
      trackId,
      startTime: playheadTime,
      duration: 2.0,
      text: "New Caption Text",
      canvasWidth,
      canvasHeight,
      fontSize: 32,
      bold: true,
      position: "bottom",
      textRole: "caption",
      styleId: "neon-crimson",
      fontFamily: "Outfit Variable",
    });

    addClip(textClip);
  };

  // Direct update helpers
  const handleTextChange = (clipId: string, text: string) => {
    updateClip(clipId, { text } as any);
  };

  const handleTimingChange = (clipId: string, field: "startTime" | "duration", value: number) => {
    if (value < 0) return;
    updateClip(clipId, { [field]: value });
  };

  const handleApplyBatchPreset = (presetId: string) => {
    const preset = getCaptionPresetById(presetId);
    if (!preset || captionClips.length === 0) return;

    captionClips.forEach((clip) => {
      updateClip(clip.id, {
        fillColor: preset.fillColor,
        strokeColor: preset.strokeColor,
        strokeWidth: preset.strokeWidth,
        backgroundColor: preset.backgroundColor,
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        bold: preset.bold,
      } as any);
    });
  };

  const handleApplyCustomCaptionStyle = () => {
    if (captionClips.length === 0) return;
    captionClips.forEach((clip) => {
      updateClip(clip.id, {
        fillColor: captionColor,
        fontFamily: captionFont,
      } as any);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden p-3 space-y-3">
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".srt,.vtt" className="hidden" />

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={handleImportClick}>
          <Upload className="w-3.5 h-3.5 text-accent" />
          Import Subtitles
        </Button>
        <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={() => handleExport("srt")} disabled={captionClips.length === 0}>
          <Download className="w-3.5 h-3.5 text-accent" />
          Export SRT
        </Button>
      </div>

      {/* 1-Click Batch Subtitle Style Bar */}
      {captionClips.length > 0 && (
        <div className="p-2 bg-surface-raised border border-white/6 rounded-lg space-y-1.5 select-none">
          <div className="flex items-center justify-between text-[10px] text-text-muted font-medium">
            <span>Batch Style Presets ({captionClips.length} captions)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CAPTION_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyBatchPreset(preset.id)}
                className="flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-semibold rounded bg-surface border border-white/10 hover:border-accent/50 text-text-primary hover:text-accent transition-all cursor-pointer truncate"
                title={preset.description}
              >
                <Sparkles className="w-3 h-3 shrink-0 text-accent" />
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom caption style controls */}
      {captionClips.length > 0 && (
        <div className="p-2 bg-surface-raised border border-white/6 rounded-lg space-y-1.5 select-none">
          <div className="flex items-center justify-between text-[10px] text-text-muted font-medium">
            <span>Custom Caption Style</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-text-muted">Text Color</label>
            <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-text-muted">Font</label>
            <select value={captionFont} onChange={(e) => setCaptionFont(e.target.value)} className="flex-1 bg-surface border border-white/10 rounded px-1 py-1 text-[10px] text-text-primary focus:outline-none focus:border-accent cursor-pointer">
              {["Outfit Variable","Inter Variable","Poppins","Roboto Variable","Montserrat Variable","Space Grotesk Variable","Playfair Display","Nunito","Oswald","Bangers","Permanent Marker"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <button onClick={handleApplyCustomCaptionStyle} className="w-full px-2 py-1 text-[10px] font-semibold rounded bg-accent/15 hover:bg-accent/25 text-accent transition-all cursor-pointer">Apply to Captions</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={handleAddManualCaption}>
          <Plus className="w-4 h-4" />
          Add Manual
        </Button>

        <button
          onClick={() => setKaraokeOverlayEnabled(!karaokeOverlayEnabled)}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            karaokeOverlayEnabled
              ? "bg-accent/20 border-accent text-accent shadow-[0_0_12px_rgba(124,111,255,0.25)]"
              : "bg-surface border-white/10 text-text-muted hover:text-text-primary hover:border-white/20"
          }`}
          title="Toggle animated word-by-word karaoke overlay in preview"
        >
          <Sparkles className={`w-3.5 h-3.5 ${karaokeOverlayEnabled ? "text-accent" : "text-text-muted"}`} />
          Karaoke: {karaokeOverlayEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMsg}</p>
              {errorMsg.includes("not downloaded") && (
                <button onClick={toggleSettingsModal} className="mt-2 px-2 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded text-xs font-semibold transition-colors">
                  Open Settings to Download Model
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtitles timing editor */}
      <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-border">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-text-muted">Caption Timing Editor ({captionClips.length})</h4>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
          {captionClips.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl">
              <p className="text-xs text-text-muted max-w-[200px]">No captions on the timeline. Click Add Manual or Import to begin.</p>
            </div>
          ) : (
            captionClips.map((clip, index) => (
              <div key={clip.id} className="group flex flex-col p-3 bg-surface-raised hover:bg-surface-raised/80 border border-border/40 rounded-xl transition-all space-y-2 relative">
                {/* Header timing controls */}
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">#{index + 1}</span>
                    <button onClick={() => seek(clip.startTime)} className="flex items-center gap-1 hover:text-accent font-medium transition-colors" title="Jump Playhead to Start">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {formatSubtitleTime(clip.startTime, "vtt").slice(3)}
                    </button>
                    <span>➔</span>
                    <span>{formatSubtitleTime(clip.startTime + clip.duration, "vtt").slice(3)}</span>
                  </div>

                  <button onClick={() => removeClip(clip.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-destructive transition-all duration-200" title="Delete Caption">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtitle textarea */}
                <textarea value={clip.text} onChange={(e) => handleTextChange(clip.id, e.target.value)} className="w-full min-h-[50px] p-2 bg-background/50 focus:bg-background border border-border/50 focus:border-accent rounded-lg text-xs text-text-primary resize-none outline-none transition-colors" placeholder="Enter subtitle text..." />

                {/* Micro Timing controls */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-text-muted">Start:</span>
                    <input type="number" step="0.1" value={Number(clip.startTime.toFixed(2))} onChange={(e) => handleTimingChange(clip.id, "startTime", parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-background/30 border border-border/30 rounded text-center outline-none focus:border-accent text-text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-text-muted">Duration:</span>
                    <input type="number" step="0.1" min="0.1" value={Number(clip.duration.toFixed(2))} onChange={(e) => handleTimingChange(clip.id, "duration", parseFloat(e.target.value) || 0.1)} className="w-full px-1.5 py-1 bg-background/30 border border-border/30 rounded text-center outline-none focus:border-accent text-text-primary" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
