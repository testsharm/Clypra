// Centralized asset base URL for user-hosted downloadable previews/assets.
// This points at the project owner's own GitHub raw content, not a third-party API.
export const ASSET_BASE_URL =
  import.meta.env.VITE_ASSET_BASE_URL ||
  "https://raw.githubusercontent.com/testsharm/Clypra/main/public/assets";

export function getAssetUrl(path: string): string {
  const cleaned = path.replace(/^\/+/, "");
  return `${ASSET_BASE_URL}/${cleaned}`;
}
