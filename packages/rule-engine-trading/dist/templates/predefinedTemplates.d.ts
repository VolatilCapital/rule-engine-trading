import type { Unit } from '../domain/Measurement.js';
import { TimeBasedStopTemplateParams } from './timeBasedStop.js';
import { CancelPendingOnPriceLevelTemplateParams } from './cancelPendingOnPriceLevel.js';
import { PartialCloseAtPriceTemplateParams } from './partialCloseAtPrice.js';
import type { TemplateDefinition } from './types.js';
export type { TemplateCategory, TemplateMaturity, TemplateDefinition } from './types.js';
interface SLBreakevenFlatParams {
    thresholdValue: number;
    thresholdUnit: Unit;
}
interface LockInFlatParams {
    triggerValue: number;
    triggerUnit: Unit;
    lockInValue: number;
    lockInUnit: Unit;
    ruleId?: string;
}
interface TPFlatParams {
    thresholdValue: number;
    thresholdUnit: Unit;
}
interface FreeTradeFlatParams {
    triggerValue: number;
    triggerUnit: Unit;
    recoverValue: number;
    recoverUnit: Unit;
    ruleId?: string;
}
interface PatternExitFlatParams {
    positionDirection: 'long' | 'short';
    minProfitValue: number;
    minProfitUnit: Unit;
    closePercentage: number;
    patternNames?: string[];
    timeframe?: string;
    ruleId?: string;
}
interface TrailingStopFlatParams {
    distanceValue: number;
    distanceUnit: Unit;
    activationValue: number;
    activationUnit: Unit;
}
interface MaxDrawdownFromPeakFlatParams {
    minPeakValue: number;
    minPeakUnit: Unit;
    maxDrawdownValue: number;
    maxDrawdownUnit: Unit;
    /** `<= 0` means "omit the minCurrent gate". */
    minCurrentValue: number;
    minCurrentUnit: Unit;
    closePercentage: number;
    ruleId?: string;
}
export declare const TRAILING_STOP_TEMPLATE: TemplateDefinition<TrailingStopFlatParams>;
export declare const SL_BREAKEVEN_TEMPLATE: TemplateDefinition<SLBreakevenFlatParams>;
export declare const LOCK_IN_PROFIT_STOP_TEMPLATE: TemplateDefinition<LockInFlatParams>;
export declare const TP_TEMPLATE: TemplateDefinition<TPFlatParams>;
export declare const FREE_TRADE_TEMPLATE: TemplateDefinition<FreeTradeFlatParams>;
export declare const TIME_BASED_STOP_TEMPLATE: TemplateDefinition<TimeBasedStopTemplateParams>;
export declare const MAX_DRAWDOWN_FROM_PEAK_TEMPLATE: TemplateDefinition<MaxDrawdownFromPeakFlatParams>;
export declare const PATTERN_BASED_EXIT_TEMPLATE: TemplateDefinition<PatternExitFlatParams>;
export declare const CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE: TemplateDefinition<CancelPendingOnPriceLevelTemplateParams>;
export declare const PARTIAL_CLOSE_AT_PRICE_TEMPLATE: TemplateDefinition<PartialCloseAtPriceTemplateParams>;
export declare const templateDefinitions: {
    [TRAILING_STOP_TEMPLATE.id]: TemplateDefinition<TrailingStopFlatParams>;
    [SL_BREAKEVEN_TEMPLATE.id]: TemplateDefinition<SLBreakevenFlatParams>;
    [LOCK_IN_PROFIT_STOP_TEMPLATE.id]: TemplateDefinition<LockInFlatParams>;
    [TP_TEMPLATE.id]: TemplateDefinition<TPFlatParams>;
    [FREE_TRADE_TEMPLATE.id]: TemplateDefinition<FreeTradeFlatParams>;
    [TIME_BASED_STOP_TEMPLATE.id]: TemplateDefinition<TimeBasedStopTemplateParams>;
    [MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.id]: TemplateDefinition<MaxDrawdownFromPeakFlatParams>;
    [PATTERN_BASED_EXIT_TEMPLATE.id]: TemplateDefinition<PatternExitFlatParams>;
    [CANCEL_PENDING_ON_PRICE_LEVEL_TEMPLATE.id]: TemplateDefinition<CancelPendingOnPriceLevelTemplateParams>;
    [PARTIAL_CLOSE_AT_PRICE_TEMPLATE.id]: TemplateDefinition<PartialCloseAtPriceTemplateParams>;
};
//# sourceMappingURL=predefinedTemplates.d.ts.map