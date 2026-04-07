/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, untracked} from '../../src/core';

import {flushEffects, resetEffects, testingEffect} from './effect_util';

describe('non-reactive reads', () => {
  afterEach(() => {
    resetEffects();
  });

  it('should read the latest value from signal', () => {
    const counter = signal(0);

    expect(untracked(counter)).toEqual(0);

    counter.set(1);
    expect(untracked(counter)).toEqual(1);
  });

  it('should not add dependencies to computed when reading a value from a signal', () => {
    const counter = signal(0);
    const double = computed(() => untracked(counter) * 2);

    expect(double()).toEqual(0);

    counter.set(2);
    expect(double()).toEqual(0);
  });

  it('should refresh computed value if stale and read non-reactively ', () => {
    const counter = signal(0);
    const double = computed(() => counter() * 2);

    expect(untracked(double)).toEqual(0);

    counter.set(2);
    expect(untracked(double)).toEqual(4);
  });

  it('should not make surrounding effect depend on the signal', () => {
    const s = signal(1);

    const runLog: number[] = [];
    testingEffect(() => {
      runLog.push(untracked(s));
    });

    // an effect will run at least once
    flushEffects();
    expect(runLog).toEqual([1]);

    // subsequent signal changes should not trigger effects as signal is untracked
    s.set(2);
    flushEffects();
    expect(runLog).toEqual([1]);
  });

  it('should schedule on dependencies (computed) change', () => {
    const count = signal(0);
    const double = computed(() => count() * 2);

    let runLog: number[] = [];
    testingEffect(() => {
      runLog.push(double());
    });

    flushEffects();
    expect(runLog).toEqual([0]);

    count.set(1);
    flushEffects();
    expect(runLog).toEqual([0, 2]);
  });

  it('should non-reactively read all signals accessed inside untrack', () => {
    const first = signal('John');
    const last = signal('Doe');

    let runLog: string[] = [];
    const effectRef = testingEffect(() => {
      untracked(() => runLog.push(`${first()} ${last()}`));
    });

    // effects run at least once
    flushEffects();
    expect(runLog).toEqual(['John Doe']);

    // change one of the signals - should not update as not read reactively
    first.set('Patricia');
    flushEffects();
    expect(runLog).toEqual(['John Doe']);

    // change one of the signals - should not update as not read reactively
    last.set('Garcia');
    flushEffects();
    expect(runLog).toEqual(['John Doe']);
  });
});
