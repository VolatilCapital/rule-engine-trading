import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { MoveSLToBreakevenTemplateParams } from './moveSLToBreakeven.js';
import { TakeProfitTemplateParams } from './takeProfit.js';
import { TimeBasedStopTemplateParams } from './timeBasedStop.js';
import { FreeTradeTemplateParams } from './freeTrade.js';
import { LockInProfitStopTemplateParams } from './lockInProfitStop.js';
import { MaxDrawdownFromPeakTemplateParams } from './maxDrawdownFromPeak.js';
import { PatternBasedExitTemplateParams } from './patternBasedExit.js';
import { CancelPendingOnPriceLevelTemplateParams } from './cancelPendingOnPriceLevel.js';
import { PartialCloseAtPriceTemplateParams } from './partialCloseAtPrice.js';
import { TrailingStopParams } from './trailingStop.js';
/**
 * Template categories for rule classification.
 */
export type TemplateCategory = 'stop-loss' | 'take-profit' | 'time-based' | 'risk-management' | 'pattern-based' | 'order-management' | 'dynamic-position';
/**
 * Template maturity level.
 * - 'stable': Production-ready, visible to all users.
 * - 'lab': Experimental, visible only to whitelisted accounts.
 */
export type TemplateMaturity = 'stable' | 'lab';
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
export declare const TRAILING_STOP_TEMPLATE: TemplateDefinition<TrailingStopParams>;
export declare const SL_BREAKEVEN_TEMPLATE: TemplateDefinition<MoveSLToBreakevenTemplateParams>;
export declare const LOCK_IN_PROFIT_STOP_TEMPLATE: TemplateDefinition<LockInProfitStopTemplateParams>;
export declare const TP_TEMPLATE: TemplateDefinition<TakeProfitTemplateParams>;
export declare const FREE_TRADE_TEMPLATE: TemplateDefinition<FreeTradeTemplateParams>;
export declare const TIME_BASED_STOP_TEMPLATE: TemplateDefinition<TimeBasedStopTemplateParams>;
export declare const MAX_DRAWDOWN_FROM_PEAK_TEMPLATE: TemplateDefinition<MaxDrawdownFromPeakTemplateParams>;
export declare const PATTERN_BASED_EXIT_TEMPLATE: TemplateDefinition<PatternBasedExitTemplateParams>;
export declare const CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE: TemplateDefinition<CancelPendingOnPriceLevelTemplateParams>;
export declare const PARTIAL_CLOSE_AT_PRICE_TEMPLATE: TemplateDefinition<PartialCloseAtPriceTemplateParams>;
export declare const templateDefinitions: Record<string, TemplateDefinition>;
//# sourceMappingURL=predefinedTemplates.d.ts.map