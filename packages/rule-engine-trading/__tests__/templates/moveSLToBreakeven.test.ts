import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createMoveSLToBreakevenTemplate } from '../../src/templates/moveSLToBreakeven.js';

describe('moveSLToBreakeven', () => {
  it('should create a valid RuleTemplate', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 1.5, unit: 'R' } });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should include a moveStopLoss action', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 2, unit: 'R' } });
    expect(template.actions[0].actionRef).toBe('MOVE_STOP_LOSS');
  });

  it('should have a not-executed historical condition with unique factKey', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 1.5, unit: 'R' } });
    expect(template.historicalConditions.length).toBeGreaterThan(0);
    expect(template.historicalConditions[0].factKey).toBe('sl_moved_to_breakeven');
  });

  it('should emit a condition on currentR for unit R', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 3, unit: 'R' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
  });

  it('should emit a condition on currentPctFromEntry for unit percent', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 1.5, unit: 'percent' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
  });

  it('should emit a condition on currentPriceMove for unit price', () => {
    const template = createMoveSLToBreakevenTemplate({ threshold: { value: 0.5, unit: 'price' } });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
  });
});
