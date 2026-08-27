import React, { useEffect, useRef } from "react";

interface CanvasScrubPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  className?: string;
}

/**
 * Draws the current frame from a video element onto a 2D canvas.
 * This avoids HTML5 video seeking latency during paused/scrubbing.
 * For program preview, native renderNativeVideoProjectFrame already handles canvas frames.
 */
export const CanvasScrubPreview: React.FC<CanvasScrubPreviewProps> = ({
  videoRef,
  currentTime,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    try {
      video.currentTime = currentTime;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = video.videoWidth || canvas.width;
      const height = video.videoHeight || canvas.height;
      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
    } catch {
      // Seeking may throw if video metadata isn't ready yet; ignore.
    }
  }, [currentTime, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    />
  );
};
