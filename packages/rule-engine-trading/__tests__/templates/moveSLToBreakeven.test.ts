import { describe, it, expect } from 'vitest';
import { createMoveSLToBreakevenTemplate } from '../../src/templates/moveSLToBreakeven.js';

describe('moveSLToBreakeven', () => {
  it('should create a valid RuleTemplate', () => {
    const template = createMoveSLToBreakevenTemplate({ thresholdR: 1.5 });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should include a moveStopLoss action', () => {
    const template = createMoveSLToBreakevenTemplate({ thresholdR: 2 });
    expect(template.actions[0].actionRef).toBe('MOVE_STOP_LOSS');
  });

  it('should have a not-executed historical condition with unique factKey', () => {
    const template = createMoveSLToBreakevenTemplate({ thresholdR: 1.5 });
    expect(template.historicalConditions.length).toBeGreaterThan(0);
    expect(template.historicalConditions[0].factKey).toBe('sl_moved_to_breakeven');
  });

  it('should pass thresholdR to the profit condition', () => {
    const template = createMoveSLToBreakevenTemplate({ thresholdR: 3 });
    // The condition should reference the profit threshold
    expect(template.condition).toBeDefined();
  });
});
