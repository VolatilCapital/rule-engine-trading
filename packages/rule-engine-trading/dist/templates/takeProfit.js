import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createProfitThresholdCondition, createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';
export function createTakeProfitTemplate(params) {
    const { thresholdR } = params;
    const actions = [
        createClosePositionAction()
    ];
    const historicalConditions = [
        createHistoricalCondition('position_closed_for_profit')
    ];
    const condition = createAndCondition([
        createProfitThresholdCondition(thresholdR),
        createNotExecutedCondition('position_closed_for_profit')
    ], 'main_condition');
    return RuleTemplate.create(condition, actions, historicalConditions);
}
//# sourceMappingURL=takeProfit.js.map