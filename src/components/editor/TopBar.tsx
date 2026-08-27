import React, { useState, lazy, Suspense, useRef } from "react";
import { Upload, Home, Settings, Download, FolderOpen, Pencil } from "lucide-react";
import { Button } from "../ui/Button";
import { useProjectStore } from "@/store/projectStore";
import { useTimelineStore } from "@/store/timelineStore";
import { useUIStore } from "@/store/uiStore";
import { platform } from "@/core/platform";
import { WindowControls, WindowDragRegion } from "../ui/WindowControls";
import { LayoutPresetMenu } from "./layout/LayoutPresetMenu";
import { createCustomProjectBlob, parseCustomProjectFile } from "@/lib/customProjectFormat";

// Lazy load ExportDialog
const ExportDialog = lazy(() => import("../ui/ExportDialog").then((m) => ({ default: m.ExportDialog })));

function isMacOSPlatform() {
  return navigator.platform.toLowerCase().includes("mac");
}

interface TopBarProps {
  onRequestClose?: () => void;
}

const TopBarComponent: React.FC<TopBarProps> = ({ onRequestClose }) => {
  const project = useProjectStore((s) => s.project);
  const projectName = project?.name;
  const mediaAssets = useProjectStore((s) => s.mediaAssets);
  const { tracks, clips, transitions, gaps, markers } = useTimelineStore();
  const closeProject = useProjectStore((s) => s.closeProject);
  const renameProject = useProjectStore((s) => s.renameProject);
  const toggleSettingsModal = useUIStore((s) => s.toggleSettingsModal);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      closeProject();
    }
  };

  const startRename = () => {
    if (!project) return;
    setRenameValue(project.name);
    setIsRenaming(true);
  };

  const commitRename = async () => {
    if (!project || !renameValue.trim()) {
      setIsRenaming(false);
      return;
    }
    try {
      await renameProject(project.id, renameValue.trim());
      setIsRenaming(false);
    } catch (err) {
      console.error("Failed to rename project:", err);
      setIsRenaming(false);
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
        {isMacNativeWindow && <div className="pl-[76px]" />}

        <div className={`flex items-center gap-2 shrink-0 pl-1`} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} title="Back to Home" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as React.CSSProperties}>
            <Home className="w-4 h-4" />
          </Button>
        </div>

        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="text-xs font-semibold text-text-primary bg-surface-raised border border-accent/40 rounded px-2 py-0.5 outline-none selectable"
            style={{ maxWidth: "240px" }}
          />
        ) : (
          <button
            onClick={startRename}
            className="group flex items-center gap-1.5 text-xs font-semibold text-text-primary truncate max-w-[120px] sm:max-w-[240px] text-center shrink-0 hover:text-accent transition-colors cursor-pointer"
            title="Rename project"
          >
            <span className="truncate">{projectName}</span>
            <Pencil className="w-3 h-3 text-text-muted group-hover:text-accent shrink-0" />
          </button>
        )}

        <WindowDragRegion className="flex-1" />

        <div className="flex items-center gap-1.5 shrink-0" style={{ WebkitAppRegion: "no-drag" } as any}>
          <LayoutPresetMenu />

          <Button variant="ghost" size="icon-sm" onClick={toggleSettingsModal} title="Settings" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as any}>
            <Settings className="w-3.5 h-3.5" />
          </Button>

          <Button variant="default" size="sm" onClick={() => setShowExportDialog(true)} className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as any}>
            <Upload className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>

          <Button variant="ghost" size="sm" onClick={handleImportClick} title="Import custom JSON (.clypra)" className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as any}>
            <FolderOpen className="w-3.5 h-3.5 mr-1" />
            Import
          </Button>

          <Button variant="ghost" size="sm" onClick={handleExportCustom} title="Export as custom JSON (.clypra)" className="text-xs h-6 px-2.5" style={{ WebkitAppRegion: "no-drag", cursor: "pointer" } as any}>
            <Download className="w-3.5 h-3.5 mr-1" />
            JSON
          </Button>

          {platform.type === "tauri" && !isMacNativeWindow && <WindowControls className="ml-1" />}
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

