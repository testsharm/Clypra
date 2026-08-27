import type { TransitionAsset, TransitionCategory } from "../types";
import { LOCAL_TRANSITIONS } from "../localTransitions";

export class TransitionsApi {
  static async getManifest(): Promise<{ categories: Array<{ id: string; name: string; count: number }>; totalCount: number }> {
    return {
      categories: [{ id: "basic", name: "Basic", count: LOCAL_TRANSITIONS.length }],
      totalCount: LOCAL_TRANSITIONS.length,
    };
  }

  static async getCategories(): Promise<TransitionCategory[]> {
    return [{ id: "basic", name: "Basic", description: "Bundled transitions" }];
  }

  static async getByCategory(_category: string): Promise<TransitionAsset[]> {
    return LOCAL_TRANSITIONS;
  }

  static async getById(_category: string, id: string): Promise<TransitionAsset> {
    const match = LOCAL_TRANSITIONS.find((transition) => transition.id === id);
    if (!match) throw new Error(`Transition not found: ${id}`);
    return match;
  }

  static async search(query: string): Promise<TransitionAsset[]> {
    const q = query.toLowerCase();
    return LOCAL_TRANSITIONS.filter((transition) => transition.name.toLowerCase().includes(q) || transition.description.toLowerCase().includes(q));
  }
}
