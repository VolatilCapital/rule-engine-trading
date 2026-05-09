import { createMoveSLToBreakevenTemplate } from '../templates/moveSLToBreakeven.js';
import { createTakeProfitTemplate } from '../templates/takeProfit.js';
import { createTakePartialTemplate } from '../templates/takePartial.js';
import { createTimeBasedStopTemplate } from '../templates/timeBasedStop.js';
import { createFreeTradeTemplate } from '../templates/freeTrade.js';
import { createLockInProfitStopTemplate } from '../templates/lockInProfitStop.js';
import { createMaxDrawdownFromPeakTemplate } from '../templates/maxDrawdownFromPeak.js';
import { createPatternBasedExitTemplate } from '../templates/patternBasedExit.js';
// Registre des règles de trading avec références fixes
export const tradingRuleRegistry = {
    // ============================================================================
    // Stop Loss à breakeven
    // ============================================================================
    'sl-breakeven-1.5r': createMoveSLToBreakevenTemplate({ threshold: { value: 1.5, unit: 'R' } }),
    'sl-breakeven-2r': createMoveSLToBreakevenTemplate({ threshold: { value: 2, unit: 'R' } }),
    'sl-breakeven-3r': createMoveSLToBreakevenTemplate({ threshold: { value: 3, unit: 'R' } }),
    // ============================================================================
    // Prise de bénéfices (Take Profit)
    // ============================================================================
    'tp-2r': createTakeProfitTemplate({ threshold: { value: 2, unit: 'R' } }),
    'tp-3r': createTakeProfitTemplate({ threshold: { value: 3, unit: 'R' } }),
    'tp-5r': createTakeProfitTemplate({ threshold: { value: 5, unit: 'R' } }),
    // ============================================================================
    // Partial Take Profit
    // ============================================================================
    'partial-1r-50pct': createTakePartialTemplate({ threshold: { value: 1, unit: 'R' }, closePercentage: 50, partialId: '1R_50pct' }),
    'partial-2r-50pct': createTakePartialTemplate({ threshold: { value: 2, unit: 'R' }, closePercentage: 50, partialId: '2R_50pct' }),
    'partial-1r-33pct': createTakePartialTemplate({ threshold: { value: 1, unit: 'R' }, closePercentage: 33.33, partialId: '1R_33pct' }),
    // ============================================================================
    // Time-based Stop (sortie si profit non atteint dans le temps)
    // ============================================================================
    'time-stop-30min-1r': createTimeBasedStopTemplate({ maxMinutes: 30, minProfitR: 1, ruleId: '30min_1R' }),
    'time-stop-15min-05r': createTimeBasedStopTemplate({ maxMinutes: 15, minProfitR: 0.5, ruleId: '15min_05R' }),
    'time-stop-60min-2r': createTimeBasedStopTemplate({ maxMinutes: 60, minProfitR: 2, ruleId: '60min_2R' }),
    // ============================================================================
    // Free Trade (retirer le risque initial)
    // ============================================================================
    'free-trade-2r': createFreeTradeTemplate({ trigger: { value: 2, unit: 'R' }, recover: { value: 1, unit: 'R' }, ruleId: '2R' }),
    'free-trade-3r': createFreeTradeTemplate({ trigger: { value: 3, unit: 'R' }, recover: { value: 1, unit: 'R' }, ruleId: '3R' }),
    'free-trade-1.5r': createFreeTradeTemplate({ trigger: { value: 1.5, unit: 'R' }, recover: { value: 1, unit: 'R' }, ruleId: '1_5R' }),
    // ============================================================================
    // Lock-in Profit Stop (verrouillage du profit)
    // ============================================================================
    'lock-3r-to-1r': createLockInProfitStopTemplate({ trigger: { value: 3, unit: 'R' }, lockIn: { value: 1, unit: 'R' }, ruleId: '3R_to_1R' }),
    'lock-2r-to-05r': createLockInProfitStopTemplate({ trigger: { value: 2, unit: 'R' }, lockIn: { value: 0.5, unit: 'R' }, ruleId: '2R_to_05R' }),
    'lock-4r-to-2r': createLockInProfitStopTemplate({ trigger: { value: 4, unit: 'R' }, lockIn: { value: 2, unit: 'R' }, ruleId: '4R_to_2R' }),
    'lock-5r-to-3r': createLockInProfitStopTemplate({ trigger: { value: 5, unit: 'R' }, lockIn: { value: 3, unit: 'R' }, ruleId: '5R_to_3R' }),
    // ============================================================================
    // Max Drawdown from Peak (protection contre retournements)
    // ============================================================================
    'max-dd-4r-peak-25r': createMaxDrawdownFromPeakTemplate({ minPeakR: 4, maxDrawdownR: 2.5, ruleId: '4R_peak_25R_dd' }),
    'max-dd-3r-peak-15r': createMaxDrawdownFromPeakTemplate({ minPeakR: 3, maxDrawdownR: 1.5, ruleId: '3R_peak_15R_dd' }),
    'max-dd-2r-peak-1r': createMaxDrawdownFromPeakTemplate({ minPeakR: 2, maxDrawdownR: 1, ruleId: '2R_peak_1R_dd' }),
    // ============================================================================
    // Pattern-based Exit (sortie sur pattern de bougie)
    // ============================================================================
    'pattern-exit-long-bearish': createPatternBasedExitTemplate({ positionDirection: 'long', ruleId: 'long_bearish' }),
    'pattern-exit-short-bullish': createPatternBasedExitTemplate({ positionDirection: 'short', ruleId: 'short_bullish' }),
    'pattern-exit-long-engulfing': createPatternBasedExitTemplate({ positionDirection: 'long', patternNames: ['engulfing_bearish'], ruleId: 'long_engulfing' }),
    'pattern-exit-long-profitable': createPatternBasedExitTemplate({ positionDirection: 'long', minProfit: { value: 0.5, unit: 'R' }, ruleId: 'long_bearish_profitable' }),
};
//# sourceMappingURL=registry.js.map