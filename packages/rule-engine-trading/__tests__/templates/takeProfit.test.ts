import { describe, it, expect } from 'vitest';
import { createTakeProfitTemplate } from '../../src/templates/takeProfit.js';

describe('takeProfit', () => {
  it('should create a valid RuleTemplate', () => {
    const template = createTakeProfitTemplate({ thresholdR: 3 });
    expect(template).toBeDefined();
    expect(template.condition).toBeDefined();
    expect(template.actions.length).toBeGreaterThan(0);
  });

  it('should include a PLACE_ORDER action with close_position type', () => {
    const template = createTakeProfitTemplate({ thresholdR: 3 });
    expect(template.actions[0].actionRef).toBe('PLACE_ORDER');
    expect(template.actions[0].parameters.type).toBe('close_position');
  });

  it('should have a historical condition for not-executed', () => {
    const template = createTakeProfitTemplate({ thresholdR: 2 });
    expect(template.historicalConditions.length).toBeGreaterThan(0);
    expect(template.historicalConditions[0].factKey).toBe('position_closed_for_profit');
  });
});
