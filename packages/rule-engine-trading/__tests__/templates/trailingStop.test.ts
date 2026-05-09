import { describe, it, expect } from 'vitest';
import { ConditionToJsonLogicConverter } from 'rule-engine-monorepo/rule-engine';
import { createTrailingStopTemplate } from '../../src/templates/trailingStop.js';
import { ActionType } from '../../src/domain/TradingEnums.js';

describe('trailingStop', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Factory validation
  // ──────────────────────────────────────────────────────────────────────────

  it('should create a valid RuleTemplate with distance only (no activation)', () => {
    const template = createTrailingStopTemplate({ distance: 0.5 });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should create a valid RuleTemplate with distance and activationR', () => {
    const template = createTrailingStopTemplate({ distance: 0.5, activationR: 1 });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should throw when distance is 0', () => {
    expect(() => createTrailingStopTemplate({ distance: 0 })).toThrow(/distance/i);
  });

  it('should throw when distance is negative', () => {
    expect(() => createTrailingStopTemplate({ distance: -0.1 })).toThrow(/distance/i);
  });

  it('should throw when activationR is 0', () => {
    expect(() => createTrailingStopTemplate({ distance: 0.5, activationR: 0 })).toThrow(/activationR/i);
  });

  it('should throw when activationR is negative', () => {
    expect(() => createTrailingStopTemplate({ distance: 0.5, activationR: -1 })).toThrow(/activationR/i);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // isRecurring — the phare property
  // ──────────────────────────────────────────────────────────────────────────

  it('should have isRecurring === true', () => {
    const template = createTrailingStopTemplate({ distance: 0.5 });
    expect(template.isRecurring).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Action shape
  // ──────────────────────────────────────────────────────────────────────────

  it('should emit a MOVE_STOP_LOSS action with newStopPrice: { var: "trailingNewSL" }', () => {
    const template = createTrailingStopTemplate({ distance: 0.5 });
    const action = template.actions[0];
    expect(action.actionRef).toBe(ActionType.MOVE_STOP_LOSS);
    expect(action.parameters.newStopPrice).toEqual({ var: 'trailingNewSL' });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Condition shape
  // ──────────────────────────────────────────────────────────────────────────

  it('should have a condition referencing trailingShouldExecute', () => {
    const template = createTrailingStopTemplate({ distance: 0.5 });
    const jsonLogic = ConditionToJsonLogicConverter.convert(template.condition);
    const serialized = JSON.stringify(jsonLogic);
    expect(serialized).toContain('trailingShouldExecute');
  });
});
