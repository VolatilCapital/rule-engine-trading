import { createMoveStopLossAction } from '../actions/moveStopLoss.js';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createCancelPositionAction } from '../actions/cancelPosition.js';
import { createProfitThresholdCondition, createNotExecutedCondition } from '../conditions/tradingConditions.js';
import { createMoveSLToBreakevenTemplate } from '../templates/moveSLToBreakeven.js';
import { createTakeProfitTemplate } from '../templates/takeProfit.js';
// Actions prédéfinies
export const ACTIONS = {
    MOVE_STOP_LOSS_TO_BREAKEVEN: createMoveStopLossAction({
        newStopPrice: { "var": "entryPrice" }
    }),
    CLOSE_POSITION: createClosePositionAction(),
    CANCEL_POSITION: createCancelPositionAction()
};
// Conditions prédéfinies
export const CONDITIONS = {
    PROFIT_1R: createProfitThresholdCondition({ value: 1, unit: 'R' }),
    PROFIT_1_5R: createProfitThresholdCondition({ value: 1.5, unit: 'R' }),
    PROFIT_2R: createProfitThresholdCondition({ value: 2, unit: 'R' }),
    PROFIT_3R: createProfitThresholdCondition({ value: 3, unit: 'R' }),
    PROFIT_5R: createProfitThresholdCondition({ value: 5, unit: 'R' }),
    SL_NOT_MOVED: createNotExecutedCondition('sl_moved_to_breakeven'),
    POSITION_NOT_CLOSED: createNotExecutedCondition('position_closed_for_profit')
};
// Templates prédéfinis
export const TEMPLATES = {
    SL_BREAKEVEN_1R: createMoveSLToBreakevenTemplate({ threshold: { value: 1, unit: 'R' } }),
    SL_BREAKEVEN_1_5R: createMoveSLToBreakevenTemplate({ threshold: { value: 1.5, unit: 'R' } }),
    SL_BREAKEVEN_2R: createMoveSLToBreakevenTemplate({ threshold: { value: 2, unit: 'R' } }),
    SL_BREAKEVEN_3R: createMoveSLToBreakevenTemplate({ threshold: { value: 3, unit: 'R' } }),
    TAKE_PROFIT_2R: createTakeProfitTemplate({ threshold: { value: 2, unit: 'R' } }),
    TAKE_PROFIT_3R: createTakeProfitTemplate({ threshold: { value: 3, unit: 'R' } }),
    TAKE_PROFIT_5R: createTakeProfitTemplate({ threshold: { value: 5, unit: 'R' } })
};
//# sourceMappingURL=instances.js.map