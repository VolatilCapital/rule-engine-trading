// Enums pour les types d'actions
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
 * Type de déclencheur pour les règles.
 * Détermine quand une règle doit être évaluée.
 */
export var TriggerType;
(function (TriggerType) {
    /** Évaluation sur changement de prix (avec throttle) */
    TriggerType["PRICE"] = "PRICE";
    /** Évaluation à la clôture d'une bougie */
    TriggerType["CANDLE_CLOSE"] = "CANDLE_CLOSE";
    /** Évaluation sur événement spécifique */
    TriggerType["EVENT"] = "EVENT";
})(TriggerType || (TriggerType = {}));
// Enums pour les références de conditions (pour internationalisation)
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