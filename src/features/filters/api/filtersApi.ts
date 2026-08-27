import type { FilterAsset, FilterCategory } from "../types";
import { LOCAL_FILTERS, LOCAL_FILTER_CATEGORIES } from "../localFilters";

export class FiltersApi {
  static async getManifest(): Promise<{ categories: Array<{ id: string; name: string; count: number }>; totalFilters: number }> {
    return {
      categories: LOCAL_FILTER_CATEGORIES.map((category) => ({
        id: category.id,
        name: category.name,
        count: LOCAL_FILTERS.filter((filter) => filter.category === category.id).length,
      })),
      totalFilters: LOCAL_FILTERS.length,
    };
  }

  static async getCategories(): Promise<FilterCategory[]> {
    return LOCAL_FILTER_CATEGORIES;
  }

  static async getByCategory(category: string): Promise<FilterAsset[]> {
    const exact = LOCAL_FILTERS.filter((filter) => filter.category === category);
    return exact.length > 0 ? exact : LOCAL_FILTERS;
  }

  static async getById(_category: string, id: string): Promise<FilterAsset> {
    const match = LOCAL_FILTERS.find((filter) => filter.id === id);
    if (!match) throw new Error(`Filter not found: ${id}`);
    return match;
  }

  static async search(query: string): Promise<FilterAsset[]> {
    const q = query.toLowerCase();
    return LOCAL_FILTERS.filter((filter) => filter.name.toLowerCase().includes(q) || filter.description.toLowerCase().includes(q));
  }
}
