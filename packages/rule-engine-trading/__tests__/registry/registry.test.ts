import { describe, it, expect } from 'vitest';
import { tradingRuleRegistry } from '../../src/registry/registry.js';
import { ACTIONS, CONDITIONS, TEMPLATES } from '../../src/registry/instances.js';

describe('tradingRuleRegistry', () => {
  it('should contain at least 19 entries', () => {
    expect(Object.keys(tradingRuleRegistry).length).toBeGreaterThanOrEqual(19);
  });

  it('should have key templates indexed', () => {
    expect(tradingRuleRegistry['sl-breakeven-2r']).toBeDefined();
    expect(tradingRuleRegistry['tp-2r']).toBeDefined();
  });

  it('every entry should be a valid RuleTemplate with actions', () => {
    for (const [key, template] of Object.entries(tradingRuleRegistry)) {
      expect(template.actions.length).toBeGreaterThan(0);
      expect(template.condition).toBeDefined();
    }
  });
});

describe('predefined instances', () => {
  it('ACTIONS should contain predefined actions', () => {
    expect(ACTIONS.MOVE_STOP_LOSS_TO_BREAKEVEN).toBeDefined();
    expect(ACTIONS.MOVE_STOP_LOSS_TO_BREAKEVEN.actionRef).toBe('MOVE_STOP_LOSS');
    expect(ACTIONS.CLOSE_POSITION).toBeDefined();
    expect(ACTIONS.CLOSE_POSITION.actionRef).toBe('PLACE_ORDER');
    expect(ACTIONS.CANCEL_POSITION).toBeDefined();
  });

  it('CONDITIONS should contain predefined conditions', () => {
    expect(CONDITIONS.PROFIT_2R).toBeDefined();
    expect(CONDITIONS.PROFIT_2R.field).toBe('currentR');
    expect(CONDITIONS.SL_NOT_MOVED).toBeDefined();
  });

  it('TEMPLATES should contain predefined templates with valid structure', () => {
    expect(TEMPLATES.SL_BREAKEVEN_2R).toBeDefined();
    expect(TEMPLATES.SL_BREAKEVEN_2R.actions.length).toBeGreaterThan(0);
    expect(TEMPLATES.TAKE_PROFIT_3R).toBeDefined();
    expect(TEMPLATES.TAKE_PROFIT_3R.actions.length).toBeGreaterThan(0);
  });
});
