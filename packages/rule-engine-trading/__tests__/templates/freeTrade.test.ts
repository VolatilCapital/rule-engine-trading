import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createFreeTradeTemplate } from '../../src/templates/freeTrade.js';

describe('freeTrade', () => {
  it('emits a condition on currentR for unit R and computes the ratio', () => {
    const template = createFreeTradeTemplate({
      trigger: { value: 2, unit: 'R' },
      recover: { value: 1, unit: 'R' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
    // (1 / 2) * 100 = 50
    expect(template.actions[0].parameters.percentage).toBe(50);
  });

  it('emits a condition on currentPctFromEntry for unit percent', () => {
    const template = createFreeTradeTemplate({
      trigger: { value: 2, unit: 'percent' },
      recover: { value: 1, unit: 'percent' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
    expect(template.actions[0].parameters.percentage).toBe(50);
  });

  it('emits a condition on currentPriceMove for unit price', () => {
    const template = createFreeTradeTemplate({
      trigger: { value: 1, unit: 'price' },
      recover: { value: 0.5, unit: 'price' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
    expect(template.actions[0].parameters.percentage).toBe(50);
  });

  it('throws when trigger and recover have different units', () => {
    expect(() =>
      createFreeTradeTemplate({
        trigger: { value: 2, unit: 'R' },
        recover: { value: 1, unit: 'percent' },
      }),
    ).toThrow(/trigger.*recover.*unit/i);
  });

  it('throws when trigger.value < recover.value', () => {
    expect(() =>
      createFreeTradeTemplate({
        trigger: { value: 0.5, unit: 'R' },
        recover: { value: 1, unit: 'R' },
      }),
    ).toThrow(/trigger\.value.*recover\.value/);
  });
});
