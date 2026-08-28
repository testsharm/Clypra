import type { FilterAsset } from "@/features/filters/types";
export const EXTRA_FILTERS: FilterAsset[] = [
  { id: "x-filter-1", name: "Dreamy", type: "filter", category: "aesthetic", description: "Dreamy soft glow", thumbnail: "", gradingParams: { brightness: 0.12, contrast: -0.05, saturation: -0.1 } },
  { id: "x-filter-2", name: "Cinematic Orange", type: "filter", category: "cinematic", description: "Cinematic orange-teal", thumbnail: "", gradingParams: { temperature: 0.3, tint: -0.1, contrast: 0.2, saturation: 0.15 } },
  { id: "x-filter-3", name: "Mono Cold", type: "filter", category: "mono", description: "Cold blue monochrome", thumbnail: "", gradingParams: { grayscale: 1, temperature: -0.5, contrast: 0.3 } },
  { id: "x-filter-4", name: "Vibrant Pop", type: "filter", category: "vibrant", description: "Extra vibrant pop", thumbnail: "", gradingParams: { saturation: 0.7, contrast: 0.25, brightness: 0.05 } },
  { id: "x-filter-5", name: "Soft Portrait", type: "filter", category: "portrait", description: "Soft portrait glow", thumbnail: "", gradingParams: { brightness: 0.1, contrast: -0.1, saturation: 0.1 } },
  { id: "x-filter-6", name: "Landscape Punch", type: "filter", category: "landscape", description: "Landscape color punch", thumbnail: "", gradingParams: { saturation: 0.4, contrast: 0.3, temperature: -0.1 } },
  { id: "x-filter-7", name: "Retro Warm", type: "filter", category: "vintage", description: "Retro warm fade", thumbnail: "", gradingParams: { sepia: 0.4, temperature: 0.2, contrast: 0.1 } },
  { id: "x-filter-8", name: "Cool Fade", type: "filter", category: "aesthetic", description: "Cool faded look", thumbnail: "", gradingParams: { temperature: -0.3, saturation: -0.2, brightness: 0.05 } }
];
