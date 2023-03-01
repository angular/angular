/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal, untracked} from '@angular/core/src/signals';
import {effect, effectsDone as flush, resetEffects} from '@angular/core/src/signals/src/effect';

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

  it('should not make surrounding effect depend on the signal', async () => {
    const s = signal(1);

    const runLog: number[] = [];
    effect(() => {
      runLog.push(untracked(s));
    });

    // an effect will run at least once
    await flush();
    expect(runLog).toEqual([1]);

    // subsequent signal changes should not trigger effects as signal is untracked
    s.set(2);
    await flush();
    expect(runLog).toEqual([1]);
  });

  it('should schedule effects on dependencies (computed) change', async () => {
    const count = signal(0);
    const double = computed(() => count() * 2);

    let runLog: number[] = [];
    const effectRef = effect(() => {
      runLog.push(double());
    });

    await flush();
    expect(runLog).toEqual([0]);

    count.set(1);
    await flush();
    expect(runLog).toEqual([0, 2]);

    effectRef.destroy();
    count.set(2);
    await flush();
    expect(runLog).toEqual([0, 2]);
  });

  it('should non-reactively read all signals accessed inside untrack', async () => {
    const first = signal('John');
    const last = signal('Doe');

    let runLog: string[] = [];
    const effectRef = effect(() => {
      untracked(() => runLog.push(`${first()} ${last()}`));
    });

    // effects run at least once
    await flush();
    expect(runLog).toEqual(['John Doe']);

    // change one of the signals - should not update as not read reactively
    first.set('Patricia');
    await flush();
    expect(runLog).toEqual(['John Doe']);

    // change one of the signals - should not update as not read reactively
    last.set('Garcia');
    await flush();
    expect(runLog).toEqual(['John Doe']);

    // destroy effect, should not respond to changes
    effectRef.destroy();
    first.set('Robert');
    last.set('Smith');
    await flush();
    expect(runLog).toEqual(['John Doe']);
  });
});
