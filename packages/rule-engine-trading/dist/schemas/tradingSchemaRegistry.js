/**
 * @file tradingSchemaRegistry.ts
 * @description Factory function to create a pre-configured SchemaRegistry for trading.
 */
import { SchemaRegistry } from 'rule-engine-monorepo/rule-engine';
import { tradingActionSchemas } from './actionSchemas.js';
import { tradingConditionSchemas } from './conditionSchemas.js';
/**
 * Creates a SchemaRegistry pre-populated with all trading action and condition schemas.
 */
export function createTradingSchemaRegistry() {
    const registry = new SchemaRegistry();
    registry.registerActions(tradingActionSchemas);
    registry.registerConditions(tradingConditionSchemas);
    return registry;
}
//# sourceMappingURL=tradingSchemaRegistry.js.map