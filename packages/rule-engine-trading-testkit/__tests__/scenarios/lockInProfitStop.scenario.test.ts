import { describe, it, expect } from 'vitest';
import { scenario } from '../../src/dsl/scenario.js';
import { LOCK_IN_3R_TO_1R, ActionType } from '@volatil/rule-engine-trading';

describe('lockInProfitStop', () => {
  it('should lock in +1R when price reaches +3R', async () => {
    const sc = scenario('Lock in 1R at 3R profit')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(LOCK_IN_3R_TO_1R)
      .priceTo(1.0560)
      .expectStopLossAt(1.0520)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.MOVE_STOP_LOSS)).toHaveLength(1);
  });

  it('should not retrigger after first lock-in', async () => {
    const sc = scenario('Lock in 1R does not re-fire')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(LOCK_IN_3R_TO_1R)
      .priceTo(1.0560)
      .priceTo(1.0580)
      .priceTo(1.0560)
      .expectStopLossAt(1.0520)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.MOVE_STOP_LOSS)).toHaveLength(1);
  });
});
