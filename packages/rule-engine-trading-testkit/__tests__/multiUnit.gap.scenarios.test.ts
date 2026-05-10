/**
 * @file multiUnit.gap.scenarios.test.ts
 * @description End-to-end LONG and SHORT scenarios covering multi-unit
 * (percent / price) gaps in the testkit for templates that received
 * Measurement support in Phases A–B but were not yet exercised beyond R:
 *   - takePartial      (percent, price)
 *   - moveSLToBreakeven (percent, price)
 *   - freeTrade         (percent, price)
 *   - lockInProfitStop  (price only — percent already covered in multiUnit.profit)
 */

import { describe, it, expect } from 'vitest';
import { scenario } from '../src/dsl/scenario.js';
import {
  createTakePartialTemplate,
  createMoveSLToBreakevenTemplate,
  createFreeTradeTemplate,
  createLockInProfitStopTemplate,
  ActionType,
} from '@volatil/rule-engine-trading';

const PLATFORM = { symbol: 'TEST', leverage: 1, balance: 10_000 };

// ══════════════════════════════════════════════════════════════════════════════
// takePartial — percent
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — takePartial (percent)', () => {
  it('LONG: closes 50% at +1.5%', async () => {
    const sc = scenario('takePartial percent LONG: 50% at +1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createTakePartialTemplate({
          threshold: { value: 1.5, unit: 'percent' },
          closePercentage: 50,
          partialId: 'tp-pct-long',
        }),
      )
      .priceTo(101.5) // +1.5%
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('SHORT: closes 50% at +1.5%', async () => {
    const sc = scenario('takePartial percent SHORT: 50% at +1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createTakePartialTemplate({
          threshold: { value: 1.5, unit: 'percent' },
          closePercentage: 50,
          partialId: 'tp-pct-short',
        }),
      )
      .priceTo(98.5) // +1.5% favorable for SELL
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('LONG: does not fire below threshold', async () => {
    const sc = scenario('takePartial percent LONG: no fire below 1.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createTakePartialTemplate({
          threshold: { value: 1.5, unit: 'percent' },
          closePercentage: 50,
          partialId: 'tp-pct-nofire',
        }),
      )
      .priceTo(101); // +1%

    await sc.run();

    expect(
      sc.harness!.executedActions.filter(
        (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
      ),
    ).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// takePartial — price
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — takePartial (price)', () => {
  it('LONG: closes 50% at +0.5 price move', async () => {
    const sc = scenario('takePartial price LONG: 50% at +0.5')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createTakePartialTemplate({
          threshold: { value: 0.5, unit: 'price' },
          closePercentage: 50,
          partialId: 'tp-price-long',
        }),
      )
      .priceTo(100.5) // +0.5
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('SHORT: closes 50% at +0.5 price move', async () => {
    const sc = scenario('takePartial price SHORT: 50% at +0.5')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createTakePartialTemplate({
          threshold: { value: 0.5, unit: 'price' },
          closePercentage: 50,
          partialId: 'tp-price-short',
        }),
      )
      .priceTo(99.5) // +0.5 favorable for SELL
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// moveSLToBreakeven — percent
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — moveSLToBreakeven (percent)', () => {
  it('LONG: moves SL to entry when +0.5% reached, not before', async () => {
    // entry=100, sl=99. threshold=0.5%, met when currentPctFromEntry ≥ 0.5 (price ≥ 100.5)
    const sc = scenario('moveSLToBE percent LONG: SL → 100 at +0.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMoveSLToBreakevenTemplate({
          threshold: { value: 0.5, unit: 'percent' },
        }),
      )
      .priceTo(100.2) // +0.2% → below threshold
      .expectStopLossAt(99, 1e-9) // unchanged
      .priceTo(100.5) // +0.5% → fires
      .expectStopLossAt(100, 1e-9)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });

  it('SHORT: moves SL to entry when +0.5% reached', async () => {
    // entry=100, sl=101. threshold=0.5%, met when currentPctFromEntry ≥ 0.5 (price ≤ 99.5)
    const sc = scenario('moveSLToBE percent SHORT: SL → 100 at +0.5%')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createMoveSLToBreakevenTemplate({
          threshold: { value: 0.5, unit: 'percent' },
        }),
      )
      .priceTo(99.8) // +0.2% → below threshold
      .expectStopLossAt(101, 1e-9)
      .priceTo(99.5) // +0.5% → fires
      .expectStopLossAt(100, 1e-9)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// moveSLToBreakeven — price
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — moveSLToBreakeven (price)', () => {
  it('LONG: moves SL to entry when +0.5 price move reached', async () => {
    // entry=100, sl=99. threshold=0.5 price, met when currentPriceMove ≥ 0.5
    const sc = scenario('moveSLToBE price LONG: SL → 100 at +0.5')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMoveSLToBreakevenTemplate({
          threshold: { value: 0.5, unit: 'price' },
        }),
      )
      .priceTo(100.3) // +0.3 → below threshold
      .expectStopLossAt(99, 1e-9)
      .priceTo(100.5) // +0.5 → fires
      .expectStopLossAt(100, 1e-9)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });

  it('SHORT: moves SL to entry when +0.5 price move reached', async () => {
    // entry=100, sl=101. threshold=0.5 price, met when currentPriceMove ≥ 0.5 (price ≤ 99.5)
    const sc = scenario('moveSLToBE price SHORT: SL → 100 at +0.5')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createMoveSLToBreakevenTemplate({
          threshold: { value: 0.5, unit: 'price' },
        }),
      )
      .priceTo(99.7) // +0.3 → below threshold
      .expectStopLossAt(101, 1e-9)
      .priceTo(99.5) // +0.5 → fires
      .expectStopLossAt(100, 1e-9)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// freeTrade — percent
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — freeTrade (percent)', () => {
  it('LONG: closes 50% at +2% to recover +1%', async () => {
    // trigger=2%, recover=1% → closePercentage = 50%
    const sc = scenario('freeTrade percent LONG: 50% at +2%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createFreeTradeTemplate({
          trigger: { value: 2, unit: 'percent' },
          recover: { value: 1, unit: 'percent' },
          ruleId: 'ft-pct-long',
        }),
      )
      .priceTo(102) // +2%
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('SHORT: closes 50% at +2% to recover +1%', async () => {
    const sc = scenario('freeTrade percent SHORT: 50% at +2%')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createFreeTradeTemplate({
          trigger: { value: 2, unit: 'percent' },
          recover: { value: 1, unit: 'percent' },
          ruleId: 'ft-pct-short',
        }),
      )
      .priceTo(98) // +2% favorable for SELL
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('LONG: does not fire below trigger', async () => {
    const sc = scenario('freeTrade percent LONG: no fire below 2%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createFreeTradeTemplate({
          trigger: { value: 2, unit: 'percent' },
          recover: { value: 1, unit: 'percent' },
          ruleId: 'ft-pct-nofire',
        }),
      )
      .priceTo(101.5); // +1.5%

    await sc.run();

    expect(
      sc.harness!.executedActions.filter(
        (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
      ),
    ).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// freeTrade — price
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — freeTrade (price)', () => {
  it('LONG: closes 50% at +2 price move to recover +1', async () => {
    const sc = scenario('freeTrade price LONG: 50% at +2')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createFreeTradeTemplate({
          trigger: { value: 2, unit: 'price' },
          recover: { value: 1, unit: 'price' },
          ruleId: 'ft-price-long',
        }),
      )
      .priceTo(102) // +2 price move
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });

  it('SHORT: closes 50% at +2 price move to recover +1', async () => {
    const sc = scenario('freeTrade price SHORT: 50% at +2')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createFreeTradeTemplate({
          trigger: { value: 2, unit: 'price' },
          recover: { value: 1, unit: 'price' },
          ruleId: 'ft-price-short',
        }),
      )
      .priceTo(98) // +2 price move favorable for SELL
      .expectActionExecuted(ActionType.PARTIAL_CLOSE);

    await sc.run();

    const closes = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.PARTIAL_CLOSE,
    );
    expect(closes).toHaveLength(1);
    expect(sc.harness!.positionState!.quantity.toNumber()).toBeCloseTo(0.005);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// lockInProfitStop — price (percent already covered in multiUnit.profit)
// ══════════════════════════════════════════════════════════════════════════════

describe('multiUnit gap — lockInProfitStop (price)', () => {
  it('LONG: moves SL to entry + 0.5 when price move reaches +1', async () => {
    // entry=100, sl=99. trigger=1 price, lockIn=0.5 price.
    // lockInStopPrice (LONG) = 100 + 0.5 = 100.5
    const lockIn = createLockInProfitStopTemplate({
      trigger: { value: 1, unit: 'price' },
      lockIn: { value: 0.5, unit: 'price' },
      ruleId: 'lips-price-long',
    });

    const sc = scenario('lockInProfitStop price LONG: SL → 100.5 at +1')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(lockIn)
      .priceTo(100.7) // +0.7 → below threshold
      .expectStopLossAt(99, 1e-9)
      .priceTo(101) // +1 → fires
      .expectStopLossAt(100.5, 0.00001)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });

  it('SHORT: moves SL to entry − 0.5 when price move reaches +1', async () => {
    // entry=100, sl=101. trigger=1 price, lockIn=0.5 price.
    // lockInStopPrice (SHORT) = 100 − 0.5 = 99.5
    const lockIn = createLockInProfitStopTemplate({
      trigger: { value: 1, unit: 'price' },
      lockIn: { value: 0.5, unit: 'price' },
      ruleId: 'lips-price-short',
    });

    const sc = scenario('lockInProfitStop price SHORT: SL → 99.5 at +1')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(lockIn)
      .priceTo(99.3) // +0.7 → below threshold
      .expectStopLossAt(101, 1e-9)
      .priceTo(99) // +1 → fires
      .expectStopLossAt(99.5, 0.00001)
      .expectActionExecuted(ActionType.MOVE_STOP_LOSS);

    await sc.run();

    const moves = sc.harness!.executedActions.filter(
      (a) => a.actionRef === ActionType.MOVE_STOP_LOSS,
    );
    expect(moves).toHaveLength(1);
  });
});
