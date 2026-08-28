import React from "react";
import type { TabProps } from "../types";
import { Music, Info } from "lucide-react";

export const AudioTab: React.FC<TabProps> = () => {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center text-text-muted">
      <Music className="w-10 h-10 mb-3 opacity-70" />
      <p className="text-sm font-semibold text-text-primary">Local Audio Library</p>
      <p className="text-xs mt-2 max-w-xs opacity-80">No audio assets bundled yet. Add local audio files to this project to build your soundtrack.</p>
      <div className="mt-4 flex items-center gap-2 text-[11px] bg-surface-raised/50 border border-border/40 rounded-lg px-3 py-2">
        <Info className="w-3.5 h-3.5 text-accent" />
        <span>Uses local JSON only — no network required</span>
      </div>
    </div>
  );
};
