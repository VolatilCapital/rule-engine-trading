import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createTakePartialTemplate } from '../../src/templates/takePartial.js';

describe('takePartial', () => {
  it('should emit a condition on currentR for unit R', () => {
    const template = createTakePartialTemplate({
      threshold: { value: 1, unit: 'R' },
      closePercentage: 50,
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
  });

  it('should emit a condition on currentPctFromEntry for unit percent', () => {
    const template = createTakePartialTemplate({
      threshold: { value: 1.5, unit: 'percent' },
      closePercentage: 50,
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
  });

  it('should emit a condition on currentPriceMove for unit price', () => {
    const template = createTakePartialTemplate({
      threshold: { value: 0.5, unit: 'price' },
      closePercentage: 50,
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
  });

  it('should throw when closePercentage is out of range', () => {
    expect(() =>
      createTakePartialTemplate({ threshold: { value: 1, unit: 'R' }, closePercentage: 0 }),
    ).toThrow(/closePercentage/);
    expect(() =>
      createTakePartialTemplate({ threshold: { value: 1, unit: 'R' }, closePercentage: 150 }),
    ).toThrow(/closePercentage/);
  });

  it('should throw on malformed threshold', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => createTakePartialTemplate({ threshold: { value: -1, unit: 'R' } as any, closePercentage: 50 })).toThrow();
  });
});
