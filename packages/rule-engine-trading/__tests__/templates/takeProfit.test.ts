import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createTakeProfitTemplate } from '../../src/templates/takeProfit.js';

describe('takeProfit', () => {
  it('should create a valid RuleTemplate', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 3, unit: 'R' } });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should include a PLACE_ORDER action with close_position type', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 3, unit: 'R' } });
    expect(template.actions[0].actionRef).toBe('PLACE_ORDER');
    expect(template.actions[0].parameters.type).toBe('close_position');
  });

  it('should have a historical condition for not-executed', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 2, unit: 'R' } });
    expect(template.historicalConditions.length).toBeGreaterThan(0);
    expect(template.historicalConditions[0].factKey).toBe('position_closed_for_profit');
  });

  it('should emit a condition on currentR for unit R', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 2, unit: 'R' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
  });

  it('should emit a condition on currentPctFromEntry for unit percent', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
    expect(json).not.toContain('"currentR"');
  });

  it('should emit a condition on currentPriceMove for unit price', () => {
    const template = createTakeProfitTemplate({ threshold: { value: 0.5, unit: 'price' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
  });

  it('should throw on invalid unit', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => createTakeProfitTemplate({ threshold: { value: 1, unit: 'pips' as any } })).toThrow(
      /R \| percent \| price/,
    );
  });
});
