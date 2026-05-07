import { describe, it, expect } from 'vitest';
import { scenario } from '../../src/dsl/scenario.js';
import {
  TAKE_PARTIAL_1R_33PCT,
  TAKE_PARTIAL_2R_50PCT,
  TAKE_PARTIAL_1R_25PCT,
  TAKE_PARTIAL_2R_25PCT,
  ActionType,
} from '@volatil/rule-engine-trading';

describe('takePartial variants', () => {
  it('TAKE_PARTIAL_1R_33PCT closes 33.33% at +1R', async () => {
    const sc = scenario('33% partial close at 1R')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(TAKE_PARTIAL_1R_33PCT)
      .priceTo(1.0520)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.0667, 3);
  });

  it('TAKE_PARTIAL_2R_50PCT closes 50% only at +2R', async () => {
    const sc = scenario('50% partial close at 2R')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(TAKE_PARTIAL_2R_50PCT)
      .priceTo(1.0520)
      .priceTo(1.0540)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.05);
  });

  it('TAKE_PARTIAL_1R_25PCT closes 25% at +1R', async () => {
    const sc = scenario('25% partial close at 1R')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(TAKE_PARTIAL_1R_25PCT)
      .priceTo(1.0520)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.075);
  });

  it('TAKE_PARTIAL_2R_25PCT closes 25% at +2R', async () => {
    const sc = scenario('25% partial close at 2R')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(TAKE_PARTIAL_2R_25PCT)
      .priceTo(1.0540)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.075);
  });

  it('composes TAKE_PARTIAL_1R_25PCT and TAKE_PARTIAL_2R_25PCT', async () => {
    const sc = scenario('compose 1R_25pct and 2R_25pct')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(TAKE_PARTIAL_1R_25PCT)
      .attachRule(TAKE_PARTIAL_2R_25PCT)
      .priceTo(1.0520)
      .priceTo(1.0540)
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PARTIAL_CLOSE)).toHaveLength(2);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.05625);
  });
});
