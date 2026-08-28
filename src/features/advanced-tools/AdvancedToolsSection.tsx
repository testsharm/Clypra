import React from "react";
import { KeyframeEditorSection } from "@/features/keyframe-editor/KeyframeEditorSection";
import { AudioFXSection } from "@/features/audio-fx/AudioFXSection";
import { MaskingSection } from "@/features/masking/MaskingSection";

export const AdvancedToolsSection: React.FC = () => {
  return (
    <>
      <KeyframeEditorSection />
      <AudioFXSection />
      <MaskingSection />
    </>
  );
};
