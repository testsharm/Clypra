import React, { useState, lazy, Suspense, useRef } from "react";
import { Upload, Home, Settings, Download, FolderOpen } from "lucide-react";
import { Button } from "../ui/Button";
import { useProjectStore } from "@/store/projectStore";
import { useTimelineStore } from "@/store/timelineStore";
import { useUIStore } from "@/store/uiStore";
import { platform } from "@/core/platform";
import { isMacOSPlatform, WindowControls, WindowDragRegion } from "../ui/WindowControls";
import { LayoutPresetMenu } from "./layout/LayoutPresetMenu";
import { createCustomProjectBlob, parseCustomProjectFile } from "@/lib/customProjectFormat";

// Lazy load ExportDialog
const ExportDialog = lazy(() => import("../ui/ExportDialog").then((m) => ({ default: m.ExportDialog })));

interface TopBarProps {
  onRequestClose?: () => void;
}

const TopBarComponent: React.FC<TopBarProps> = ({ onRequestClose }) => {
  const project = useProjectStore((s) => s.project);
  const projectName = project?.name;
  const mediaAssets = useProjectStore((s) => s.mediaAssets);
  const { tracks, clips, transitions, gaps, markers } = useTimelineStore();
  const closeProject = useProjectStore((s) => s.closeProject);
  const toggleSettingsModal = useUIStore((s) => s.toggleSettingsModal);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      closeProject();
    }
  };

  const handleExportCustom = () => {
    if (!project) {
      alert("No project open to export.");
      return;
    }
    try {
      const blob = createCustomProjectBlob(
        project,
        {
          tracks,
          clips,
          transitions,
          gaps,
          markers,
          mediaAssets,
        },
        true
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name || "project"}.clypra`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseCustomProjectFile(file);
      const { project: loadedProject, timelineData } = parsed;
      // Load project into store
      await loadProject(loadedProject, {
        tracks: timelineData.tracks,
        clips: timelineData.clips,
        transitions: timelineData.transitions,
        gaps: timelineData.gaps,
        markers: timelineData.markers,
        mediaAssets: timelineData.mediaAssets,
      });
      alert("Project imported successfully!");
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = "";
    }
  };

  const isMacNativeWindow = platform.type === "tauri" && isMacOSPlatform();

  return (
    <>
      <input type="file" ref={fileInputRef} accept=".clypra" onChange={handleImportFile} className="hidden" />
      <div className="h-8 shrink-0 flex items-center gap-2 px-1 select-none">
        {platform.type === "tauri" && !isMacNativeWindow && <WindowControls className="mr-1" />}

        <div className={`flex items-center gap-2 shrink-0 ${isMacNativeWindow ? "pl-[76px]" : "pl-1"}`} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} title="Back to Home" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <Home className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-xs font-semibold text-text-primary truncate max-w-[120px] sm:max-w-[240px] text-center shrink-0" title={projectName}>
          {projectName}
        </span>

        <WindowDragRegion />

        <div className="flex items-center gap-1.5 shrink-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <LayoutPresetMenu />

          <Button variant="ghost" size="icon-sm" onClick={toggleSettingsModal} title="Settings" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <Settings className="w-3.5 h-3.5" />
          </Button>

          <Button variant="default" size="sm" onClick={() => setShowExportDialog(true)} className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <Upload className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>

          <Button variant="ghost" size="sm" onClick={handleImportClick} title="Import custom JSON (.clypra)" className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <FolderOpen className="w-3.5 h-3.5 mr-1" />
            Import
          </Button>

          <Button variant="ghost" size="sm" onClick={handleExportCustom} title="Export as custom JSON (.clypra)" className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <Download className="w-3.5 h-3.5 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {showExportDialog && (
        <Suspense fallback={null}>
          <ExportDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />
        </Suspense>
      )}
    </>
  );
};

export const TopBar = React.memo(TopBarComponent);
