/**
 * @file maxDrawdownFromPeak.test.ts
 * @description Unit tests for the multi-unit max-drawdown-from-peak template.
 * Locks the contract: validation errors, same-unit constraint, per-unit
 * condition emission, and the R-only `MAX_DD_*` predefined constants.
 */

import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import {
  createMaxDrawdownFromPeakTemplate,
  MAX_DD_4R_PEAK_25R_DD,
  MAX_DD_3R_PEAK_15R_DD,
  MAX_DD_2R_PEAK_1R_DD,
  MAX_DD_5R_PEAK_2R_DD_MIN_1R,
} from '../../src/templates/maxDrawdownFromPeak.js';

describe('maxDrawdownFromPeak — measurement validation', () => {
  it('throws when minPeak is malformed (not an object)', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        // @ts-expect-error invalid measurement at the boundary
        minPeak: 3,
        maxDrawdown: { value: 1.5, unit: 'R' },
      }),
    ).toThrow(/minPeak must be a Measurement object/);
  });

  it('throws when minPeak.value is 0 (must be > 0)', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 0, unit: 'R' },
        maxDrawdown: { value: 1.5, unit: 'R' },
      }),
    ).toThrow(/minPeak\.value must be > 0/);
  });

  it('throws when maxDrawdown.value is negative', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: -1, unit: 'R' },
      }),
    ).toThrow(/maxDrawdown\.value must be > 0/);
  });

  it('throws when minPeak.unit is not R | percent | price', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        // @ts-expect-error invalid unit at the boundary
        minPeak: { value: 2, unit: 'pips' },
        maxDrawdown: { value: 1, unit: 'R' },
      }),
    ).toThrow(/minPeak\.unit must be one of R \| percent \| price/);
  });

  it('accepts minCurrent.value of 0 (allowZero)', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: 1.5, unit: 'R' },
        minCurrent: { value: 0, unit: 'R' },
      }),
    ).not.toThrow();
  });
});

describe('maxDrawdownFromPeak — same-unit constraint', () => {
  it('throws when minPeak and maxDrawdown have different units', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: 1, unit: 'percent' },
      }),
    ).toThrow(/minPeak, maxDrawdown, and minCurrent must share the same unit/);
  });

  it('throws when minCurrent has a different unit from minPeak/maxDrawdown', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: 1.5, unit: 'R' },
        minCurrent: { value: 0.5, unit: 'percent' },
      }),
    ).toThrow(/minPeak, maxDrawdown, and minCurrent must share the same unit/);
  });

  it('throws when maxDrawdown has a different unit (with minCurrent omitted)', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 1, unit: 'price' },
        maxDrawdown: { value: 0.5, unit: 'R' },
      }),
    ).toThrow(/minPeak, maxDrawdown, and minCurrent must share the same unit/);
  });

  it('accepts when all three measurements share the same unit', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 2, unit: 'percent' },
        maxDrawdown: { value: 1, unit: 'percent' },
        minCurrent: { value: 0.5, unit: 'percent' },
      }),
    ).not.toThrow();
  });
});

describe('maxDrawdownFromPeak — per-unit condition emission', () => {
  it('emits conditions on peakR / drawdownFromPeakR for unit R', () => {
    const template = createMaxDrawdownFromPeakTemplate({
      minPeak: { value: 3, unit: 'R' },
      maxDrawdown: { value: 1.5, unit: 'R' },
      ruleId: 'r-only',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('peakR');
    expect(json).toContain('drawdownFromPeakR');
    expect(json).not.toContain('peakPctFromEntry');
    expect(json).not.toContain('peakPriceMove');
  });

  it('emits conditions on peakPctFromEntry / drawdownFromPeakPct for unit percent', () => {
    const template = createMaxDrawdownFromPeakTemplate({
      minPeak: { value: 2, unit: 'percent' },
      maxDrawdown: { value: 1, unit: 'percent' },
      ruleId: 'pct-only',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('peakPctFromEntry');
    expect(json).toContain('drawdownFromPeakPct');
    expect(json).not.toContain('peakR');
    expect(json).not.toContain('drawdownFromPeakR');
  });

  it('emits conditions on peakPriceMove / drawdownFromPeakPrice for unit price', () => {
    const template = createMaxDrawdownFromPeakTemplate({
      minPeak: { value: 2, unit: 'price' },
      maxDrawdown: { value: 1, unit: 'price' },
      ruleId: 'price-only',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('peakPriceMove');
    expect(json).toContain('drawdownFromPeakPrice');
    expect(json).not.toContain('peakR');
    expect(json).not.toContain('peakPctFromEntry');
  });

  it('emits a min-current check on currentR when minCurrent is provided (unit R)', () => {
    const template = createMaxDrawdownFromPeakTemplate({
      minPeak: { value: 3, unit: 'R' },
      maxDrawdown: { value: 1.5, unit: 'R' },
      minCurrent: { value: 0.5, unit: 'R' },
      ruleId: 'with-current',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    expect(json).toContain('currentR');
  });

  it('omits the min-current check when minCurrent is undefined', () => {
    const template = createMaxDrawdownFromPeakTemplate({
      minPeak: { value: 3, unit: 'percent' },
      maxDrawdown: { value: 1.5, unit: 'percent' },
      ruleId: 'no-current',
    });
    const json = JSON.stringify(ConditionToJsonLogicConverter.convert(template.condition));
    // The percent-unit profit field is currentPctFromEntry — must not appear.
    expect(json).not.toContain('currentPctFromEntry');
  });
});

describe('maxDrawdownFromPeak — predefined R-only constants', () => {
  it('MAX_DD_4R_PEAK_25R_DD compiles and emits R-field conditions', () => {
    const json = JSON.stringify(
      ConditionToJsonLogicConverter.convert(MAX_DD_4R_PEAK_25R_DD.condition),
    );
    expect(json).toContain('peakR');
    expect(json).toContain('drawdownFromPeakR');
  });

  it('MAX_DD_3R_PEAK_15R_DD compiles', () => {
    expect(MAX_DD_3R_PEAK_15R_DD).toBeDefined();
    expect(MAX_DD_3R_PEAK_15R_DD.actions.length).toBeGreaterThan(0);
  });

  it('MAX_DD_2R_PEAK_1R_DD compiles', () => {
    expect(MAX_DD_2R_PEAK_1R_DD).toBeDefined();
  });

  it('MAX_DD_5R_PEAK_2R_DD_MIN_1R includes the min-current check', () => {
    const json = JSON.stringify(
      ConditionToJsonLogicConverter.convert(MAX_DD_5R_PEAK_2R_DD_MIN_1R.condition),
    );
    expect(json).toContain('peakR');
    expect(json).toContain('drawdownFromPeakR');
    expect(json).toContain('currentR');
  });
});

describe('maxDrawdownFromPeak — closePercentage', () => {
  it('throws when closePercentage <= 0', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: 1.5, unit: 'R' },
        closePercentage: 0,
      }),
    ).toThrow(/closePercentage must be between 0 and 100/);
  });

  it('throws when closePercentage > 100', () => {
    expect(() =>
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 3, unit: 'R' },
        maxDrawdown: { value: 1.5, unit: 'R' },
        closePercentage: 150,
      }),
    ).toThrow(/closePercentage must be between 0 and 100/);
  });
});
