// Action type enums
export var ActionType;
(function (ActionType) {
    ActionType["MOVE_STOP_LOSS"] = "MOVE_STOP_LOSS";
    ActionType["PLACE_ORDER"] = "PLACE_ORDER";
    ActionType["PARTIAL_CLOSE"] = "PARTIAL_CLOSE";
    ActionType["SCALE_OUT"] = "SCALE_OUT";
    ActionType["START_TRAILING_STOP"] = "START_TRAILING_STOP";
    ActionType["CANCEL_POSITION"] = "CANCEL_POSITION";
})(ActionType || (ActionType = {}));
/**
 * Trigger type for rules.
 * Determines when a rule should be evaluated.
 */
export var TriggerType;
(function (TriggerType) {
    /** Evaluation on price change (throttled) */
    TriggerType["PRICE"] = "PRICE";
    /** Evaluation at candle close */
    TriggerType["CANDLE_CLOSE"] = "CANDLE_CLOSE";
    /** Evaluation on a specific event */
    TriggerType["EVENT"] = "EVENT";
})(TriggerType || (TriggerType = {}));
// Condition reference enums (for internationalization)
export var ConditionReference;
(function (ConditionReference) {
    ConditionReference["PROFIT_RATIO_GREATER_EQUAL"] = "PROFIT_RATIO_GREATER_EQUAL";
    ConditionReference["POSITION_SIZE_GREATER_THAN"] = "POSITION_SIZE_GREATER_THAN";
    ConditionReference["VOLUME_GREATER_THAN"] = "VOLUME_GREATER_THAN";
    ConditionReference["MAX_DRAWDOWN_LESS_THAN"] = "MAX_DRAWDOWN_LESS_THAN";
    ConditionReference["BARS_SINCE_ENTRY_GREATER_THAN"] = "BARS_SINCE_ENTRY_GREATER_THAN";
    ConditionReference["STOP_LOSS_TRIGGERED_EQUAL"] = "STOP_LOSS_TRIGGERED_EQUAL";
    ConditionReference["IS_TRAILING_NOT_EQUAL"] = "IS_TRAILING_NOT_EQUAL";
    ConditionReference["SL_MOVED_EQUAL_TRUE"] = "SL_MOVED_EQUAL_TRUE";
    ConditionReference["PARTIAL_SL_DONE_NOT_EQUAL_TRUE"] = "PARTIAL_SL_DONE_NOT_EQUAL_TRUE";
    ConditionReference["PRICE_LEVEL_REACHED"] = "PRICE_LEVEL_REACHED";
})(ConditionReference || (ConditionReference = {}));
//# sourceMappingURL=TradingEnums.js.map