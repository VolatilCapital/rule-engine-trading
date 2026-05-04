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
  PROFIT_1R: createProfitThresholdCondition(1),
  PROFIT_1_5R: createProfitThresholdCondition(1.5),
  PROFIT_2R: createProfitThresholdCondition(2),
  PROFIT_3R: createProfitThresholdCondition(3),
  PROFIT_5R: createProfitThresholdCondition(5),

  SL_NOT_MOVED: createNotExecutedCondition('sl_moved_to_breakeven'),
  POSITION_NOT_CLOSED: createNotExecutedCondition('position_closed_for_profit')
};

// Templates prédéfinis
export const TEMPLATES = {
  SL_BREAKEVEN_1R: createMoveSLToBreakevenTemplate({ thresholdR: 1 }),
  SL_BREAKEVEN_1_5R: createMoveSLToBreakevenTemplate({ thresholdR: 1.5 }),
  SL_BREAKEVEN_2R: createMoveSLToBreakevenTemplate({ thresholdR: 2 }),
  SL_BREAKEVEN_3R: createMoveSLToBreakevenTemplate({ thresholdR: 3 }),

  TAKE_PROFIT_2R: createTakeProfitTemplate({ thresholdR: 2 }),
  TAKE_PROFIT_3R: createTakeProfitTemplate({ thresholdR: 3 }),
  TAKE_PROFIT_5R: createTakeProfitTemplate({ thresholdR: 5 })
};