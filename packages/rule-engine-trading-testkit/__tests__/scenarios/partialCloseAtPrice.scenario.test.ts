import { describe, it, expect } from 'vitest';
import { scenario } from '../../src/dsl/scenario.js';
import { createPartialCloseAtPriceTemplate, ActionType } from '@volatil/rule-engine-trading';

describe('partialCloseAtPrice', () => {
  it('should close 30% of BUY position when price reaches target', async () => {
    const sc = scenario('Partial close 30% at absolute price (BUY)')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(createPartialCloseAtPriceTemplate({ targetPrice: 1.0530, closePercentage: 30, side: 'buy', levelId: 'L1' }))
      .priceTo(1.0530)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.07);
  });

  it('should not retrigger after first partial close', async () => {
    const sc = scenario('Partial close at price does not re-fire')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(createPartialCloseAtPriceTemplate({ targetPrice: 1.0530, closePercentage: 30, side: 'buy', levelId: 'L1' }))
      .priceTo(1.0530)
      .priceTo(1.0540)
      .priceTo(1.0530)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.07);
  });
});
