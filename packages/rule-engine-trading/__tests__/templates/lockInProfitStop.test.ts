import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import {
  createLockInProfitStopTemplate,
  lockInProfitStopParamsMap,
} from '../../src/templates/lockInProfitStop.js';

describe('lockInProfitStop', () => {
  it('emits a condition on currentR for unit R', () => {
    const template = createLockInProfitStopTemplate({
      trigger: { value: 3, unit: 'R' },
      lockIn: { value: 1, unit: 'R' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
    // Action should reference lockInStopPrice_1R
    expect(template.actions[0].parameters.newStopPrice).toEqual({ var: 'lockInStopPrice_1R' });
  });

  it('emits a condition on currentPctFromEntry for unit percent', () => {
    const template = createLockInProfitStopTemplate({
      trigger: { value: 2, unit: 'percent' },
      lockIn: { value: 1, unit: 'percent' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
    expect(template.actions[0].parameters.newStopPrice).toEqual({ var: 'lockInStopPrice_1pct' });
  });

  it('emits a condition on currentPriceMove for unit price', () => {
    const template = createLockInProfitStopTemplate({
      trigger: { value: 1, unit: 'price' },
      lockIn: { value: 0.5, unit: 'price' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
    expect(template.actions[0].parameters.newStopPrice).toEqual({ var: 'lockInStopPrice_0_5price' });
  });

  it('throws when trigger and lockIn have different units', () => {
    expect(() =>
      createLockInProfitStopTemplate({
        trigger: { value: 3, unit: 'R' },
        lockIn: { value: 1, unit: 'percent' },
      }),
    ).toThrow(/trigger.*lockIn.*unit/i);
  });

  it('throws when lockIn.value >= trigger.value', () => {
    expect(() =>
      createLockInProfitStopTemplate({
        trigger: { value: 1, unit: 'R' },
        lockIn: { value: 1, unit: 'R' },
      }),
    ).toThrow(/lockIn\.value.*trigger\.value/);
  });

  it('allows lockIn.value of 0', () => {
    expect(() =>
      createLockInProfitStopTemplate({
        trigger: { value: 1, unit: 'R' },
        lockIn: { value: 0, unit: 'R' },
      }),
    ).not.toThrow();
  });

  it('registers params in lockInProfitStopParamsMap', () => {
    const template = createLockInProfitStopTemplate({
      trigger: { value: 3, unit: 'R' },
      lockIn: { value: 1, unit: 'R' },
      ruleId: 'test',
    });
    const stored = lockInProfitStopParamsMap.get(template);
    expect(stored).toBeDefined();
    expect(stored?.trigger.value).toBe(3);
    expect(stored?.lockIn.unit).toBe('R');
  });
});
