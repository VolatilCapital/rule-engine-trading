// Enums pour les types d'actions
export enum ActionType {
  MOVE_STOP_LOSS = 'MOVE_STOP_LOSS',
  PLACE_ORDER = 'PLACE_ORDER',
  PARTIAL_CLOSE = 'PARTIAL_CLOSE',
  SCALE_OUT = 'SCALE_OUT',
  START_TRAILING_STOP = 'START_TRAILING_STOP',
  CANCEL_POSITION = 'CANCEL_POSITION'
}

/**
 * Type de déclencheur pour les règles.
 * Détermine quand une règle doit être évaluée.
 */
export enum TriggerType {
  /** Évaluation sur changement de prix (avec throttle) */
  PRICE = 'PRICE',
  /** Évaluation à la clôture d'une bougie */
  CANDLE_CLOSE = 'CANDLE_CLOSE',
  /** Évaluation sur événement spécifique */
  EVENT = 'EVENT',
}

// Enums pour les références de conditions (pour internationalisation)
export enum ConditionReference {
  PROFIT_RATIO_GREATER_EQUAL = 'PROFIT_RATIO_GREATER_EQUAL',
  POSITION_SIZE_GREATER_THAN = 'POSITION_SIZE_GREATER_THAN',
  VOLUME_GREATER_THAN = 'VOLUME_GREATER_THAN',
  MAX_DRAWDOWN_LESS_THAN = 'MAX_DRAWDOWN_LESS_THAN',
  BARS_SINCE_ENTRY_GREATER_THAN = 'BARS_SINCE_ENTRY_GREATER_THAN',
  STOP_LOSS_TRIGGERED_EQUAL = 'STOP_LOSS_TRIGGERED_EQUAL',
  IS_TRAILING_NOT_EQUAL = 'IS_TRAILING_NOT_EQUAL',
  SL_MOVED_EQUAL_TRUE = 'SL_MOVED_EQUAL_TRUE',
  PARTIAL_SL_DONE_NOT_EQUAL_TRUE = 'PARTIAL_SL_DONE_NOT_EQUAL_TRUE',
  PRICE_LEVEL_REACHED = 'PRICE_LEVEL_REACHED'
}