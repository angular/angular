/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '../../src/core';
import {createWatch} from '../../primitives/signals';

import {flushEffects, resetEffects, testingEffect} from './effect_util';

const NOOP_FN = () => {};

describe('watchers', () => {
  afterEach(() => {
    resetEffects();
  });

  it('should create and run once, even without dependencies', () => {
    let runs = 0;

    testingEffect(() => {
      runs++;
    });

    flushEffects();
    expect(runs).toEqual(1);
  });

  it('should schedule on dependencies (signal) change', () => {
    const count = signal(0);
    let runLog: number[] = [];
    const effectRef = testingEffect(() => {
      runLog.push(count());
    });

    flushEffects();
    expect(runLog).toEqual([0]);

    count.set(1);
    flushEffects();
    expect(runLog).toEqual([0, 1]);
  });

  it('should not schedule when a previous dependency changes', () => {
    const increment = (value: number) => value + 1;
    const countA = signal(0);
    const countB = signal(100);
    const useCountA = signal(true);

    const runLog: number[] = [];
    testingEffect(() => {
      runLog.push(useCountA() ? countA() : countB());
    });

    flushEffects();
    expect(runLog).toEqual([0]);

    countB.update(increment);
    flushEffects();
    // No update expected: updated the wrong signal.
    expect(runLog).toEqual([0]);

    countA.update(increment);
    flushEffects();
    expect(runLog).toEqual([0, 1]);

    useCountA.set(false);
    flushEffects();
    expect(runLog).toEqual([0, 1, 101]);

    countA.update(increment);
    flushEffects();
    // No update expected: updated the wrong signal.
    expect(runLog).toEqual([0, 1, 101]);
  });

  it("should not update dependencies when dependencies don't change", () => {
    const source = signal(0);
    const isEven = computed(() => source() % 2 === 0);
    let updateCounter = 0;
    testingEffect(() => {
      isEven();
      updateCounter++;
    });

    flushEffects();
    expect(updateCounter).toEqual(1);

    source.set(1);
    flushEffects();
    expect(updateCounter).toEqual(2);

    source.set(3);
    flushEffects();
    expect(updateCounter).toEqual(2);

    source.set(4);
    flushEffects();
    expect(updateCounter).toEqual(3);
  });

  it('should allow registering cleanup function from the watch logic', () => {
    const source = signal(0);

    const seenCounterValues: number[] = [];
    testingEffect((onCleanup) => {
      seenCounterValues.push(source());

      // register a cleanup function that is executed every time an effect re-runs
      onCleanup(() => {
        if (seenCounterValues.length === 2) {
          seenCounterValues.length = 0;
        }
      });
    });

    flushEffects();
    expect(seenCounterValues).toEqual([0]);

    source.update((c) => c + 1);
    flushEffects();
    expect(seenCounterValues).toEqual([0, 1]);

    source.update((c) => c + 1);
    flushEffects();
    // cleanup (array trim) should have run before executing effect
    expect(seenCounterValues).toEqual([2]);
  });

  it('should forget previously registered cleanup function when effect re-runs', () => {
    const source = signal(0);

    const seenCounterValues: number[] = [];
    testingEffect((onCleanup) => {
      const value = source();

      seenCounterValues.push(value);

      // register a cleanup function that is executed next time an effect re-runs
      if (value === 0) {
        onCleanup(() => {
          seenCounterValues.length = 0;
        });
      }
    });

    flushEffects();
    expect(seenCounterValues).toEqual([0]);

    source.set(2);
    flushEffects();
    // cleanup (array trim) should have run before executing effect
    expect(seenCounterValues).toEqual([2]);

    source.set(3);
    flushEffects();
    // cleanup (array trim) should _not_ be registered again
    expect(seenCounterValues).toEqual([2, 3]);
  });

  it('should throw an error when reading a signal during the notification phase', () => {
    const source = signal(0);
    let ranScheduler = false;
    const w = createWatch(
      () => {
        source();
      },
      () => {
        ranScheduler = true;
        expect(() => source()).toThrow();
      },
      false,
    );

    // Run the effect manually to initiate dependency tracking.
    w.run();

    // Changing the signal will attempt to schedule the effect.
    source.set(1);
    expect(ranScheduler).toBeTrue();
  });

  describe('destroy', () => {
    it('should not run destroyed watchers', () => {
      let watchRuns = 0;
      const watchRef = createWatch(
        () => {
          watchRuns++;
        },
        NOOP_FN,
        false,
      );

      watchRef.run();
      expect(watchRuns).toBe(1);

      watchRef.destroy();
      watchRef.run();
      expect(watchRuns).toBe(1);
    });

    it('should disconnect destroyed watches from the reactive graph', () => {
      const counter = signal(0);

      let scheduleCount = 0;
      const watchRef = createWatch(
        () => counter(),
        () => scheduleCount++,
        false,
      );

      // watches are _not_ scheduled by default, run it for the first time to capture
      // dependencies
      watchRef.run();
      expect(scheduleCount).toBe(0);

      watchRef.destroy();
      counter.set(1);
      expect(scheduleCount).toBe(0);
    });

    it('should not schedule destroyed watches', () => {
      let scheduleCount = 0;
      const watchRef = createWatch(NOOP_FN, () => scheduleCount++, false);

      // watches are _not_ scheduled by default
      expect(scheduleCount).toBe(0);

      watchRef.notify();
      expect(scheduleCount).toBe(1);

      watchRef.destroy();
      watchRef.notify();
      expect(scheduleCount).toBe(1);
    });

    it('should not run cleanup functions after destroy', () => {
      const counter = signal(0);
      let cleanupRuns = 0;
      const watchRef = createWatch(
        (onCleanup) => {
          counter();
          onCleanup(() => cleanupRuns++);
        },
        NOOP_FN,
        false,
      );

      // initial run to register cleanup function
      watchRef.run();

      watchRef.destroy();
      // cleanup functions run on destroy
      expect(cleanupRuns).toBe(1);

      // subsequent destroy should be noop
      watchRef.destroy();
      expect(cleanupRuns).toBe(1);
    });
  });
});
