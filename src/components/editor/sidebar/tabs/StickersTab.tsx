import React from "react";
import type { TabProps } from "../types";

type StickerDef = {
  id: string;
  name: string;
  render: () => React.ReactElement;
};

const STICKERS: StickerDef[] = [
  {
    id: "arrow-right-move",
    name: "Arrow Right Move",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M8 32h44M40 14l18 18-18 18" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="translate" values="0 0; 8 0; 0 0" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "arrow-left-move",
    name: "Arrow Left Move",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M56 32H12M24 14L6 32l18 18" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="translate" values="0 0; -8 0; 0 0" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "arrow-up-move",
    name: "Arrow Up Move",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 56V12M14 30l18-18 18 18" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "arrow-down-move",
    name: "Arrow Down Move",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 8v44M14 34l18 18 18-18" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 8; 0 0" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "circle-draw",
    name: "Circle Draw",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="24" fill="none" stroke="#ff2d55" strokeWidth="4" strokeDasharray="150 150" strokeDashoffset="150">
          <animate attributeName="stroke-dashoffset" from="150" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  },
  {
    id: "circle-rotate",
    name: "Circle Rotate",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <circle cx="32" cy="32" r="24" fill="none" stroke="#facc15" strokeWidth="5" strokeDasharray="20 10" />
          <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="3s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "check-draw",
    name: "Check Draw",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#22c55e" strokeWidth="4" />
        <path d="M20 32l8 8 16-18" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40 40" strokeDashoffset="40">
          <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "star-pop",
    name: "Star Pop",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 8l7 18h18l-14 10 5 18-16-12-16 12 5-18L8 26h18z" fill="#f59e0b" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="1s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "heart-beat",
    name: "Heart Beat",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 52S10 38 10 24a10 10 0 0 1 20-2 10 10 0 0 1 20 2C50 38 32 52 32 52z" fill="#ff2d55">
            <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="0.6s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "fire-flicker",
    name: "Fire Flicker",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 8c4 8 10 12 10 22a10 10 0 0 1-20 0c0-10 6-14 10-22z" fill="#f97316">
            <animateTransform attributeName="transform" type="scale" values="1 1;1.1 1.2;0.9 0.9;1 1" dur="0.5s" repeatCount="indefinite" />
          </path>
          <circle cx="32" cy="34" r="5" fill="#facc15">
            <animate attributeName="opacity" values="1;0.5;1" dur="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "lightning-flash",
    name: "Lightning Flash",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M36 8L16 34h12l-4 22 20-28H32z" fill="#facc15" stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.3s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "music-bounce",
    name: "Music Bounce",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M20 48V16l24-4v32" stroke="#00f0ff" strokeWidth="5" fill="none" />
          <circle cx="16" cy="48" r="6" fill="#ff2d55" />
          <circle cx="40" cy="44" r="6" fill="#ff2d55" />
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="0.5s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "camera-shutter",
    name: "Camera Shutter",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <rect x="8" y="20" width="48" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="4" />
          <circle cx="32" cy="34" r="8" fill="none" stroke="#fff" strokeWidth="4" />
          <circle cx="32" cy="34" r="4" fill="#fff">
            <animateTransform attributeName="transform" type="rotate" from="0 32 34" to="360 32 34" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "gift-shake",
    name: "Gift Shake",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <rect x="8" y="24" width="48" height="24" rx="4" fill="#ff2d55" />
          <rect x="28" y="20" width="8" height="32" fill="#facc15" />
          <path d="M32 20c-4-6 4-8 6-2 1 3-2 4-6 6 4 2 7 3 6 6-2 6-10 4-6-2" fill="#facc15" />
          <animateTransform attributeName="transform" type="rotate" values="-5 32 32;5 32 32;-5 32 32" dur="0.5s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "balloon-float",
    name: "Balloon Float",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <ellipse cx="32" cy="24" rx="16" ry="20" fill="#ff2d55">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
          <path d="M32 44v12M28 56h8" stroke="#fff" strokeWidth="3" />
        </g>
      </svg>
    ),
  },
  {
    id: "confetti-fall",
    name: "Confetti Fall",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="16" cy="20" r="4" fill="#facc15">
          <animateTransform attributeName="transform" type="translate" values="0 0;0 20;0 0" dur="0.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="48" cy="16" r="4" fill="#ff2d55">
          <animateTransform attributeName="transform" type="translate" values="0 0;0 24;0 0" dur="0.9s" repeatCount="indefinite" />
        </circle>
        <rect x="36" y="28" width="8" height="8" fill="#22c55e">
          <animateTransform attributeName="transform" type="translate" values="0 0;0 18;0 0" dur="0.8s" repeatCount="indefinite" />
        </rect>
      </svg>
    ),
  },
  {
    id: "smile-bounce",
    name: "Smile Bounce",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <circle cx="32" cy="32" r="24" fill="#facc15" />
          <circle cx="24" cy="28" r="3" fill="#000" />
          <circle cx="40" cy="28" r="3" fill="#000" />
          <path d="M24 40c4 4 12 4 16 0" stroke="#000" strokeWidth="3" fill="none" />
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="0.6s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "thumb-pop",
    name: "Thumb Up Pop",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M12 28h10v20H12zM22 28l6-14c0-4 3-6 7-4l-2 12h12c4 0 7 3 7 7l-4 18H22" fill="#3b82f6" stroke="#fff" strokeWidth="2">
            <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "rocket-launch",
    name: "Rocket Launch",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 8c8 8 12 18 12 30l-12 4-12-4C20 26 24 16 32 8z" fill="#fff" />
          <circle cx="32" cy="36" r="6" fill="#ff2d55" />
          <path d="M32 8c-4 10-4 20 0 30m0-30c4 10 4 20 0 30" stroke="#facc15" strokeWidth="3" fill="none" />
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur="0.8s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "earth-spin",
    name: "Earth Spin",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <circle cx="32" cy="32" r="24" fill="#22c55e" stroke="#fff" strokeWidth="3" />
          <path d="M16 24h32M16 40h32M32 8c-8 8-10 16-8 24 2 10 6 16 8 20 2-4 6-10 8-20 2-8 0-16-8-24" stroke="#fff" strokeWidth="2" fill="none" />
          <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="4s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "snowflake-spin",
    name: "Snowflake Spin",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 8v48M16 20l32 24M48 20L16 44M20 8l24 48M44 8L20 56" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
  {
    id: "flower-pulse",
    name: "Flower Pulse",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <circle cx="32" cy="32" r="8" fill="#facc15" />
          <circle cx="16" cy="20" r="10" fill="#ff2d55" />
          <circle cx="48" cy="20" r="10" fill="#ff2d55" />
          <circle cx="16" cy="44" r="10" fill="#ff2d55" />
          <circle cx="48" cy="44" r="10" fill="#ff2d55" />
          <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="1s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "butterfly-flap",
    name: "Butterfly Flap",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M32 32C20 18 4 20 4 36c0 12 16 20 28 16 12 4 28-4 28-16 0-16-16-18-28-4z" fill="#ec4899">
            <animateTransform attributeName="transform" type="scale" values="1 1;1 0.6;1 1" dur="0.4s" repeatCount="indefinite" />
          </path>
          <path d="M32 32V52" stroke="#000" strokeWidth="3" />
        </g>
      </svg>
    ),
  },
  {
    id: "rainbow-draw",
    name: "Rainbow Draw",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M8 48a24 24 0 0 1 48 0" fill="none" stroke="#f00" strokeWidth="4" strokeDasharray="100 100" strokeDashoffset="100">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M16 48a16 16 0 0 1 32 0" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="80 80" strokeDashoffset="80">
          <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M24 48a8 8 0 0 1 16 0" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="60 60" strokeDashoffset="60">
          <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.5s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "diamond-shine",
    name: "Diamond Shine",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M20 8h24l8 16-20 32L12 24z" fill="#00f0ff" stroke="#fff" strokeWidth="2" />
          <path d="M12 24h40M20 8l-8 16 20 32 20-32-8-16" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="24" cy="16" r="2" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="16" r="2" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "trophy-shine",
    name: "Trophy Shine",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M16 12h32v8a16 16 0 0 1-32 0zM16 12H8v6a6 6 0 0 0 8 6m32-12h8v6a6 6 0 0 1-8 6M32 32v8m0 8v4" stroke="#f59e0b" strokeWidth="4" fill="none" />
          <circle cx="32" cy="20" r="8" fill="#f59e0b">
            <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "bell-ring",
    name: "Bell Ring",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M16 36a16 16 0 1 1 32 0v8H16z" fill="#facc15" />
          <path d="M24 48h16M32 8V4" stroke="#fff" strokeWidth="4" />
          <animateTransform attributeName="transform" type="rotate" values="-8 32 32;8 32 32;-8 32 32" dur="0.4s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "bubble-pop",
    name: "Bubble Pop",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <rect x="8" y="12" width="48" height="32" rx="12" fill="#fff" stroke="#000" strokeWidth="2" />
          <path d="M20 44l-6 12 14-12z" fill="#fff" stroke="#000" strokeWidth="2" />
          <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="0.6s" repeatCount="indefinite" />
        </g>
      </svg>
    ),
  },
  {
    id: "magic-sparkle",
    name: "Magic Sparkle",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <path d="M40 8L56 24M28 36l8-8M8 56l36-36" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
          <circle cx="48" cy="16" r="3" fill="#facc15">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="48" r="3" fill="#facc15">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" begin="0.25s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "party-pop",
    name: "Party Pop",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g>
          <circle cx="16" cy="16" r="6" fill="#facc15">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 6;0 0" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="48" cy="16" r="6" fill="#ff2d55">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 8;0 0" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="48" r="6" fill="#00f0ff">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 6;0 0" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="48" cy="48" r="6" fill="#22c55e">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 8;0 0" dur="0.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="32" r="8" fill="#a855f7">
            <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    ),
  },
  {
    id: "love-pulse",
    name: "Love Pulse",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 50S10 38 10 24a10 10 0 0 1 20-2 10 10 0 0 1 20 2C50 38 32 50 32 50z" fill="#ff2d55" stroke="#fff" strokeWidth="2">
          <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="0.7s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-arrow-pulse",
    name: "Arrow Pulse",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M8 32h44M40 14l18 18-18 18" stroke="#00e0ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <animateTransform attributeName="transform" type="translate" values="0 0; 6 0; 0 0" dur="0.7s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-circle-rotate",
    name: "Circle Rotate",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="22" fill="none" stroke="#ff69b4" strokeWidth="4" strokeDasharray="8 6">
          <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  },
  {
    id: "extra-star-burst",
    name: "Star Burst",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 8l7 18h18l-14 10 5 18-16-12-16 12 5-18L8 26h18z" fill="#facc15">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-heart-beat",
    name: "Heart Beat",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 50S10 38 10 24a10 10 0 0 1 20-2 10 10 0 0 1 20 2C50 38 32 50 32 50z" fill="#ff2d55">
          <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="0.6s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-fire-flicker",
    name: "Fire Flicker",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 8c4 8 10 12 10 22a10 10 0 0 1-20 0c0-10 6-14 10-22z" fill="#f97316">
          <animateTransform attributeName="transform" type="scale" values="1;1.1;0.9;1" dur="0.4s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-lightning",
    name: "Lightning",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M36 8L16 34h12l-4 22 20-28H32z" fill="#facc15">
          <animate attributeName="opacity" values="1;0.1;1" dur="0.3s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  },
  {
    id: "extra-music",
    name: "Music",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M20 48V16l24-4v32" stroke="#00e0ff" strokeWidth="5" fill="none" />
        <circle cx="16" cy="48" r="6" fill="#ff2d55" />
        <circle cx="40" cy="44" r="6" fill="#ff2d55" />
      </svg>
    ),
  },
  {
    id: "extra-gift",
    name: "Gift",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect x="8" y="24" width="48" height="24" rx="4" fill="#ff2d55" />
        <rect x="28" y="20" width="8" height="32" fill="#facc15" />
        <path d="M32 20c-4-6 4-8 6-2 1 3-2 4-6 6 4 2 7 3 6 6-2 6-10 4-6-2" fill="#facc15" />
      </svg>
    ),
  },
  {
    id: "extra-balloon",
    name: "Balloon",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <ellipse cx="32" cy="24" rx="16" ry="20" fill="#a855f7">
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.5s" repeatCount="indefinite" />
        </ellipse>
        <path d="M32 44v12M28 56h8" stroke="#fff" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "extra-sparkle",
    name: "Sparkle",
    render: () => (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 8l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#facc15">
          <animate attributeName="opacity" values="1;0.4;1" dur="0.7s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
  }
];
function StickerCard({ sticker, onAdd }: { sticker: StickerDef; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer"
      title={`Add ${sticker.name}`}
    >
      {sticker.render()}
    </button>
  );
}

export const StickersTab: React.FC<TabProps> = ({ onAddToTimeline }) => {
  const handleAddSticker = (sticker: StickerDef) => {
    onAddToTimeline?.(
      {
        id: `animated-sticker-${sticker.id}`,
        name: sticker.name,
        kind: "sticker",
        svg: sticker.render,
      },
      "stickers"
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin">
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} onAdd={() => handleAddSticker(sticker)} />
        ))}
      </div>
    </div>
  );
};
