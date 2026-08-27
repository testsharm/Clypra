import { describe, it, expect } from "vitest";
import { FiltersApi } from "../api/filtersApi";
import { LOCAL_FILTERS, LOCAL_FILTER_CATEGORIES } from "../localFilters";

describe("FiltersApi — Local Bundled Filters", () => {
  it("returns a manifest with one entry per bundled filter", async () => {
    const manifest = await FiltersApi.getManifest();
    expect(manifest.totalFilters).toBe(LOCAL_FILTERS.length);
    expect(manifest.categories.length).toBe(LOCAL_FILTER_CATEGORIES.length);
  });

  it("returns all bundled categories", async () => {
    const categories = await FiltersApi.getCategories();
    expect(categories.length).toBe(LOCAL_FILTER_CATEGORIES.length);
    expect(categories[0].id).toBe(LOCAL_FILTER_CATEGORIES[0].id);
  });

  it("returns filters for a known category", async () => {
    const vintage = await FiltersApi.getByCategory("vintage");
    expect(vintage.length).toBeGreaterThan(0);
    expect(vintage.every((filter) => filter.category === "vintage")).toBe(true);
  });

  it("falls back to all filters for an unknown category", async () => {
    const all = await FiltersApi.getByCategory("does-not-exist");
    expect(all).toHaveLength(LOCAL_FILTERS.length);
  });

  it("returns a specific bundled filter by id", async () => {
    const filter = await FiltersApi.getById("vibrant", "filter-vivid");
    expect(filter.name).toBe("Vivid");
  });

  it("throws when a filter id does not exist", async () => {
    await expect(FiltersApi.getById("vibrant", "missing-filter")).rejects.toThrow("Filter not found");
  });

  it("searches local filters by name", async () => {
    const results = await FiltersApi.search("vivid");
    expect(results.some((filter) => filter.id === "filter-vivid")).toBe(true);
  });
});
