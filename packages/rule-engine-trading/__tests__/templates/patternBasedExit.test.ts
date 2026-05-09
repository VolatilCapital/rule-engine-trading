import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createPatternBasedExitTemplate } from '../../src/templates/patternBasedExit.js';

describe('patternBasedExit', () => {
  it('emits no profit-condition when minProfit is omitted', () => {
    const template = createPatternBasedExitTemplate({
      positionDirection: 'long',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).not.toContain('currentR');
    expect(json).not.toContain('currentPctFromEntry');
    expect(json).not.toContain('currentPriceMove');
  });

  it('emits a condition on currentR for minProfit unit R', () => {
    const template = createPatternBasedExitTemplate({
      positionDirection: 'long',
      minProfit: { value: 0.5, unit: 'R' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
  });

  it('emits a condition on currentPctFromEntry for minProfit unit percent', () => {
    const template = createPatternBasedExitTemplate({
      positionDirection: 'long',
      minProfit: { value: 1, unit: 'percent' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPctFromEntry');
  });

  it('emits a condition on currentPriceMove for minProfit unit price', () => {
    const template = createPatternBasedExitTemplate({
      positionDirection: 'long',
      minProfit: { value: 0.3, unit: 'price' },
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentPriceMove');
  });

  it('throws on invalid closePercentage', () => {
    expect(() =>
      createPatternBasedExitTemplate({ positionDirection: 'long', closePercentage: 0 }),
    ).toThrow(/closePercentage/);
  });
});
