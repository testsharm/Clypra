export type AudioLibraryCategory =
  | "music" // catch-all browsable music library — the primary tab
  | "cinematic" // YouTube creators, vlogs, montages — highest demand
  | "upbeat" // social content, reels, highlights — second highest demand
  | "lo-fi" // study/productivity content — massive creator niche
  | "hip-hop" // most requested genre globally on CapCut
  | "ambient" // background for talking-head/interview content
  | "sfx"; // sound effects — non-negotiable, every editor needs this

export interface AudioLibraryItem {
  id: string;
  name: string;
  category: AudioLibraryCategory | string;
  description?: string;
  tags?: string[];
  author: string;
  duration: number;
  bpm?: number;
  loopable?: boolean;
  license: {
    type: "cc0" | "cc-by" | "royalty-free" | "public-domain";
    url?: string;
    attributionRequired: boolean;
  };
  source: {
    provider: string;
    url: string;
  };
  audioUrl: string;
  waveformUrl?: string;
  coverArtUrl?: string;
  isPremium?: boolean;
}

export const AUDIO_LIBRARY_CATEGORIES: AudioLibraryCategory[] = [
  "music",
  "cinematic",
  "upbeat",
  "lo-fi",
  "hip-hop",
  "ambient",
  "sfx",
];

export const AudioLibraryApi = {
  async getAudioByCategory(_category: AudioLibraryCategory): Promise<AudioLibraryItem[]> {
    return [];
  },
  async getAudioAsset(_category: string, _id: string): Promise<AudioLibraryItem> {
    throw new Error("Audio library is local only");
  },
};
