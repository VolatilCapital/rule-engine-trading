import { describe, it, expect } from 'vitest';
import { scenario } from '../../src/dsl/scenario.js';
import { createCancelPendingOnPriceLevelTemplate, ActionType } from '@volatil/rule-engine-trading';

describe('cancelPendingOnPriceLevel', () => {
  it('should cancel BUY pending LIMIT when price falls below invalidation level', async () => {
    const sc = scenario('Cancel pending LIMIT below invalidation')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .placePendingOrder({ type: 'LIMIT', side: 'BUY', volume: 0.1, price: 1.0480 })
      .attachRule(createCancelPendingOnPriceLevelTemplate({ invalidationPrice: 1.0470, direction: 'below' }))
      .priceTo(1.0490);

    await sc.run();

    expect(sc.harness!.broker.getPendingOrders()).toHaveLength(1);
    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.CANCEL_POSITION)).toHaveLength(0);

    await sc.harness!.priceTo(1.0465);

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.CANCEL_POSITION)).toHaveLength(1);
    expect(sc.harness!.broker.getPendingOrders()).toHaveLength(0);
  });

  it('should not retrigger after first cancel', async () => {
    const sc = scenario('Cancel pending does not re-fire')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .placePendingOrder({ type: 'LIMIT', side: 'BUY', volume: 0.1, price: 1.0480 })
      .attachRule(createCancelPendingOnPriceLevelTemplate({ invalidationPrice: 1.0470, direction: 'below' }))
      .priceTo(1.0490);

    await sc.run();

    await sc.harness!.priceTo(1.0465);
    await sc.harness!.priceTo(1.0460);

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.CANCEL_POSITION)).toHaveLength(1);
    expect(sc.harness!.broker.getPendingOrders()).toHaveLength(0);
  });
});
