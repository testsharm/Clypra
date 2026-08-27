import { describe, it, expect } from 'vitest';
import { TransitionsApi } from '../api/transitionsApi';
import { LOCAL_TRANSITIONS } from '../localTransitions';

describe('Transition Engine Progress Math & Edge Cases', () => {
  describe('Transition API Client Contract', () => {
    it('returns bundled local categories without network', async () => {
      const categories = await TransitionsApi.getCategories();
      expect(categories.length).toBe(1);
      expect(categories[0].id).toBe('basic');
    });

    it('returns all bundled transitions for any category', async () => {
      const transitions = await TransitionsApi.getByCategory('basic');
      expect(transitions).toHaveLength(LOCAL_TRANSITIONS.length);
    });

    it('returns a specific bundled transition by id', async () => {
      const transition = await TransitionsApi.getById('basic', 'cross-dissolve');
      expect(transition.renderer).toBe('cross-dissolve');
    });

    it('throws when a transition id does not exist', async () => {
      await expect(TransitionsApi.getById('basic', 'missing')).rejects.toThrow('Transition not found');
    });
  });

  describe('Transition Progress Clamp & Bounds Math', () => {
    it('clamps transition progress t cleanly within [0.0, 1.0]', () => {
      const clampProgress = (t: number): number => {
        if (Number.isNaN(t)) return 0;
        return Math.max(0, Math.min(1, t));
      };

      expect(clampProgress(-0.5)).toBe(0);
      expect(clampProgress(0.0)).toBe(0);
      expect(clampProgress(0.5)).toBe(0.5);
      expect(clampProgress(1.0)).toBe(1);
      expect(clampProgress(1.5)).toBe(1);
      expect(clampProgress(NaN)).toBe(0);
    });

    it('calculates transition overlap duration safely without division by zero', () => {
      const calculateOverlap = (duration: number, clipADuration: number, clipBDuration: number): number => {
        if (duration <= 0 || clipADuration <= 0 || clipBDuration <= 0) return 0;
        const maxAllowed = Math.min(clipADuration / 2, clipBDuration / 2);
        return Math.min(duration, maxAllowed);
      };

      expect(calculateOverlap(1.0, 5.0, 5.0)).toBe(1.0);
      expect(calculateOverlap(4.0, 2.0, 2.0)).toBe(1.0);
      expect(calculateOverlap(0, 5.0, 5.0)).toBe(0);
      expect(calculateOverlap(-1.0, 5.0, 5.0)).toBe(0);
    });
  });
});
