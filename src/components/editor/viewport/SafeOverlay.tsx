import React from "react";

interface SafeOverlayProps {
  visible: boolean;
  displayWidth: number;
  displayHeight: number;
  displayOffset: { x: number; y: number };
}

export const SafeOverlay: React.FC<SafeOverlayProps> = ({
  visible,
  displayWidth,
  displayHeight,
  displayOffset,
}) => {
  if (!visible) return null;

  // 90% Action Safe dimensions
  const actionWidth = displayWidth * 0.9;
  const actionHeight = displayHeight * 0.9;
  const actionX = displayOffset.x + (displayWidth - actionWidth) / 2;
  const actionY = displayOffset.y + (displayHeight - actionHeight) / 2;

  // 80% Title Safe dimensions
  const titleWidth = displayWidth * 0.8;
  const titleHeight = displayHeight * 0.8;
  const titleX = displayOffset.x + (displayWidth - titleWidth) / 2;
  const titleY = displayOffset.y + (displayHeight - titleHeight) / 2;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 select-none animate-in fade-in duration-200"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* 90% Action Safe Boundary */}
      <div
        className="absolute border border-dashed border-cyan-400/40 rounded-sm"
        style={{
          left: actionX,
          top: actionY,
          width: actionWidth,
          height: actionHeight,
        }}
      >
        <span className="absolute -top-4 left-1 text-[8px] font-bold font-mono text-cyan-400/50 uppercase tracking-wider select-none">
          Action Safe (90%)
        </span>
      </div>

      {/* 80% Title Safe Boundary */}
      <div
        className="absolute border border-dashed border-indigo-400/40 rounded-sm"
        style={{
          left: titleX,
          top: titleY,
          width: titleWidth,
          height: titleHeight,
        }}
      >
        <span className="absolute -top-4 left-1 text-[8px] font-bold font-mono text-indigo-400/50 uppercase tracking-wider select-none">
          Title Safe (80%)
        </span>
      </div>

      {/* Full Horizontal Center Line */}
      <div
        className="absolute h-px w-full bg-accent/25"
        style={{
          left: displayOffset.x,
          top: displayOffset.y + displayHeight / 2,
        }}
      />

      {/* Full Vertical Center Line */}
      <div
        className="absolute w-px h-full bg-accent/25"
        style={{
          left: displayOffset.x + displayWidth / 2,
          top: displayOffset.y,
        }}
      />

      {/* Rule of Thirds: Vertical Lines */}
      {[1/3, 2/3].map((ratio) => (
        <div
          key={`v-${ratio}`}
          className="absolute w-px h-full bg-white/10"
          style={{
            left: displayOffset.x + displayWidth * ratio,
            top: displayOffset.y,
          }}
        />
      ))}

      {/* Rule of Thirds: Horizontal Lines */}
      {[1/3, 2/3].map((ratio) => (
        <div
          key={`h-${ratio}`}
          className="absolute h-px w-full bg-white/10"
          style={{
            left: displayOffset.x,
            top: displayOffset.y + displayHeight * ratio,
          }}
        />
      ))}

      {/* Center Crosshair Marker */}
      <div
        className="absolute w-4 h-px bg-accent/40"
        style={{
          left: displayOffset.x + displayWidth / 2 - 8,
          top: displayOffset.y + displayHeight / 2,
        }}
      />
      <div
        className="absolute h-4 w-px bg-accent/40"
        style={{
          left: displayOffset.x + displayWidth / 2,
          top: displayOffset.y + displayHeight / 2 - 8,
        }}
      />

      {/* YouTube Caption Safe Zone */}
      <div
        className="absolute border border-green-400/20 bg-green-400/5"
        style={{
          left: displayOffset.x + displayWidth * 0.05,
          top: displayOffset.y + displayHeight * 0.75,
          width: displayWidth * 0.90,
          height: displayHeight * 0.20,
        }}
      >
        <span className="absolute top-0 left-1 text-[8px] font-mono text-green-400/60 select-none">YouTube Safe</span>
      </div>

      {/* Shorts/TikTok Caption Safe Zone */}
      <div
        className="absolute border border-pink-400/20 bg-pink-400/5"
        style={{
          left: displayOffset.x + displayWidth * 0.05,
          top: displayOffset.y + displayHeight * 0.78,
          width: displayWidth * 0.90,
          height: displayHeight * 0.18,
        }}
      >
        <span className="absolute top-0 left-1 text-[8px] font-mono text-pink-400/60 select-none">Shorts/TikTok Safe</span>
      </div>
    </div>
  );
};
