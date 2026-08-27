import type { FilterAsset, FilterCategory } from "./types";

export const LOCAL_FILTER_CATEGORIES: FilterCategory[] = [
  { id: "essentials", name: "Essentials", description: "Everyday color corrections" },
  { id: "cinematic", name: "Cinematic", description: "Teal-orange and film looks" },
  { id: "vintage", name: "Vintage", description: "Retro film grades" },
  { id: "mono", name: "Mono", description: "Black and white" },
  { id: "vibrant", name: "Vibrant", description: "Punchy color" },
];

export const LOCAL_FILTERS: FilterAsset[] = [
  { id: "filter-vivid", name: "Vivid", type: "filter", category: "vibrant", description: "Boost saturation and contrast", thumbnail: "", gradingParams: { saturation: 0.35, contrast: 0.1 } as any },
  { id: "filter-cool", name: "Cool", type: "filter", category: "essentials", description: "Clean cool tint", thumbnail: "", gradingParams: { temperature: -0.15, tint: -0.03 } as any },
  { id: "filter-warm", name: "Warm", type: "filter", category: "essentials", description: "Gentle warm glow", thumbnail: "", gradingParams: { temperature: 0.2, tint: 0.04 } as any },
  { id: "filter-cinematic-teal", name: "Cinematic Teal", type: "filter", category: "cinematic", description: "Teal and orange film look", thumbnail: "", gradingParams: { temperature: -0.12, tint: -0.05, contrast: 0.12, saturation: 0.18 } as any },
  { id: "filter-purple-haze", name: "Purple Haze", type: "filter", category: "cinematic", description: "Stylized purple cast", thumbnail: "", gradingParams: { tint: 0.12, saturation: 0.25, contrast: 0.08 } as any },
  { id: "filter-vintage", name: "Vintage", type: "filter", category: "vintage", description: "Faded retro film", thumbnail: "", gradingParams: { sepia: 0.3, vignette: 0.35, contrast: 0.06, saturation: -0.12 } as any },
  { id: "filter-bw-classic", name: "B&W Classic", type: "filter", category: "mono", description: "Clean black and white", thumbnail: "", gradingParams: { grayscale: 1, contrast: 0.12 } as any },
  { id: "filter-high-contrast", name: "High Contrast", type: "filter", category: "mono", description: "Strong monochrome contrast", thumbnail: "", gradingParams: { grayscale: 1, contrast: 0.28 } as any },
  { id: "filter-soft-bw", name: "Soft B&W", type: "filter", category: "mono", description: "Gentle monochrome", thumbnail: "", gradingParams: { grayscale: 1, contrast: -0.06, brightness: 0.05 } as any },
  { id: "filter-bleach", name: "Bleach Bypass", type: "filter", category: "cinematic", description: "Low-saturation high-contrast film", thumbnail: "", gradingParams: { saturation: -0.45, contrast: 0.22, brightness: 0.04 } as any },
];
