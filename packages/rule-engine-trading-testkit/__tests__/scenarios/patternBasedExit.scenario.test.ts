import { describe, it, expect } from 'vitest';
import { scenario } from '../../src/dsl/scenario.js';
import { PATTERN_EXIT_LONG_BEARISH, ActionType } from '@volatil/rule-engine-trading';

describe('patternBasedExit', () => {
  it('should not trigger when no pattern is detected', async () => {
    const sc = scenario('No pattern → no close')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(PATTERN_EXIT_LONG_BEARISH)
      .priceTo(1.0520);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PLACE_ORDER)).toHaveLength(0);
    expect(sc.harness!.positionState?.isOpen() ?? false).toBe(true);
  });

  it('should close position when bearish pattern is detected', async () => {
    const sc = scenario('Bearish pattern → close long')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(PATTERN_EXIT_LONG_BEARISH)
      .setPatterns({ bearish: true })
      .priceTo(1.0520)
      .expectActionExecuted(ActionType.PLACE_ORDER);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PLACE_ORDER)).toHaveLength(1);
    expect(sc.harness!.positionState?.isOpen() ?? false).toBe(false);
  });

  it('should not re-trigger after position closed', async () => {
    const sc = scenario('Bearish pattern → close once, no re-trigger')
      .platform({ symbol: 'EURUSD', leverage: 100, balance: 10_000 })
      .openPosition({ side: 'BUY', volume: 0.1, entry: 1.0500, sl: 1.0480 })
      .attachRule(PATTERN_EXIT_LONG_BEARISH)
      .setPatterns({ bearish: true })
      .priceTo(1.0520)
      .setPatterns({ bearish: true })
      .priceTo(1.0530);

    await sc.run();

    expect(sc.harness!.executedActions.filter(a => a.actionRef === ActionType.PLACE_ORDER)).toHaveLength(1);
  });
});
