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
    'sl-breakeven-1.5r': createMoveSLToBreakevenTemplate({ thresholdR: 1.5 }),
    'sl-breakeven-2r': createMoveSLToBreakevenTemplate({ thresholdR: 2 }),
    'sl-breakeven-3r': createMoveSLToBreakevenTemplate({ thresholdR: 3 }),
    // ============================================================================
    // Prise de bénéfices (Take Profit)
    // ============================================================================
    'tp-2r': createTakeProfitTemplate({ thresholdR: 2 }),
    'tp-3r': createTakeProfitTemplate({ thresholdR: 3 }),
    'tp-5r': createTakeProfitTemplate({ thresholdR: 5 }),
    // ============================================================================
    // Partial Take Profit
    // ============================================================================
    'partial-1r-50pct': createTakePartialTemplate({ thresholdR: 1, closePercentage: 50, partialId: '1R_50pct' }),
    'partial-2r-50pct': createTakePartialTemplate({ thresholdR: 2, closePercentage: 50, partialId: '2R_50pct' }),
    'partial-1r-33pct': createTakePartialTemplate({ thresholdR: 1, closePercentage: 33.33, partialId: '1R_33pct' }),
    // ============================================================================
    // Time-based Stop (sortie si profit non atteint dans le temps)
    // ============================================================================
    'time-stop-30min-1r': createTimeBasedStopTemplate({ maxMinutes: 30, minProfitR: 1, ruleId: '30min_1R' }),
    'time-stop-15min-05r': createTimeBasedStopTemplate({ maxMinutes: 15, minProfitR: 0.5, ruleId: '15min_05R' }),
    'time-stop-60min-2r': createTimeBasedStopTemplate({ maxMinutes: 60, minProfitR: 2, ruleId: '60min_2R' }),
    // ============================================================================
    // Free Trade (retirer le risque initial)
    // ============================================================================
    'free-trade-2r': createFreeTradeTemplate({ triggerR: 2, ruleId: '2R' }),
    'free-trade-3r': createFreeTradeTemplate({ triggerR: 3, ruleId: '3R' }),
    'free-trade-1.5r': createFreeTradeTemplate({ triggerR: 1.5, ruleId: '1_5R' }),
    // ============================================================================
    // Lock-in Profit Stop (verrouillage du profit)
    // ============================================================================
    'lock-3r-to-1r': createLockInProfitStopTemplate({ triggerR: 3, lockInR: 1, ruleId: '3R_to_1R' }),
    'lock-2r-to-05r': createLockInProfitStopTemplate({ triggerR: 2, lockInR: 0.5, ruleId: '2R_to_05R' }),
    'lock-4r-to-2r': createLockInProfitStopTemplate({ triggerR: 4, lockInR: 2, ruleId: '4R_to_2R' }),
    'lock-5r-to-3r': createLockInProfitStopTemplate({ triggerR: 5, lockInR: 3, ruleId: '5R_to_3R' }),
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
    'pattern-exit-long-profitable': createPatternBasedExitTemplate({ positionDirection: 'long', minProfitR: 0.5, ruleId: 'long_bearish_profitable' }),
};
//# sourceMappingURL=registry.js.map