import type { TransitionAsset } from "./types";

export const LOCAL_TRANSITIONS: TransitionAsset[] = [
  { id: "cross-dissolve", name: "Cross Dissolve", type: "transition", category: "basic", description: "Smooth cross dissolve", thumbnail: "", preview: "", renderer: "cross-dissolve", duration: { min: 0.2, max: 3, default: 0.5 } },
  { id: "fade-black", name: "Fade Through Black", type: "transition", category: "basic", description: "Fade through black", thumbnail: "", preview: "", renderer: "fade-through-color", params: { color: "#000000" }, duration: { min: 0.2, max: 3, default: 0.5 } },
  { id: "fade-white", name: "Fade Through White", type: "transition", category: "basic", description: "Fade through white", thumbnail: "", preview: "", renderer: "fade-through-color", params: { color: "#ffffff" }, duration: { min: 0.2, max: 3, default: 0.5 } },
  { id: "wipe-left", name: "Wipe Left", type: "transition", category: "basic", description: "Linear wipe left", thumbnail: "", preview: "", renderer: "wipe-left", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "wipe-right", name: "Wipe Right", type: "transition", category: "basic", description: "Linear wipe right", thumbnail: "", preview: "", renderer: "wipe-right", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "wipe-up", name: "Wipe Up", type: "transition", category: "basic", description: "Linear wipe up", thumbnail: "", preview: "", renderer: "wipe-up", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "wipe-down", name: "Wipe Down", type: "transition", category: "basic", description: "Linear wipe down", thumbnail: "", preview: "", renderer: "wipe-down", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "slide-left", name: "Slide Left", type: "transition", category: "basic", description: "Slide left", thumbnail: "", preview: "", renderer: "slide-left", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "slide-right", name: "Slide Right", type: "transition", category: "basic", description: "Slide right", thumbnail: "", preview: "", renderer: "slide-right", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "zoom-in", name: "Zoom In", type: "transition", category: "basic", description: "Zoom in transition", thumbnail: "", preview: "", renderer: "zoom-in", duration: { min: 0.2, max: 2, default: 0.5 } },
  { id: "zoom-out", name: "Zoom Out", type: "transition", category: "basic", description: "Zoom out transition", thumbnail: "", preview: "", renderer: "zoom-out", duration: { min: 0.2, max: 2, default: 0.5 } },
];
