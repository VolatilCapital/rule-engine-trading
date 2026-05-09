import { describe, it, expect } from 'vitest';
import {
  createProfitThresholdCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
  createPriceBelowCondition,
  createPeakReachedCondition,
  createDrawdownFromPeakCondition,
} from '../../src/conditions/tradingConditions.js';

describe('tradingConditions', () => {
  describe('createProfitThresholdCondition', () => {
    it('should create atomic condition on currentR for unit R', () => {
      const cond = createProfitThresholdCondition({ value: 2, unit: 'R' });
      expect(cond.field).toBe('currentR');
      expect(cond.value.rawValue).toBe(2);
    });

    it('should create atomic condition on currentPctFromEntry for unit percent', () => {
      const cond = createProfitThresholdCondition({ value: 1.5, unit: 'percent' });
      expect(cond.field).toBe('currentPctFromEntry');
      expect(cond.value.rawValue).toBe(1.5);
    });

    it('should create atomic condition on currentPriceMove for unit price', () => {
      const cond = createProfitThresholdCondition({ value: 0.5, unit: 'price' });
      expect(cond.field).toBe('currentPriceMove');
      expect(cond.value.rawValue).toBe(0.5);
    });
  });

  describe('createNotExecutedCondition', () => {
    it('should create with field set to fact-based path', () => {
      const cond = createNotExecutedCondition('sl_moved');
      expect(cond.field).toContain('sl_moved');
    });
  });

  describe('createAndCondition', () => {
    it('should combine conditions with AND', () => {
      const c1 = createProfitThresholdCondition({ value: 1, unit: 'R' });
      const c2 = createNotExecutedCondition('done');
      const combined = createAndCondition([c1, c2], 'combined');
      expect(combined.children).toHaveLength(2);
    });
  });

  describe('createHistoricalCondition', () => {
    it('should create memorizable condition with factKey', () => {
      const cond = createHistoricalCondition('my_fact');
      expect(cond.factKey).toBe('my_fact');
    });
  });

  describe('createPriceBelowCondition', () => {
    it('should create condition with currentPrice field', () => {
      const cond = createPriceBelowCondition(100);
      expect(cond.field).toBe('currentPrice');
      expect(cond.value.rawValue).toBe(100);
    });
  });

  describe('createPeakReachedCondition', () => {
    it('dispatches to peakR for unit R', () => {
      const cond = createPeakReachedCondition({ value: 3, unit: 'R' });
      expect(cond.field).toBe('peakR');
      expect(cond.value.rawValue).toBe(3);
    });

    it('dispatches to peakPctFromEntry for unit percent', () => {
      const cond = createPeakReachedCondition({ value: 1.5, unit: 'percent' });
      expect(cond.field).toBe('peakPctFromEntry');
      expect(cond.value.rawValue).toBe(1.5);
    });

    it('dispatches to peakPriceMove for unit price', () => {
      const cond = createPeakReachedCondition({ value: 0.5, unit: 'price' });
      expect(cond.field).toBe('peakPriceMove');
      expect(cond.value.rawValue).toBe(0.5);
    });

    it('throws on malformed measurement', () => {
      expect(() =>
        createPeakReachedCondition({ value: 0, unit: 'R' }),
      ).toThrow(/threshold\.value must be > 0/);
    });
  });

  describe('createDrawdownFromPeakCondition', () => {
    it('dispatches to drawdownFromPeakR for unit R', () => {
      const cond = createDrawdownFromPeakCondition({ value: 1.5, unit: 'R' });
      expect(cond.field).toBe('drawdownFromPeakR');
      expect(cond.value.rawValue).toBe(1.5);
    });

    it('dispatches to drawdownFromPeakPct for unit percent', () => {
      const cond = createDrawdownFromPeakCondition({ value: 1, unit: 'percent' });
      expect(cond.field).toBe('drawdownFromPeakPct');
      expect(cond.value.rawValue).toBe(1);
    });

    it('dispatches to drawdownFromPeakPrice for unit price', () => {
      const cond = createDrawdownFromPeakCondition({ value: 0.25, unit: 'price' });
      expect(cond.field).toBe('drawdownFromPeakPrice');
      expect(cond.value.rawValue).toBe(0.25);
    });

    it('throws on malformed measurement', () => {
      expect(() =>
        // @ts-expect-error invalid unit at the boundary
        createDrawdownFromPeakCondition({ value: 1, unit: 'pips' }),
      ).toThrow(/threshold\.unit must be one of R \| percent \| price/);
    });
  });
});
