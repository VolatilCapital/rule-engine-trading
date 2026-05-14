import type { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
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
/**
 * Template definition with user-configurable parameters and a factory function.
 *
 * The `create` function receives user-configured parameter values and returns a
 * fully instantiated `RuleTemplate` ready for the rule engine.
 *
 * @typeParam T - Shape of the user-supplied parameters passed to `create`.
 *   Defaults to `Record<string, unknown>` for untyped template definitions.
 */
export interface TemplateDefinition<T = Record<string, unknown>> {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    maturity: TemplateMaturity;
    /**
     * User-configurable parameters.
     *
     * If `options` is set, the parameter is rendered as a `<select>` in the UI
     * instead of a free-text field. Values must be strings matching the values
     * accepted by the rule engine.
     *
     * Multi-unit measurement parameters (`Measurement` in the factory params) are
     * exposed flat as a `<name>Value: number` + `<name>Unit: 'R'|'percent'|'price'`
     * pair so the form pipeline stays simple. The `create` wrapper reassembles them
     * into a `Measurement` object before delegating to the factory.
     */
    parameters: Array<{
        /** Field name on the flat UI params, not necessarily on the factory params. */
        name: string;
        type: 'number' | 'string' | 'boolean';
        default: number | string | boolean;
        min?: number;
        max?: number;
        description?: string;
        /** Allowed values. If present, the UI shows a select instead of a text field. */
        options?: string[];
    }>;
    create: (params: T) => RuleTemplate;
}
//# sourceMappingURL=types.d.ts.map