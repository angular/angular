/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, WritableSignal} from '../../src/core';
import {createWatch, SIGNAL} from '../../primitives/signals';
import {isBrowser, timeout} from '@angular/private/testing';

describe('signal graph: destroyed consumers should be GC-eligible', () => {
  if (isBrowser) {
    it('should pass', () => {});
    return;
  }

  function setupAndReturnRef(source: WritableSignal<number>): WeakRef<object> {
    const watch = createWatch(
      () => source(),
      () => {},
      true,
    );
    watch.run();

    const ref = new WeakRef(watch[SIGNAL]);

    // Non-live computed that also reads source.
    const derived = computed(() => source() + 1);
    derived();

    // Clearing the graph edges.
    watch.destroy();

    return ref;
  }

  it('should GC a destroyed effect when a non-live computed reads the same producer', async () => {
    const source = signal(0);
    const ref = setupAndReturnRef(source);

    (globalThis as any).gc();
    await timeout();
    (globalThis as any).gc();

    expect(ref.deref()).toBeUndefined();
  });

  it('should GC destroyed effects across repeated create/destroy cycles', async () => {
    const source = signal(0);
    const derived = computed(() => source() + 1);
    derived();

    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 5; i++) {
      refs.push(setupAndReturnRef(source));
    }

    (globalThis as any).gc();
    await timeout();
    (globalThis as any).gc();

    for (let i = 0; i < refs.length; i++) {
      expect(refs[i].deref()).withContext(`cycle ${i}`).toBeUndefined();
    }
  });
});
