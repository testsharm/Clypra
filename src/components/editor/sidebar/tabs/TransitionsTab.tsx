import React from "react";
import type { TabProps } from "../types";
import { LOCAL_TRANSITIONS } from "../../../../features/transitions/localTransitions";
import { EXTRA_TRANSITIONS } from "@/features/content-expansion/extraTransitions";

const getTransitionPreviewClass = (renderer: string): string => {
  const map: Record<string, string> = {
    fade: "preview-fade",
    dissolve: "preview-dissolve",
    slide: "preview-slide",
    wipe: "preview-wipe",
    zoom: "preview-zoom",
    push: "preview-push",
    split: "preview-split",
    spin: "preview-spin",
    blur: "preview-blur",
    flash: "preview-flash",
  };
  return map[renderer] || "preview-fade";
};

interface TransitionCardProps {
  transition: any;
  onAdd: () => void;
}

function TransitionCard({ transition, onAdd }: TransitionCardProps) {
  const previewClass = getTransitionPreviewClass(transition.renderer || transition.id);
  return (
    <button
      onClick={onAdd}
      className="w-full aspect-video bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer"
      title={`Add ${transition.name}`}
    >
      <div className={`w-full h-full relative ${previewClass}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-40" />
        <span className="absolute bottom-1 left-1 text-[8px] text-white/80 font-semibold uppercase tracking-wider">
          {transition.name}
        </span>
      </div>
    </button>
  );
}

export const TransitionsTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const [customTransitions, setCustomTransitions] = React.useState<any[]>([]);
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.transitions || [];
      setCustomTransitions(arr.filter((t: any) => t.id && t.name));
    } catch {}
  };
  const handleAddTransition = (transition: any) => {
    onAddToTimeline?.(
      {
        ...transition,
        type: "transition",
        renderer: transition.renderer || transition.id,
      },
      "transitions"
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin">
      <label className="mb-2 px-2 py-1 rounded text-[11px] font-semibold bg-accent/10 text-accent cursor-pointer inline-block">
        Import JSON
        <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
      </label>
      <div className="grid grid-cols-3 gap-2">
        {[...LOCAL_TRANSITIONS, ...EXTRA_TRANSITIONS, ...customTransitions].map((transition) => (
          <TransitionCard
            key={transition.id}
            transition={transition}
            onAdd={() => handleAddTransition(transition)}
          />
        ))}
      </div>
    </div>
  );
};
