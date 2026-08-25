import { useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface WindowControlsProps {
  mac?: boolean;
  className?: string;
}

const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
const dragStyle = { WebkitAppRegion: "drag" } as React.CSSProperties;

export function WindowControls({ mac = false, className = "" }: WindowControlsProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    const checkMaximized = async () => {
      const max = await win.isMaximized();
      setIsMaximized(max);
    };
    checkMaximized();
    const unlisten = win.onResized(() => { checkMaximized(); });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const handleClose = () => getCurrentWindow().close().catch(console.error);
  const handleMinimize = () => getCurrentWindow().minimize().catch(console.error);
  const handleToggleMaximize = () => {
    const win = getCurrentWindow();
    if (isMaximized) win.unmaximize().catch(console.error);
    else win.maximize().catch(console.error);
  };

  return (
    <div className={`flex items-center gap-1 ${mac ? "flex-row-reverse" : ""} ${className}`} style={noDragStyle}>
      <button type="button" aria-label="Minimize" title="Minimize" onClick={handleMinimize}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-(--clypra-surface,#2A2A38) disabled:opacity-50 ${mac ? "order-1" : "order-1"}`} style={noDragStyle}>
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button type="button" aria-label="Maximize" title={isMaximized ? "Restore" : "Maximize"} onClick={handleToggleMaximize}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-(--clypra-surface,#2A2A38) disabled:opacity-50 ${mac ? "order-2" : "order-2"}`} style={noDragStyle}>
        <Square className="w-3.5 h-3.5" />
      </button>
      <button type="button" aria-label="Close window" title="Close" onClick={handleClose}
        className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-red-500/90 hover:text-white disabled:opacity-50 ${mac ? "order-3" : "order-3"}`} style={noDragStyle}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function isMacOSPlatform(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent.includes("Mac OS X");
}

export function WindowDragRegion({ className = "" }: { className?: string }) {
  return <div data-tauri-drag-region className={className} style={dragStyle} />;
}
