import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
export interface CancelPendingOnPriceLevelTemplateParams {
    invalidationPrice: number;
    direction: 'below' | 'above';
}
export declare function createCancelPendingOnPriceLevelTemplate(params: CancelPendingOnPriceLevelTemplateParams): RuleTemplate;
//# sourceMappingURL=cancelPendingOnPriceLevel.d.ts.map