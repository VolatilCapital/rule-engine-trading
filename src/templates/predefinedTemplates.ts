import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { createMoveSLToBreakevenTemplate, MoveSLToBreakevenTemplateParams } from './moveSLToBreakeven.js';
import { createTakeProfitTemplate, TakeProfitTemplateParams } from './takeProfit.js';
import { createTimeBasedStopTemplate, TimeBasedStopTemplateParams } from './timeBasedStop.js';
import { createFreeTradeTemplate, FreeTradeTemplateParams } from './freeTrade.js';
import { createLockInProfitStopTemplate, LockInProfitStopTemplateParams } from './lockInProfitStop.js';
import { createMaxDrawdownFromPeakTemplate, MaxDrawdownFromPeakTemplateParams } from './maxDrawdownFromPeak.js';
import { createPatternBasedExitTemplate, PatternBasedExitTemplateParams } from './patternBasedExit.js';
import { createCancelPendingOnPriceLevelTemplate, CancelPendingOnPriceLevelTemplateParams } from './cancelPendingOnPriceLevel.js';
import { createPartialCloseAtPriceTemplate, PartialCloseAtPriceTemplateParams } from './partialCloseAtPrice.js';

/**
 * Template categories for rule classification.
 */
export type TemplateCategory =
  | 'stop-loss'
  | 'take-profit'
  | 'time-based'
  | 'risk-management'
  | 'pattern-based'
  | 'order-management'
  | 'dynamic-position';

/**
 * Template maturity level.
 * - 'stable': Production-ready, visible to all users.
 * - 'lab': Experimental, visible only to whitelisted accounts.
 */
export type TemplateMaturity = 'stable' | 'lab';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateDefinition<T = any> {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  maturity: TemplateMaturity;
  /**
   * Paramètres configurables du template.
   *
   * Champ `options` : si renseigné, le paramètre est rendu comme un <select> dans l'UI
   * plutôt qu'un champ texte libre. Les valeurs doivent être des chaînes correspondant
   * aux valeurs acceptées par le moteur de règles.
   *
   * Exemple : options: ['below', 'above'] pour un paramètre de direction de prix.
   */
  parameters: Array<{
    name: keyof T;
    type: 'number' | 'string' | 'boolean';
    default: number | string | boolean;
    min?: number;
    max?: number;
    description?: string;
    /** Valeurs autorisées. Si présent, l'UI affiche un select au lieu d'un champ texte. */
    options?: string[];
  }>;
  create: (params: T) => RuleTemplate;
}

// ============================================================================
// Stop Loss Templates
// ============================================================================

export const SL_BREAKEVEN_TEMPLATE: TemplateDefinition<MoveSLToBreakevenTemplateParams> = {
  id: 'sl-breakeven',
  name: 'Stop-Loss to Breakeven',
  description: 'Move stop-loss to entry price when profit reaches a threshold (R multiple)',
  category: 'stop-loss',
  maturity: 'stable',
  parameters: [
    {
      name: 'thresholdR',
      type: 'number',
      default: 2,
      min: 0.5,
      max: 10,
      description: 'R threshold to trigger breakeven move'
    }
  ],
  create: createMoveSLToBreakevenTemplate
};

export const LOCK_IN_PROFIT_STOP_TEMPLATE: TemplateDefinition<LockInProfitStopTemplateParams> = {
  id: 'lock-in-profit-stop',
  name: 'Lock-in Profit Stop',
  description: 'Move stop to guarantee minimum profit when higher profit reached',
  category: 'stop-loss',
  maturity: 'stable',
  parameters: [
    {
      name: 'triggerR',
      type: 'number',
      default: 3,
      min: 1,
      max: 20,
      description: 'R threshold to trigger the lock-in'
    },
    {
      name: 'lockInR',
      type: 'number',
      default: 1,
      min: 0,
      max: 10,
      description: 'R level to lock in as guaranteed profit'
    }
  ],
  create: createLockInProfitStopTemplate
};

// ============================================================================
// Take Profit Templates
// ============================================================================

export const TP_TEMPLATE: TemplateDefinition<TakeProfitTemplateParams> = {
  id: 'take-profit',
  name: 'Take Profit',
  description: 'Close position when profit reaches a target (R multiple)',
  category: 'take-profit',
  maturity: 'stable',
  parameters: [
    {
      name: 'thresholdR',
      type: 'number',
      default: 3,
      min: 1,
      max: 20,
      description: 'R target for taking profit'
    }
  ],
  create: createTakeProfitTemplate
};

export const FREE_TRADE_TEMPLATE: TemplateDefinition<FreeTradeTemplateParams> = {
  id: 'free-trade',
  name: 'Free Trade',
  description: 'Recover initial risk by partial close at profit threshold',
  category: 'take-profit',
  maturity: 'lab',
  parameters: [
    {
      name: 'triggerR',
      type: 'number',
      default: 2,
      min: 1,
      max: 10,
      description: 'R threshold to trigger risk recovery'
    },
    {
      name: 'rToRecover',
      type: 'number',
      default: 1,
      min: 0.5,
      max: 5,
      description: 'R amount to recover (typically 1 = initial risk)'
    }
  ],
  create: createFreeTradeTemplate
};

// ============================================================================
// Time-based Templates
// ============================================================================

export const TIME_BASED_STOP_TEMPLATE: TemplateDefinition<TimeBasedStopTemplateParams> = {
  id: 'time-based-stop',
  name: 'Time-based Stop',
  description: 'Close position if minimum profit not reached within time limit',
  category: 'time-based',
  maturity: 'lab',
  parameters: [
    {
      name: 'maxMinutes',
      type: 'number',
      default: 30,
      min: 5,
      max: 480,
      description: 'Maximum time in minutes before exit'
    },
    {
      name: 'minProfitR',
      type: 'number',
      default: 1,
      min: 0,
      max: 10,
      description: 'Minimum R that should be reached to avoid exit'
    },
    {
      name: 'closePercentage',
      type: 'number',
      default: 100,
      min: 10,
      max: 100,
      description: 'Percentage of position to close (100 = full close)'
    }
  ],
  create: createTimeBasedStopTemplate
};

// ============================================================================
// Risk Management Templates
// ============================================================================

export const MAX_DRAWDOWN_FROM_PEAK_TEMPLATE: TemplateDefinition<MaxDrawdownFromPeakTemplateParams> = {
  id: 'max-drawdown-from-peak',
  name: 'Max Drawdown from Peak',
  description: 'Close position if profit drops too much from peak R',
  category: 'risk-management',
  maturity: 'lab',
  parameters: [
    {
      name: 'minPeakR',
      type: 'number',
      default: 3,
      min: 1,
      max: 20,
      description: 'Minimum peak R required before rule activates'
    },
    {
      name: 'maxDrawdownR',
      type: 'number',
      default: 1.5,
      min: 0.5,
      max: 10,
      description: 'Maximum R that can be given back to market'
    },
    {
      name: 'closePercentage',
      type: 'number',
      default: 100,
      min: 10,
      max: 100,
      description: 'Percentage of position to close'
    }
  ],
  create: createMaxDrawdownFromPeakTemplate
};

// ============================================================================
// Pattern-based Templates
// ============================================================================

export const PATTERN_BASED_EXIT_TEMPLATE: TemplateDefinition<PatternBasedExitTemplateParams> = {
  id: 'pattern-based-exit',
  name: 'Pattern-based Exit',
  description: 'Exit on candlestick patterns (bearish for long, bullish for short)',
  category: 'pattern-based',
  maturity: 'lab',
  parameters: [
    {
      name: 'positionDirection',
      type: 'string',
      default: 'long',
      description: 'Position direction (long or short)',
      options: ['long', 'short'],
    },
    {
      name: 'minProfitR',
      type: 'number',
      default: 0,
      min: 0,
      max: 10,
      description: 'Minimum profit R before pattern exit is allowed'
    },
    {
      name: 'closePercentage',
      type: 'number',
      default: 100,
      min: 10,
      max: 100,
      description: 'Percentage of position to close'
    }
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: createPatternBasedExitTemplate as (params: any) => RuleTemplate
};

// ============================================================================
// Order Management Templates
// ============================================================================

export const CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE: TemplateDefinition<CancelPendingOnPriceLevelTemplateParams> = {
  id: 'cancel-pending-on-price-level',
  name: 'Cancel Pending on Price Level',
  description: 'Automatically cancels a pending limit order when a specific price level is reached',
  category: 'order-management',
  maturity: 'stable',
  parameters: [
    {
      name: 'invalidationPrice',
      type: 'number',
      default: 0,
      min: 0,
      description: 'Price level that invalidates the trade setup'
    },
    {
      name: 'direction',
      type: 'string',
      default: 'below',
      description: 'Price direction: "below" or "above"',
      options: ['below', 'above'],
    }
  ],
  create: createCancelPendingOnPriceLevelTemplate
};

// ============================================================================
// Dynamic Position Templates (per-position, not account-level)
// ============================================================================

export const PARTIAL_CLOSE_AT_PRICE_TEMPLATE: TemplateDefinition<PartialCloseAtPriceTemplateParams> = {
  id: 'partial-close-at-price',
  name: 'Partial Close at Price',
  description: 'Close a percentage of the position when a specific price level is reached',
  category: 'dynamic-position',
  maturity: 'stable',
  parameters: [
    {
      name: 'targetPrice',
      type: 'number',
      default: 0,
      min: 0,
      description: 'Target price level to trigger partial close'
    },
    {
      name: 'closePercentage',
      type: 'number',
      default: 50,
      min: 1,
      max: 99,
      description: 'Percentage of remaining position to close'
    },
    {
      name: 'side',
      type: 'string',
      default: 'buy',
      description: 'Position side: "buy" or "sell"'
    },
    {
      name: 'levelId',
      type: 'string',
      default: '',
      description: 'Unique identifier for this level'
    }
  ],
  create: createPartialCloseAtPriceTemplate
};

// ============================================================================
// Registry of all template definitions
// ============================================================================

export const templateDefinitions: Record<string, TemplateDefinition> = {
  // Stop Loss
  [SL_BREAKEVEN_TEMPLATE.id]: SL_BREAKEVEN_TEMPLATE,
  [LOCK_IN_PROFIT_STOP_TEMPLATE.id]: LOCK_IN_PROFIT_STOP_TEMPLATE,

  // Take Profit
  [TP_TEMPLATE.id]: TP_TEMPLATE,
  [FREE_TRADE_TEMPLATE.id]: FREE_TRADE_TEMPLATE,

  // Time-based
  [TIME_BASED_STOP_TEMPLATE.id]: TIME_BASED_STOP_TEMPLATE,

  // Risk Management
  [MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.id]: MAX_DRAWDOWN_FROM_PEAK_TEMPLATE,

  // Pattern-based
  [PATTERN_BASED_EXIT_TEMPLATE.id]: PATTERN_BASED_EXIT_TEMPLATE,

  // Order Management
  [CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE.id]: CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE,

  // Dynamic Position
  [PARTIAL_CLOSE_AT_PRICE_TEMPLATE.id]: PARTIAL_CLOSE_AT_PRICE_TEMPLATE,
};
