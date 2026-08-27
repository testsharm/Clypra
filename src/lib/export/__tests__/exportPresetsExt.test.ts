import { describe, it, expect } from "vitest";
import { PRESET_CONFIGS, PRESET_ORDER } from "../exportPresets";

describe("Export Presets", () => {
  it("includes 720p, 1080p, 1440p, and 4k in PRESET_ORDER", () => {
    expect(PRESET_ORDER).toEqual(["720p", "1080p", "1440p", "4k"]);
  });

  it("configures 720p preset with correct dimensions", () => {
    const config = PRESET_CONFIGS["720p"];
    expect(config).toBeDefined();
    expect(config.width).toBe(1280);
    expect(config.height).toBe(720);
  });

  it("configures 4k preset with correct dimensions", () => {
    const config = PRESET_CONFIGS["4k"];
    expect(config).toBeDefined();
    expect(config.width).toBe(3840);
    expect(config.height).toBe(2160);
  });
});
