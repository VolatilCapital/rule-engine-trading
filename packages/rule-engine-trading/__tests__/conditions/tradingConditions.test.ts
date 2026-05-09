import { describe, it, expect } from 'vitest';
import {
  createProfitThresholdCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
  createPriceBelowCondition,
} from '../../src/conditions/tradingConditions.js';

describe('tradingConditions', () => {
  describe('createProfitThresholdCondition', () => {
    it('should create atomic condition with correct field and value', () => {
      const cond = createProfitThresholdCondition(2);
      expect(cond.field).toBe('currentR');
      expect(cond.value.rawValue).toBe(2);
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
      const c1 = createProfitThresholdCondition(1);
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
});
