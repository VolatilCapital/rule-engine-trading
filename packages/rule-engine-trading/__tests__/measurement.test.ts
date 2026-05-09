/**
 * @file measurement.test.ts
 * @description Unit tests for the `Measurement` domain primitive: validation
 * via `assertMeasurement` and the three semantic field maps.
 */

import { describe, it, expect } from 'vitest';
import {
  assertMeasurement,
  PROFIT_FIELD,
  PEAK_FIELD,
  DRAWDOWN_FROM_PEAK_FIELD,
} from '../src/domain/Measurement.js';

describe('assertMeasurement', () => {
  it('accepts a well-formed Measurement', () => {
    expect(() => assertMeasurement('m', { value: 1, unit: 'R' })).not.toThrow();
    expect(() => assertMeasurement('m', { value: 0.5, unit: 'percent' })).not.toThrow();
    expect(() => assertMeasurement('m', { value: 2, unit: 'price' })).not.toThrow();
  });

  it('throws when m is null', () => {
    expect(() => assertMeasurement('threshold', null)).toThrow(/threshold/);
  });

  it('throws when m is not an object', () => {
    expect(() => assertMeasurement('threshold', 'foo')).toThrow(/threshold/);
    expect(() => assertMeasurement('threshold', 42)).toThrow(/threshold/);
  });

  it('throws when value is missing or non-numeric', () => {
    expect(() => assertMeasurement('m', { unit: 'R' })).toThrow(/value/);
    expect(() => assertMeasurement('m', { value: 'x', unit: 'R' })).toThrow(/value/);
    expect(() => assertMeasurement('m', { value: NaN, unit: 'R' })).toThrow(/value/);
    expect(() => assertMeasurement('m', { value: Infinity, unit: 'R' })).toThrow(/value/);
  });

  it('throws when unit is unknown', () => {
    expect(() => assertMeasurement('m', { value: 1, unit: 'pips' })).toThrow(
      /R \| percent \| price/,
    );
  });

  it('throws on negative value', () => {
    expect(() => assertMeasurement('threshold', { value: -1, unit: 'R' })).toThrow(
      /must be > 0/,
    );
  });

  it('throws on zero value by default', () => {
    expect(() => assertMeasurement('threshold', { value: 0, unit: 'R' })).toThrow(
      /must be > 0/,
    );
  });

  it('allows zero when allowZero is true', () => {
    expect(() =>
      assertMeasurement('lockIn', { value: 0, unit: 'R' }, { allowZero: true }),
    ).not.toThrow();
  });

  it('still rejects negative values when allowZero is true', () => {
    expect(() =>
      assertMeasurement('lockIn', { value: -0.5, unit: 'R' }, { allowZero: true }),
    ).toThrow(/must be >= 0/);
  });
});

describe('field maps', () => {
  it('PROFIT_FIELD maps every unit', () => {
    expect(PROFIT_FIELD.R).toBe('currentR');
    expect(PROFIT_FIELD.percent).toBe('currentPctFromEntry');
    expect(PROFIT_FIELD.price).toBe('currentPriceMove');
  });

  it('PEAK_FIELD maps every unit', () => {
    expect(PEAK_FIELD.R).toBe('peakR');
    expect(PEAK_FIELD.percent).toBe('peakPctFromEntry');
    expect(PEAK_FIELD.price).toBe('peakPriceMove');
  });

  it('DRAWDOWN_FROM_PEAK_FIELD maps every unit', () => {
    expect(DRAWDOWN_FROM_PEAK_FIELD.R).toBe('drawdownFromPeakR');
    expect(DRAWDOWN_FROM_PEAK_FIELD.percent).toBe('drawdownFromPeakPct');
    expect(DRAWDOWN_FROM_PEAK_FIELD.price).toBe('drawdownFromPeakPrice');
  });
});
