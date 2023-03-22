/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal} from '@angular/core/src/signals';

import {flushEffects, resetEffects, testingEffect} from './effect_util';

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

  it('should not update dependencies when dependencies don\'t change', () => {
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
});
