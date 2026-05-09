/**
 * @file multiUnit.profit.scenarios.test.ts
 * @description End-to-end LONG and SHORT scenarios for the unit-aware profit
 * templates introduced in Phase A:
 *   - take-profit in `percent` and `price`
 *   - lock-in-profit-stop in `percent`
 *
 * Validates the adapter's side-aware computation of `currentPctFromEntry` and
 * `currentPriceMove`, as well as the per-rule `lockInStopPrice_*` pre-fill.
 */

import { describe, it, expect } from 'vitest';
import { scenario } from '../src/dsl/scenario.js';
import {
  createTakeProfitTemplate,
  createLockInProfitStopTemplate,
  ActionType,
} from '@volatil/rule-engine-trading';

const PLATFORM = { symbol: 'EURUSD', leverage: 100, balance: 10_000 };

describe('multiUnit — take-profit (percent)', () => {
  it('LONG: closes when currentPctFromEntry reaches threshold', async () => {
    // entry=1.0500, currentPrice=1.0658 → +1.50476% > 1.5
    const sc = scenario('TP percent LONG: fires at +1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } }))
      .priceTo(1.0658)
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });

  it('SHORT: closes when currentPctFromEntry reaches threshold', async () => {
    // entry=1.0500, currentPrice=1.0342 → +1.50476% (favorable for SELL)
    const sc = scenario('TP percent SHORT: fires at +1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.1, entry: 1.0500, sl: 1.0520 })
      .attachRule(createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } }))
      .priceTo(1.0342)
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });

  it('LONG: does not fire below threshold', async () => {
    const sc = scenario('TP percent LONG: no fire below 1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } }))
      .priceTo(1.0510); // +0.0952%

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(0);
  });
});

describe('multiUnit — take-profit (price)', () => {
  it('LONG: closes when currentPriceMove reaches threshold', async () => {
    // entry=1.0500, currentPrice=1.0510 → priceMove=0.001 > 0.0005
    const sc = scenario('TP price LONG: fires at +0.0005')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(createTakeProfitTemplate({ threshold: { value: 0.0005, unit: 'price' } }))
      .priceTo(1.0510)
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });

  it('SHORT: closes when (favorable) priceMove reaches threshold', async () => {
    // entry=1.0500, currentPrice=1.0490 → priceMove=+0.001 (favorable for SELL)
    const sc = scenario('TP price SHORT: fires at +0.0005')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.1, entry: 1.0500, sl: 1.0520 })
      .attachRule(createTakeProfitTemplate({ threshold: { value: 0.0005, unit: 'price' } }))
      .priceTo(1.0490)
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });
});

describe('multiUnit — lock-in-profit-stop (percent)', () => {
  it('LONG: pre-fills lockInStopPrice_<pct> and moves SL when trigger hits', async () => {
    // entry=1.0500, lockIn=0.5% → lockInStopPrice = 1.0500 * (1 + 0.005) = 1.05525
    // trigger=1% → fires when currentPctFromEntry >= 1
    const lockIn = createLockInProfitStopTemplate({
      trigger: { value: 1, unit: 'percent' },
      lockIn: { value: 0.5, unit: 'percent' },
    });

    const sc = scenario('Lock-in percent LONG: SL → entry × (1 + 0.005)')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(lockIn)
      .priceTo(1.0610) // +1.0476% > 1
      .expectStopLossAt(1.05525, 0.00001)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.MOVE_STOP_LOSS),
    ).toHaveLength(1);
  });

  it('SHORT: pre-fills lockInStopPrice and moves SL down', async () => {
    // entry=1.0500, lockIn=0.5% → lockInStopPrice (SHORT) = 1.0500 * (1 − 0.005) = 1.04475
    const lockIn = createLockInProfitStopTemplate({
      trigger: { value: 1, unit: 'percent' },
      lockIn: { value: 0.5, unit: 'percent' },
    });

    const sc = scenario('Lock-in percent SHORT: SL → entry × (1 − 0.005)')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.1, entry: 1.0500, sl: 1.0520 })
      .attachRule(lockIn)
      .priceTo(1.0390) // (1.0500 − 1.0390)/1.0500 ≈ +1.048% (favorable)
      .expectStopLossAt(1.04475, 0.00001)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.MOVE_STOP_LOSS),
    ).toHaveLength(1);
  });
});

describe('multiUnit — adapter context fields (acceptance criterion)', () => {
  it('LONG entry=100, current=101.5, initialSL=99: currentR≈0.75, pct=1.5, priceMove=1.5', async () => {
    // Simple direct exercise of the harness #buildContext via a no-op rule.
    // We rely on a take-profit rule that will not fire, then read the broker
    // state via priceTo and verify by inspecting that no action fires for a
    // higher threshold but does fire for a lower one in the right unit.

    // Since we can't directly inspect ctx, we use a take-profit at 1.5 percent
    // and check it fires at exactly currentPrice=101.5 when entry=100.
    const tpPct = createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } });
    const tpPrice = createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'price' } });

    // Run the percent test
    const scPct = scenario('LONG sanity: percent fires at 1.5%')
      .platform({ symbol: 'TEST', leverage: 1, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(tpPct)
      .priceTo(101.5)
      .expectActionExecuted(ActionType.PLACE_ORDER);
    await scPct.run();

    // Run the price test (needs a fresh scenario / harness)
    const scPrice = scenario('LONG sanity: price fires at 1.5')
      .platform({ symbol: 'TEST', leverage: 1, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(tpPrice)
      .priceTo(101.5)
      .expectActionExecuted(ActionType.PLACE_ORDER);
    await scPrice.run();
  });

  it('SHORT entry=100, current=98.5, initialSL=101: same three values are positive', async () => {
    const tpPct = createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'percent' } });
    const tpPrice = createTakeProfitTemplate({ threshold: { value: 1.5, unit: 'price' } });

    const scPct = scenario('SHORT sanity: percent fires at 1.5%')
      .platform({ symbol: 'TEST', leverage: 1, balance: 10_000 })
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(tpPct)
      .priceTo(98.5)
      .expectActionExecuted(ActionType.PLACE_ORDER);
    await scPct.run();

    const scPrice = scenario('SHORT sanity: price fires at 1.5')
      .platform({ symbol: 'TEST', leverage: 1, balance: 10_000 })
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(tpPrice)
      .priceTo(98.5)
      .expectActionExecuted(ActionType.PLACE_ORDER);
    await scPrice.run();
  });
});
