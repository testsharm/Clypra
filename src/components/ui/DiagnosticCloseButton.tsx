import React from "react";
import { X } from "lucide-react";

export const DiagnosticCloseButton: React.FC = () => {
  const handleClick = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      console.log("[DiagnosticClose] window object:", win);
      await win.close();
      console.log("[DiagnosticClose] close() succeeded");
    } catch (err) {
      console.error("[DiagnosticClose] close() failed:", err);
      alert(`Close failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      title="Diagnostic Close"
      className="w-7 h-7 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 cursor-pointer"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <X className="w-4 h-4" />
    </button>
  );
};
