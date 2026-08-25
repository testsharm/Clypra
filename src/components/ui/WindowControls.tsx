import { useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function isMacOSPlatform() {
  return navigator.platform.toLowerCase().includes("mac");
}

export function WindowDragRegion() {
  return <div style={{ WebkitAppRegion: "drag", width: "100%", height: "100%" }} />;
}

interface WindowControlsProps {
  mac?: boolean;
  className?: string;
}

export function WindowControls({ mac = false, className }: WindowControlsProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri(typeof window !== "undefined" && "__TAURI_INTERNALS__" in window);
    if (!(typeof window !== "undefined" && "__TAURI_INTERNALS__" in window)) return;

    const win = getCurrentWindow();
    const checkMaximized = async () => {
      const max = await win.isMaximized();
      setIsMaximized(max);
    };
    checkMaximized();

    const unlisten = win.onResized(() => {
      checkMaximized();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleClose = () => {
    if (isTauri) getCurrentWindow().close().catch(console.error);
  };

  const handleMinimize = () => {
    if (isTauri) getCurrentWindow().minimize().catch(console.error);
  };

  const handleToggleMaximize = () => {
    if (!isTauri) return;
    const win = getCurrentWindow();
    if (isMaximized) {
      win.unmaximize().catch(console.error);
    } else {
      win.maximize().catch(console.error);
    }
  };

  const noDragStyle = { WebkitAppRegion: "no-drag" as const };

  return (
    <div
      className={`flex items-center gap-1 ${mac ? "flex-row-reverse" : ""} ${className || ""}`}
      style={{ WebkitAppRegion: "no-drag" }}
    >
      <button
        type="button"
        aria-label="Minimize"
        title="Minimize"
        onClick={handleMinimize}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-(--clypra-surface,#2A2A38) disabled:opacity-50 ${mac ? "order-3" : "order-1"}`}
        style={noDragStyle}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label="Maximize"
        title={isMaximized ? "Restore" : "Maximize"}
        onClick={handleToggleMaximize}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-(--clypra-surface,#2A2A38) disabled:opacity-50 ${mac ? "order-2" : "order-2"}`}
        style={noDragStyle}
      >
        <Square className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label="Close window"
        title="Close"
        onClick={handleClose}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-red-500/90 hover:text-white disabled:opacity-50 ${mac ? "order-1" : "order-3"}`}
        style={noDragStyle}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

