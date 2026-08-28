/**
 * Effect Renderer
 *
 * Applies behavior-driven effects to canvas contexts.
 * These are NOT video files - they are algorithmic transformations.
 *
 * Examples:
 * - shake: Randomly offset canvas position
 * - blur: Apply blur filter
 * - vhs: Add scanlines, color shift, noise
 * - glitch: Random block displacement
 */

import { EffectRenderer as EffectRendererType, EffectParameters, EasingFunction } from "../types";

export class EffectRenderer {
  /**
   * Apply an effect to a canvas context
   *
   * @param ctx - Canvas 2D context
   * @param renderer - Effect type
   * @param params - Effect parameters
   * @param intensity - Effect intensity (0-1)
   * @param time - Current time for animated effects
   */
  static apply(ctx: CanvasRenderingContext2D, renderer: EffectRendererType, params: EffectParameters, intensity: number = 1, time: number = 0): void {
    const method = this.getRenderer(renderer);
    if (method) {
      method.call(this, ctx, params, intensity, time);
    } else {
      console.warn(`Unknown effect renderer: ${renderer}`);
    }
  }

  /**
   * Get the renderer function for an effect type
   */
  private static getRenderer(type: EffectRendererType): ((ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number) => void) | null {
    const renderers: Record<string, any> = {
      // Blur effects
      blur: this.renderBlur,
      motion_blur: this.renderMotionBlur,
      radial_blur: this.renderRadialBlur,
      zoom_blur: this.renderZoomBlur,

      // Style effects
      vhs: this.renderVHS,
      glitch: this.renderGlitch,
      rgb_split: this.renderRGBSplit,
      chromatic_aberration: this.renderChromaticAberration,
      film_grain: this.renderFilmGrain,
      scanlines: this.renderScanlines,
      crt: this.renderCRT,
      pixelate: this.renderPixelate,

      // Distortion effects
      wave: this.renderWave,
      ripple: this.renderRipple,
      bulge: this.renderBulge,
      twist: this.renderTwist,
      fisheye: this.renderFisheye,

      // Light effects
      flash: this.renderFlash,
      flicker: this.renderFlicker,
      vignette: this.renderVignette,
      glow: this.renderGlow,
      light_leak: this.renderLightLeak,
      light_leak_2: this.renderLightLeak2,
      fire: this.renderFire,
      particles: this.renderParticles,
      dust_particles: this.renderDustParticles,

      // Time effects
      speed_ramp: this.renderSpeedRamp,
      freeze_frame: this.renderFreezeFrame,
      echo: this.renderEcho,
      strobe: this.renderStrobe,

      // Keying effects
      chroma_key: this.renderChromaKey,

      // Body effects are handled in the canonical rasterizer where source
      // frame pixels are available for mask generation.
      "body-segmentation-glow": this.renderBodyEffectNoop,
      body_glow: this.renderBodyEffectNoop,
      body_outline: this.renderBodyEffectNoop,
      body_particles: this.renderBodyEffectNoop,
    };

    return renderers[type] || null;
  }

  private static renderBodyEffectNoop(): void {
    // Body renderers require source-frame pixels and are dispatched from
    // core/render/rasterizer.ts so preview and export share the same output.
  }

  // ============================================================================
  // BLUR EFFECTS
  // ============================================================================

  private static renderBlur(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const blurAmount = (params.blurAmount || 10) * intensity;
    ctx.filter = `blur(${blurAmount}px)`;
  }

  private static renderMotionBlur(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const blurAmount = (params.blurAmount || 10) * intensity;
    const direction = params.direction || 0;

    // Motion blur is implemented via multiple draws with decreasing opacity
    // This is a simplified version - production would use proper motion vectors
    ctx.filter = `blur(${blurAmount}px)`;
  }

  private static renderRadialBlur(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const blurAmount = (params.blurAmount || 10) * intensity;
    // Radial blur requires custom shader or multiple draws
    // Simplified with standard blur
    ctx.filter = `blur(${blurAmount}px)`;
  }

  private static renderZoomBlur(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const blurAmount = (params.blurAmount || 10) * intensity;
    ctx.filter = `blur(${blurAmount}px)`;
  }

  // ============================================================================
  // STYLE EFFECTS
  // ============================================================================

  private static renderVHS(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Add scanlines
    this.renderScanlines(ctx, { scanlineCount: 100 }, intensity, time);

    // Add color shift
    const colorOffset = (params.colorOffset || 5) * intensity;
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.1})`;
    ctx.fillRect(colorOffset, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    // Add noise
    const noiseAmount = (params.noiseAmount || 0.1) * intensity;
    this.addNoise(ctx, noiseAmount);
  }

  private static renderGlitch(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const glitchIntensity = (params.glitchIntensity || 50) * intensity;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Random horizontal slices with RGB shift
    const sliceCount = Math.floor(5 * intensity);
    for (let i = 0; i < sliceCount; i++) {
      const y = Math.random() * height;
      const sliceHeight = Math.random() * 20;
      const offset = (Math.random() - 0.5) * glitchIntensity;

      const imageData = ctx.getImageData(0, y, width, sliceHeight);
      ctx.putImageData(imageData, offset, y);
    }
  }

  private static renderRGBSplit(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const splitDistance = (params.splitDistance || 10) * intensity;
    const angle = (params.angle || 0) * (Math.PI / 180);

    const offsetX = Math.cos(angle) * splitDistance;
    const offsetY = Math.sin(angle) * splitDistance;

    // This is a simplified version - full implementation needs channel separation
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`;
    ctx.fillRect(offsetX, offsetY, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }

  private static renderChromaticAberration(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    // Similar to RGB split but radiating from center
    this.renderRGBSplit(ctx, params, intensity, time);
  }

  private static renderFilmGrain(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const grainIntensity = (params.grainIntensity || 0.1) * intensity;
    this.addNoise(ctx, grainIntensity);
  }

  private static renderScanlines(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const scanlineCount = params.scanlineCount || 100;
    const height = ctx.canvas.height;
    const spacing = height / scanlineCount;

    ctx.fillStyle = `rgba(0, 0, 0, ${intensity * 0.3})`;
    for (let i = 0; i < scanlineCount; i++) {
      ctx.fillRect(0, i * spacing, ctx.canvas.width, spacing / 2);
    }
  }

  private static renderCRT(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    // Combine scanlines, vignette, and slight curve
    this.renderScanlines(ctx, params, intensity, time);
    this.renderVignette(ctx, { radius: 0.8 }, intensity, time);
  }

  private static renderPixelate(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const pixelSize = Math.max(1, Math.floor((params.pixelSize || 10) * intensity));
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Downscale and upscale for pixelation effect
    ctx.imageSmoothingEnabled = false;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = Math.floor(width / pixelSize);
    tempCanvas.height = Math.floor(height / pixelSize);

    tempCtx.drawImage(ctx.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  }

  // ============================================================================
  // DISTORTION EFFECTS
  // ============================================================================

  private static renderWave(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const amplitude = (params.amplitude || 10) * intensity;
    const frequency = (params.frequency || 0.02) * (params.frequency ?? 1);
    const speed = params.speed || 2;
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      const offset = Math.sin(y * frequency + time * speed) * amplitude;
      for (let x = 0; x < width; x++) {
        const srcX = Math.round(x - offset);
        const clampedX = Math.min(width - 1, Math.max(0, srcX));
        const srcIdx = (y * width + clampedX) * 4;
        const dstIdx = (y * width + x) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  private static renderRipple(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
    const amplitude = (params.amplitude || 10) * intensity;
    const frequency = (params.frequency || 0.05) * (params.frequency ?? 1);
    const speed = params.speed || 3;
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const phase = r * frequency - time * speed;
        const offset = Math.sin(phase) * amplitude * (r / maxR);
        const srcR = Math.max(0, r + offset);
        const scale = srcR / (r || 1);
        const srcX = Math.round(centerX + dx * scale);
        const srcY = Math.round(centerY + dy * scale);
        const clampedX = Math.min(width - 1, Math.max(0, srcX));
        const clampedY = Math.min(height - 1, Math.max(0, srcY));
        const srcIdx = (clampedY * width + clampedX) * 4;
        const dstIdx = (y * width + x) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  private static renderBulge(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
    const strength = (params.strength ?? 0.5) * intensity;
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const factor = 1 - strength * (1 - r / maxR);
        const srcR = r / Math.max(0.001, factor);
        const scale = srcR / (r || 1);
        const srcX = Math.round(centerX + dx * scale);
        const srcY = Math.round(centerY + dy * scale);
        const clampedX = Math.min(width - 1, Math.max(0, srcX));
        const clampedY = Math.min(height - 1, Math.max(0, srcY));
        const srcIdx = (clampedY * width + clampedX) * 4;
        const dstIdx = (y * width + x) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  private static renderTwist(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
    const angle = ((params.angle ?? 0.5) * intensity) * (time * 0.5);
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx) - angle * (r / maxR);
        const srcX = Math.round(centerX + Math.cos(currentAngle) * r);
        const srcY = Math.round(centerY + Math.sin(currentAngle) * r);
        const clampedX = Math.min(width - 1, Math.max(0, srcX));
        const clampedY = Math.min(height - 1, Math.max(0, srcY));
        const srcIdx = (clampedY * width + clampedX) * 4;
        const dstIdx = (y * width + x) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  private static renderFisheye(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
    const strength = (params.strength ?? 0.6) * intensity;
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const factor = 1 - strength * Math.pow(r / maxR, 2);
        const srcR = r / Math.max(0.001, factor);
        const scale = srcR / (r || 1);
        const srcX = Math.round(centerX + dx * scale);
        const srcY = Math.round(centerY + dy * scale);
        const clampedX = Math.min(width - 1, Math.max(0, srcX));
        const clampedY = Math.min(height - 1, Math.max(0, srcY));
        const srcIdx = (clampedY * width + clampedX) * 4;
        const dstIdx = (y * width + x) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  // ============================================================================
  // LIGHT EFFECTS
  // ============================================================================

  private static renderFlash(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const flashColor = params.flashColor || "#ffffff";
    const flashIntensity = (params.flashIntensity || 1) * intensity;

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = flashColor;
    ctx.globalAlpha = flashIntensity;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private static renderFlicker(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const flickerAmount = Math.random() * intensity;
    ctx.globalAlpha = 1 - flickerAmount * 0.5;
  }

  private static renderVignette(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const radius = params.radius || 0.7;

    const gradient = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * radius, width / 2, height / 2, Math.max(width, height));

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.7})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private static renderGlow(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const glowAmount = (params.glowAmount || 10) * intensity;
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = params.glowColor || "#ffffff";
  }

  private static renderLightLeak(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `rgba(255, 200, 100, ${intensity * 0.3})`);
    gradient.addColorStop(1, "rgba(255, 200, 100, 0)");

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  private static renderLightLeak2(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const gradient = ctx.createLinearGradient(width, 0, 0, height);
    gradient.addColorStop(0, `rgba(255, 150, 50, ${intensity * 0.35})`);
    gradient.addColorStop(1, "rgba(255, 100, 150, 0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  private static renderFire(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const c1 = params.fireColor1 || "#ff4500";
    const c2 = params.fireColor2 || "#ff8c00";
    const c3 = params.fireColor3 || "#ffd700";
    const alpha = intensity * 0.5 * (0.7 + 0.3 * Math.sin(time * 10));
    const gradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
    gradient.addColorStop(0, this.hexToRgba(c1, alpha));
    gradient.addColorStop(0.5, this.hexToRgba(c2, alpha * 0.8));
    gradient.addColorStop(1, this.hexToRgba(c3, 0));
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  private static renderParticles(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const count = Math.floor((params.particleCount || 30) * intensity);
    const size = (params.particleSize || 3) * intensity;
    const color = params.particleColor || "#ffffff";
    const speed = params.driftSpeed || 20;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = intensity;
    for (let i = 0; i < count; i++) {
      const seed = ((i * 37 + time * speed) % 1000) / 1000;
      const x = (seed * 131) % width;
      const y = (seed * 257) % height;
      ctx.beginPath();
      ctx.arc(x, y, size * (0.5 + seed), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static renderDustParticles(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const count = Math.floor((params.particleCount || 50) * intensity);
    const size = (params.particleSize || 1.5) * intensity;
    const color = params.particleColor || "#ffffff";
    const speed = params.driftSpeed || 8;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = intensity * 0.6;
    for (let i = 0; i < count; i++) {
      const seed = ((i * 53 + time * speed) % 1000) / 1000;
      const x = (seed * 191) % width;
      const y = (seed * 311) % height;
      ctx.beginPath();
      ctx.arc(x, y, size * (0.4 + seed * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // ============================================================================
  // KEYING EFFECTS
  // ============================================================================

  private static renderChromaKey(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, _time: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    if (width === 0 || height === 0) return;

    const keyColor = params.keyColor || "#00ff00";
    const threshold = (params.threshold ?? 0.3) * intensity;
    const spillSuppression = params.spillSuppression ?? 0.5;

    const r = parseInt(keyColor.slice(1, 3), 16);
    const g = parseInt(keyColor.slice(3, 5), 16);
    const b = parseInt(keyColor.slice(5, 7), 16);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];

      const dist = Math.sqrt((pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2) / Math.sqrt(255 * 255 * 3);

      if (dist < threshold) {
        data[i + 3] = 0;
      } else if (spillSuppression > 0 && dist < threshold * 2) {
        const spill = spillSuppression * (1 - dist / (threshold * 2));
        data[i + 1] = Math.min(255, Math.max(0, pg - spill * 100));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // ============================================================================
  // TIME EFFECTS
  // ============================================================================

  private static renderSpeedRamp(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    // Speed ramp is handled at the playback level, not rendering
    // This is a placeholder
  }

  private static renderFreezeFrame(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    // Freeze frame is handled at the playback level
    // This is a placeholder
  }

  private static renderEcho(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    // Echo requires frame buffer
    // Simplified with opacity
    ctx.globalAlpha = 1 - intensity * 0.3;
  }

  private static renderStrobe(ctx: CanvasRenderingContext2D, params: EffectParameters, intensity: number, time: number): void {
    const frequency = params.frequency || 10;
    const strobeOn = Math.sin(time * frequency * Math.PI) > 0;

    if (strobeOn) {
      this.renderFlash(ctx, { flashIntensity: 0.8 }, intensity, time);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static addNoise(ctx: CanvasRenderingContext2D, amount: number): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * amount;
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
