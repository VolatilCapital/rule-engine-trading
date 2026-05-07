/**
 * @file Clock.ts
 * @description Time port for the test harness — abstracts Date.now() so tests
 * can drive elapsed time deterministically without fake timers.
 */
/**
 * Minimal time port. The harness reads the current epoch in ms via this port.
 */
export interface Clock {
    now(): number;
}
/**
 * Default adapter backed by `Date.now()`.
 * Use this when the test does not need to control time.
 */
export declare const systemClock: Clock;
/**
 * Test adapter — advances explicitly via `advance(ms)`.
 * Starts at epoch 0 by default; pass an initial value to override.
 *
 * @example
 * ```ts
 * const clock = new TestClock();
 * harness.openPosition({ ... });        // openedAt = 0
 * clock.advance(30 * 60_000);           // +30 minutes
 * await harness.priceTo(1.0510);        // elapsedMinutes = 30
 * ```
 */
export declare class TestClock implements Clock {
    #private;
    constructor(initial?: number);
    now(): number;
    advance(ms: number): void;
    set(ms: number): void;
}
//# sourceMappingURL=Clock.d.ts.map