/**
 * @file moveSLToBreakeven.ts
 * @description Template factory for "move stop-loss to breakeven" rules.
 * Moves the SL to the entry price when profit reaches the configured threshold.
 *
 * Threshold is unit-aware via `Measurement` (R, percent, or absolute price move).
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
export interface MoveSLToBreakevenTemplateParams {
    /** Profit threshold to trigger the breakeven move. */
    threshold: Measurement;
}
export declare function createMoveSLToBreakevenTemplate(params: MoveSLToBreakevenTemplateParams): RuleTemplate;
//# sourceMappingURL=moveSLToBreakeven.d.ts.map