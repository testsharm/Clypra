import { describe, it, expect } from "vitest";
import { PreviewQualityManager, PreviewQualityTier } from "../PreviewQualityManager";

describe("PreviewQualityManager byte reduction", () => {
  it("reduces 4K preview frame bytes during playback and interaction", () => {
    const fullWidth = 3840;
    const fullHeight = 2160;
    const fullBytes = fullWidth * fullHeight * 4;

    const manager = new PreviewQualityManager({
      sequenceWidth: fullWidth,
      sequenceHeight: fullHeight,
      viewportWidth: 1280,
      viewportHeight: 720,
      dpr: 1,
    });

    const playback = manager.getRenderProfile(PreviewQualityTier.Playback);
    const interaction = manager.getRenderProfile(PreviewQualityTier.Interaction);
    const playbackBytes = playback.maxWidth * playback.maxHeight * 4;
    const interactionBytes = interaction.maxWidth * interaction.maxHeight * 4;

    expect(playbackBytes).toBeLessThan(fullBytes / 2);
    expect(interactionBytes).toBeLessThan(playbackBytes / 2);
  });
});
