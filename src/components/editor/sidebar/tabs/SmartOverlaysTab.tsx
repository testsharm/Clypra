import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, Plus, Sliders, TrendingUp, Quote, Columns, Code, List, Clock, Share2, User } from "lucide-react";
import { useTimelineStore } from "@/store/timelineStore";
import { SMART_OVERLAY_PRESETS, getSmartOverlayPreset, type SmartOverlayType, type SmartOverlayClip } from "@/types/smartOverlay";
import { smartOverlayCacheManager, type CachedSmartOverlay } from "@/features/smart-overlays/cache/smartOverlayCache";
import type { TabProps } from "../types";

export const SmartOverlaysTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const { clips, addClip, updateClip } = useTimelineStore();
  const [selectedCategory, setSelectedCategory] = useState<SmartOverlayType | "all">("all");
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [cachedItems, setCachedItems] = useState<CachedSmartOverlay[]>([]);

  useEffect(() => {
    void smartOverlayCacheManager.initialize().then(() => {
      setCachedItems(smartOverlayCacheManager.getAllCached());
    });
  }, []);

  const selectedClip = clips.find((c) => c.kind === "smart-overlay" && (selectedClipId ? c.id === selectedClipId : true)) as SmartOverlayClip | undefined;

  const categories: { id: SmartOverlayType | "all"; label: string; icon: any }[] = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "stat", label: "Stats", icon: TrendingUp },
    { id: "quote", label: "Quotes", icon: Quote },
    { id: "comparison", label: "Compare", icon: Columns },
    { id: "code", label: "Code", icon: Code },
    { id: "list", label: "Lists", icon: List },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "social", label: "Social", icon: Share2 },
    { id: "lower-third", label: "Lower 3rd", icon: User },
  ];

  const customPresets = useMemo(() => {
    return cachedItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.clipData.overlayType,
      description: "Custom overlay cached from Kandel Studio",
      defaultContent: item.clipData.content,
      style: item.clipData.style,
      isCustom: true,
    }));
  }, [cachedItems]);

  const allPresets = useMemo(() => [...SMART_OVERLAY_PRESETS, ...customPresets], [customPresets]);
  const filteredPresets = selectedCategory === "all" ? allPresets : allPresets.filter((p) => p.category === selectedCategory);

  const handleAddPreset = (presetId: string) => {
    let preset = allPresets.find((p) => p.id === presetId);
    if (!preset) preset = getSmartOverlayPreset(presetId);
    if (!preset) return;
    const trackId = useTimelineStore.getState().ensureTrackForType("animated-overlay");
    const newClip: SmartOverlayClip = {
      id: `smart-overlay-${Date.now()}`,
      kind: "smart-overlay",
      overlayType: preset.category,
      trackId,
      mediaId: "",
      startTime: 1.0,
      duration: 5.0,
      trimIn: 0,
      trimOut: 5.0,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      opacity: 1,
      rotation: 0,
      content: JSON.parse(JSON.stringify(preset.defaultContent)),
      style: { ...preset.style },
    };
    addClip(newClip);
    setSelectedClipId(newClip.id);
    if (onAddToTimeline) onAddToTimeline(newClip, "smart-overlays");
  };

  return (
    <div className="flex flex-col h-full bg-background text-text-primary p-4 gap-4 overflow-y-auto">
      <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? "bg-accent text-white" : "bg-white/5 text-text-muted hover:bg-white/10"}`}>
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {filteredPresets.map((preset) => (
          <div key={preset.id} onClick={() => handleAddPreset(preset.id)} className="flex flex-col p-3 rounded-lg border bg-white/5 border-white/10 hover:border-accent hover:bg-white/8 cursor-pointer transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                {preset.name}
                {preset.isCustom && <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono">Cached Studio</span>}
              </span>
              <Plus className="w-3.5 h-3.5 text-text-muted hover:text-white" />
            </div>
            <p className="text-[11px] text-text-muted line-clamp-2">{preset.description}</p>
          </div>
        ))}
      </div>

      {selectedClip && (
        <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-accent">
            <span className="flex items-center gap-1.5"><Sliders className="w-4 h-4" /> Customize ({selectedClip.overlayType.toUpperCase()})</span>
          </div>
          {selectedClip.content.type === "stat" && (
            <>
              <input value={selectedClip.content.data.value} onChange={(e) => updateClip(selectedClip.id, { content: { ...selectedClip.content, data: { ...selectedClip.content.data, value: e.target.value } } } as any)} className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent font-bold" />
              <input value={selectedClip.content.data.label} onChange={(e) => updateClip(selectedClip.id, { content: { ...selectedClip.content, data: { ...selectedClip.content.data, label: e.target.value } } } as any)} className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent" />
            </>
          )}
          {selectedClip.content.type === "code" && (
            <textarea value={selectedClip.content.data.code} rows={3} onChange={(e) => updateClip(selectedClip.id, { content: { ...selectedClip.content, data: { ...selectedClip.content.data, code: e.target.value } } } as any)} className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-accent resize-none" />
          )}
        </div>
      )}
    </div>
  );
};
