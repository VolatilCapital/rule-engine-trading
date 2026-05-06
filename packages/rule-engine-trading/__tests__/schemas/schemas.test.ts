import { describe, it, expect } from 'vitest';
import { createTradingSchemaRegistry } from '../../src/schemas/tradingSchemaRegistry.js';
import { ActionType, ConditionReference } from '../../src/domain/TradingEnums.js';

describe('tradingSchemaRegistry', () => {
  it('should have all trading action schemas', () => {
    const registry = createTradingSchemaRegistry();
    expect(registry.hasAction(ActionType.MOVE_STOP_LOSS)).toBe(true);
    expect(registry.hasAction(ActionType.PLACE_ORDER)).toBe(true);
    expect(registry.hasAction(ActionType.PARTIAL_CLOSE)).toBe(true);
    expect(registry.hasAction(ActionType.CANCEL_POSITION)).toBe(true);
  });

  it('should have all trading condition schemas', () => {
    const registry = createTradingSchemaRegistry();
    expect(registry.hasCondition(ConditionReference.PROFIT_RATIO_GREATER_EQUAL)).toBe(true);
    expect(registry.hasCondition(ConditionReference.POSITION_SIZE_GREATER_THAN)).toBe(true);
    expect(registry.hasCondition(ConditionReference.VOLUME_GREATER_THAN)).toBe(true);
    expect(registry.hasCondition(ConditionReference.MAX_DRAWDOWN_LESS_THAN)).toBe(true);
    expect(registry.hasCondition(ConditionReference.BARS_SINCE_ENTRY_GREATER_THAN)).toBe(true);
  });

  it('should have correct categories for actions', () => {
    const registry = createTradingSchemaRegistry();
    const stopLossActions = registry.getActionsByCategory('stop_loss');
    expect(stopLossActions.length).toBeGreaterThanOrEqual(2);
    const orderActions = registry.getActionsByCategory('orders');
    expect(orderActions.length).toBeGreaterThanOrEqual(2);
  });

  it('should have parameters for MOVE_STOP_LOSS action', () => {
    const registry = createTradingSchemaRegistry();
    const schema = registry.getAction(ActionType.MOVE_STOP_LOSS);
    expect(schema).toBeDefined();
    expect(schema!.parameters.length).toBeGreaterThan(0);
    expect(schema!.parameters[0].required).toBe(true);
  });

  it('should have fields for PROFIT_RATIO condition', () => {
    const registry = createTradingSchemaRegistry();
    const schema = registry.getCondition(ConditionReference.PROFIT_RATIO_GREATER_EQUAL);
    expect(schema).toBeDefined();
    expect(schema!.fields.length).toBeGreaterThan(0);
    expect(schema!.fields[0].type).toBe('number');
  });
});
