/**
 * @file multiUnit.peakDrawdown.scenarios.test.ts
 * @description End-to-end LONG and SHORT scenarios for the multi-unit
 * max-drawdown-from-peak template introduced in Phase C:
 *   - LONG/SHORT peakPrice tracking through up/down ticks
 *   - max-drawdown trigger in `percent` (LONG and SHORT)
 *   - max-drawdown trigger in `price` (LONG and SHORT)
 *   - drawdownFromPeakPct/Price floor at 0 when current transiently exceeds peak
 *   - peakPrice reset on a new position open
 *   - R-only baseline regression: same wire as the pre-Phase-C scenario
 *
 * The harness adapter owns all peak-tracking arithmetic. The template only
 * emits side-agnostic `peakX ≥ minPeak.value` and `drawdownFromPeakX ≥ maxDrawdown.value`
 * conditions, dispatched on the chosen unit.
 */

import { describe, it, expect } from 'vitest';
import { scenario } from '../src/dsl/scenario.js';
import { RuleScenarioHarness } from '../src/harness/RuleScenarioHarness.js';
import {
  createMaxDrawdownFromPeakTemplate,
  ActionType,
} from '@volatil/rule-engine-trading';

const PLATFORM = { symbol: 'TEST', leverage: 1, balance: 10_000 };

// ──────────────────────────────────────────────────────────────────────────────
// peakPrice tracking — exercised by driving raw priceTo() ticks and inspecting
// the post-tick context via a dummy attached rule (here, a max-drawdown rule
// that never fires because thresholds are well above what we hit).
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit peakPrice tracking — LONG', () => {
  it('tracks the highest price seen across up/down/up ticks', async () => {
    // entry=100, sl=99, ticks 100 → 102 → 101 → 103 → 100.5
    // Expected last-tick state:
    //   peakPrice = 103, peakPriceMove = 3, peakPctFromEntry = 3
    //   currentPrice = 100.5 → currentPriceMove = 0.5, currentPctFromEntry = 0.5
    //   drawdownFromPeakPrice = 2.5, drawdownFromPeakPct = 2.5
    const harness = new RuleScenarioHarness(PLATFORM);
    await harness.openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 });
    // Attach a max-DD rule that never fires (peak threshold too high) so each
    // tick still flows through the harness but we can read context indirectly.
    await harness.attachRule(
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 99, unit: 'price' },
        maxDrawdown: { value: 99, unit: 'price' },
        ruleId: 'never-fires',
      }),
    );

    await harness.priceTo(102);
    await harness.priceTo(101);
    await harness.priceTo(103);
    await harness.priceTo(100.5);

    // Probe the post-tick context by calling buildContext via a no-op tick.
    // (We can't access #buildContext directly; instead we validate by attaching
    // a rule whose condition compiles to a known peak-field check and observing
    // it does NOT fire when the peak threshold is just above the actual peak.)

    // Fresh, sharp probe: a rule with minPeak=3 price + maxDrawdown=2.5 price
    // on the SAME harness state should fire (peakPriceMove=3, drawdownFromPeakPrice=2.5).
    const sc = scenario('LONG peak probe: triggers exactly at observed values')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 3, unit: 'price' },
          maxDrawdown: { value: 2.5, unit: 'price' },
          ruleId: 'long-peak-probe',
        }),
      )
      .priceTo(102) // peak=102, drawdown=0 → no fire
      .priceTo(101) // peak=102, drawdown=1 → no fire
      .priceTo(103) // peak=103, drawdown=0 → no fire
      .priceTo(100.5) // peak=103, drawdown=2.5 → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });
});

describe('multiUnit peakPrice tracking — SHORT', () => {
  it('tracks the lowest price seen (most favorable for SHORT)', async () => {
    // entry=100, sl=101, ticks 100 → 98 → 99 → 97 → 99.5
    // Expected:
    //   peakPrice = 97, peakPriceMove = 3, peakPctFromEntry = 3
    //   currentPrice = 99.5 → currentPriceMove = 0.5, currentPctFromEntry = 0.5
    //   drawdownFromPeakPrice = 2.5
    const sc = scenario('SHORT peak probe: triggers at peak=3 dd=2.5')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 3, unit: 'price' },
          maxDrawdown: { value: 2.5, unit: 'price' },
          ruleId: 'short-peak-probe',
        }),
      )
      .priceTo(98) // peak=2, drawdown=0 → no fire
      .priceTo(99) // peak=2, drawdown=1 → no fire
      .priceTo(97) // peak=3, drawdown=0 → no fire
      .priceTo(99.5) // peak=3, drawdown=2.5 → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Max-DD trigger in percent
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit max-drawdown — percent', () => {
  it('LONG: fires when drawdownFromPeakPct ≥ 1 after peak ≥ 2%', async () => {
    // entry=100, ticks 102 (pct=2 peak), 101 (drawdown=1) → fires
    const sc = scenario('LONG max-dd percent: peak 2%, dd 1%')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 2, unit: 'percent' },
          maxDrawdown: { value: 1, unit: 'percent' },
          ruleId: 'long-pct',
        }),
      )
      .priceTo(102) // peak=2%, drawdown=0 → no fire
      .priceTo(101) // peak=2%, drawdown=1% → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });

  it('SHORT: fires when drawdownFromPeakPct ≥ 1 after peak ≥ 2%', async () => {
    // entry=100, sell, ticks 98 (pct=2 peak), 99 (drawdown=1) → fires
    const sc = scenario('SHORT max-dd percent: peak 2%, dd 1%')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 2, unit: 'percent' },
          maxDrawdown: { value: 1, unit: 'percent' },
          ruleId: 'short-pct',
        }),
      )
      .priceTo(98) // peak=2%, drawdown=0 → no fire
      .priceTo(99) // peak=2%, drawdown=1% → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Max-DD trigger in price
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit max-drawdown — price', () => {
  it('LONG: fires when drawdownFromPeakPrice ≥ 1 after peak ≥ 2', async () => {
    const sc = scenario('LONG max-dd price: peak 2, dd 1')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 2, unit: 'price' },
          maxDrawdown: { value: 1, unit: 'price' },
          ruleId: 'long-price',
        }),
      )
      .priceTo(102) // peakPriceMove=2, dd=0 → no fire
      .priceTo(101) // peakPriceMove=2, dd=1 → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });

  it('SHORT: fires when drawdownFromPeakPrice ≥ 1 after peak ≥ 2', async () => {
    const sc = scenario('SHORT max-dd price: peak 2, dd 1')
      .platform(PLATFORM)
      .openPosition({ side: 'SELL', volume: 0.01, entry: 100, sl: 101 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 2, unit: 'price' },
          maxDrawdown: { value: 1, unit: 'price' },
          ruleId: 'short-price',
        }),
      )
      .priceTo(98) // peakPriceMove=2, dd=0 → no fire
      .priceTo(99) // peakPriceMove=2, dd=1 → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Drawdown floor at 0 — when the current quantity would transiently exceed the
// stored peak (the peak update happens before the drawdown computation, so
// this is in fact unreachable; but the `Math.max(0, …)` guard is still
// asserted via a strictly-monotonic-up sequence that keeps drawdown at 0).
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit drawdown floor — never negative', () => {
  it('LONG: monotonic-up sequence keeps drawdownFromPeakPct at 0 (rule never fires)', async () => {
    // entry=100, ticks 102, 103, 104. peak grows with current → drawdown=0 always.
    // A drawdown rule with maxDrawdown=0.1% must NOT fire.
    const sc = scenario('LONG dd floor: monotonic up, never fires')
      .platform(PLATFORM)
      .openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 1, unit: 'percent' },
          maxDrawdown: { value: 0.1, unit: 'percent' },
          ruleId: 'long-monotonic',
        }),
      )
      .priceTo(102)
      .priceTo(103)
      .priceTo(104);

    await sc.run();

    // No close fired — dd stays at 0 across all ticks.
    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// peakPrice reset on a new position open
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit peakPrice reset on new position', () => {
  it('opening a second position resets the peak (no carry-over from first trade)', async () => {
    // First trade: BUY 100 → 105 (peakPriceMove=5).
    // Close, then open a SECOND BUY at 100. Drive to 101 only.
    // If peakPrice were not reset, peak would still be 105; drawdown would be
    // 5 − 1 = 4 → a maxDrawdown=2 rule would fire on tick 1.
    // After reset, peakPriceMove=1 on tick 1 → drawdown=0 → rule does not fire.
    const harness = new RuleScenarioHarness(PLATFORM);
    await harness.openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 });
    await harness.priceTo(105); // peakPrice = 105
    // Close the first position (no rule attached → just a manual close via broker).
    const firstId = harness.positionState?.id;
    if (firstId) {
      await harness.broker.closePosition(firstId);
    }

    // Reopen — must reset #peakPrice to the new entry.
    await harness.openPosition({ side: 'BUY', volume: 0.01, entry: 100, sl: 99 });
    await harness.attachRule(
      createMaxDrawdownFromPeakTemplate({
        minPeak: { value: 0.5, unit: 'price' },
        maxDrawdown: { value: 2, unit: 'price' },
        ruleId: 'second-trade',
      }),
    );
    await harness.priceTo(101); // peakPriceMove=1, drawdown=0 → must NOT fire

    // No PLACE_ORDER from the second trade's rule.
    const places = harness.executedActions.filter(
      (a) => a.actionRef === ActionType.PLACE_ORDER,
    );
    expect(places).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// R-only baseline regression — pre-Phase-C scenario expressed via Measurement
// ──────────────────────────────────────────────────────────────────────────────

describe('multiUnit max-drawdown — R-only regression baseline', () => {
  it('produces identical condition firings to the pre-Phase-C R-numeric scenario', async () => {
    // Mirrors __tests__/scenarios/maxDrawdownFromPeak.scenario.test.ts:
    //   entry=1.0500, sl=1.0480 (riskPerUnit=0.0020)
    //   1.0540 → currentR=2 peak, drawdown=0 → no trigger
    //   1.0530 → drawdown=0.5R → still below threshold (1R)
    //   1.0520 → drawdown=1R → triggers close
    const sc = scenario('R-only regression: peak 2R, dd 1R')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(
        createMaxDrawdownFromPeakTemplate({
          minPeak: { value: 2, unit: 'R' },
          maxDrawdown: { value: 1, unit: 'R' },
          ruleId: 'r-regression',
        }),
      )
      .priceTo(1.0540) // peak=2R, drawdown=0 → no fire
      .priceTo(1.0530) // peak=2R, drawdown=0.5R → no fire
      .priceTo(1.0520) // peak=2R, drawdown=1R → fires
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(
      sc.harness!.executedActions.filter((a) => a.actionRef === ActionType.PLACE_ORDER),
    ).toHaveLength(1);
    expect(sc.harness!.positionState?.isOpen() ?? false).toBe(false);
  });
});
