/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal} from '@angular/core/src/signals';
import {effect, effectsDone as flush, resetEffects, runWatchQueue} from '@angular/core/src/signals/src/effect';

describe('effects', () => {
  afterEach(() => {
    resetEffects();
  });

  it('should create and run once effect without dependencies', async () => {
    let runs = 0;

    const effectRef = effect(() => {
      runs++;
    });

    await flush();
    expect(runs).toEqual(1);

    effectRef.destroy();
    await flush();
    expect(runs).toEqual(1);
  });

  it('should schedule effects on dependencies (signal) change', async () => {
    const count = signal(0);
    let runLog: number[] = [];
    const effectRef = effect(() => {
      runLog.push(count());
    });

    await flush();
    expect(runLog).toEqual([0]);

    count.set(1);
    await flush();
    expect(runLog).toEqual([0, 1]);

    effectRef.destroy();
    count.set(2);
    await flush();
    expect(runLog).toEqual([0, 1]);
  });

  it('should not schedule when a previous dependency changes', async () => {
    const increment = (value: number) => value + 1;
    const countA = signal(0);
    const countB = signal(100);
    const useCountA = signal(true);


    const runLog: number[] = [];
    effect(() => {
      runLog.push(useCountA() ? countA() : countB());
    });

    await flush();
    expect(runLog).toEqual([0]);

    countB.update(increment);
    await flush();
    // No update expected: updated the wrong signal.
    expect(runLog).toEqual([0]);

    countA.update(increment);
    await flush();
    expect(runLog).toEqual([0, 1]);

    useCountA.set(false);
    await flush();
    expect(runLog).toEqual([0, 1, 101]);

    countA.update(increment);
    await flush();
    // No update expected: updated the wrong signal.
    expect(runLog).toEqual([0, 1, 101]);
  });

  it('should not update dependencies of effects when dependencies don\'t change', async () => {
    const source = signal(0);
    const isEven = computed(() => source() % 2 === 0);
    let updateCounter = 0;
    effect(() => {
      isEven();
      updateCounter++;
    });

    await flush();
    expect(updateCounter).toEqual(1);

    source.set(1);
    await flush();
    expect(updateCounter).toEqual(2);

    source.set(3);
    await flush();
    expect(updateCounter).toEqual(2);

    source.set(4);
    await flush();
    expect(updateCounter).toEqual(3);
  });

  it('should prevent effects from being queued when effects are reset', async () => {
    const source = signal(0);
    let effectCounter = 0;
    effect(() => {
      effectCounter++;
      source();
    });

    await flush();
    expect(effectCounter).toBe(1);

    resetEffects();

    source.set(1);
    await flush();

    expect(effectCounter).toBe(1);
  });

  it('only rerun pending effects when some effects throws', () => {
    const source = signal(0);
    let effect1Counter = 0;
    let effect2Counter = 0;
    let effect3Counter = 0;
    effect(() => {
      effect1Counter++;
      source();
    });
    effect(() => {
      effect2Counter++;
      if (source() % 2 === 0) {
        throw new Error('Even numbers throw an error');
      }
    });
    effect(() => {
      effect3Counter++;
      source();
    });

    expect(runWatchQueue).toThrowError('Even numbers throw an error');
    expect(effect1Counter).toBe(1);
    expect(effect2Counter).toBe(1);
    expect(effect3Counter).toBe(0);

    expect(runWatchQueue).not.toThrowError('Even numbers throw an error');
    expect(effect1Counter).toBe(1);
    expect(effect2Counter).toBe(1);
    expect(effect3Counter).toBe(1);

    source.set(1);

    expect(runWatchQueue).not.toThrowError();
    expect(effect1Counter).toBe(2);
    expect(effect2Counter).toBe(2);
    expect(effect3Counter).toBe(2);
  });
});
