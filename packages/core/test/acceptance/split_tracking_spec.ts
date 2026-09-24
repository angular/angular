/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {
  afterRenderEffect,
  ApplicationRef,
  computed,
  effect,
  Injector,
  signal,
  Signal,
} from '../../src/core';
import {EffectCleanupRegisterFn} from '../../src/render3/reactivity/effect';
import {splitTracking} from '../../src/render3/reactivity/split_tracking';

describe('splitTracking', () => {
  it('should track only the tracking function (effect)', () => {
    let effectCount = 0;
    const trackedValue = signal('tracked');
    const untrackedValue = signal('untracked');

    effect(
      splitTracking(
        () => trackedValue(),
        (val: string) => {
          // Read untrackedValue to verify it's not tracked
          untrackedValue();
          effectCount++;
        },
      ),
      {injector: TestBed.inject(Injector)},
    );

    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    expect(effectCount).toBe(1);

    untrackedValue.set('changed untracked');
    appRef.tick();
    expect(effectCount).toBe(1);

    trackedValue.set('changed tracked');
    appRef.tick();
    expect(effectCount).toBe(2);
  });

  it('should provide cleanup function for effect', () => {
    let cleanupCount = 0;
    let effectCount = 0;
    const trackedValue = signal('tracked');

    effect(
      splitTracking(
        () => trackedValue(),
        (val: string, onCleanup: EffectCleanupRegisterFn) => {
          effectCount++;
          onCleanup(() => cleanupCount++);
        },
      ),
      {injector: TestBed.inject(Injector)},
    );

    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    expect(effectCount).toBe(1);
    expect(cleanupCount).toBe(0);

    trackedValue.set('changed 1');
    appRef.tick();
    expect(effectCount).toBe(2);
    expect(cleanupCount).toBe(1);

    trackedValue.set('changed 2');
    appRef.tick();
    expect(effectCount).toBe(3);
    expect(cleanupCount).toBe(2);
  });

  it('should track only invoked signals', () => {
    let effectCount = 0;
    const sigA = signal('A');
    const sigB = signal('B');
    effect(
      splitTracking(
        () => [sigA, sigB] as const,
        ([valA, valB]) => {
          // Those signals were not invoked before hands.
          valA();
          valB();
          effectCount++;
        },
      ),
      {injector: TestBed.inject(Injector)},
    );

    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    expect(effectCount).toBe(1);
    sigA.set('changed A');
    appRef.tick();
    expect(effectCount).toBe(1);
    sigB.set('changed B');
    appRef.tick();
    expect(effectCount).toBe(1);
  });

  it('should work with afterRenderEffect without phases', () => {
    let effectCount = 0;
    const trackedValue = signal('tracked');
    const untrackedValue = signal('untracked');

    afterRenderEffect(
      splitTracking(
        () => trackedValue(),
        (val: string) => {
          untrackedValue();
          effectCount++;
        },
      ),
      {injector: TestBed.inject(Injector)},
    );

    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    expect(effectCount).toBe(1);

    untrackedValue.set('changed untracked');
    appRef.tick();
    expect(effectCount).toBe(1);

    trackedValue.set('changed tracked');
    appRef.tick();
    expect(effectCount).toBe(2);
  });

  it('should work with afterRenderEffect with phases', () => {
    let earlyReadCount = 0;
    let writeCount = 0;
    let cleanupCount = 0;
    const trackedValue = signal('tracked');
    const untrackedValue = signal('untracked');

    afterRenderEffect(
      {
        earlyRead: () => {
          // early read is tracked
          trackedValue();
          earlyReadCount++;
          return 42;
        },
        write: splitTracking(
          // tracking fn
          () => trackedValue(),
          (val: string, earlyReadVal: Signal<number>, onCleanup: EffectCleanupRegisterFn) => {
            // non tracking execute fn
            untrackedValue();
            writeCount++;
            expect(earlyReadVal()).toBe(42);
            onCleanup(() => {
              cleanupCount++;
            });
          },
        ),
      },
      {injector: TestBed.inject(Injector)},
    );

    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    expect(earlyReadCount).toBe(1);
    expect(writeCount).toBe(1);
    expect(cleanupCount).toBe(0);

    untrackedValue.set('changed untracked');
    appRef.tick();
    expect(earlyReadCount).toBe(1);
    expect(writeCount).toBe(1);
    expect(cleanupCount).toBe(0);

    trackedValue.set('changed tracked');
    appRef.tick();
    expect(earlyReadCount).toBe(2);
    expect(writeCount).toBe(2);
    expect(cleanupCount).toBe(1);
  });

  it('should work with computed', () => {
    let executeCount = 0;
    const trackedValue = signal('tracked');
    const untrackedValue = signal('untracked');

    const result = computed(
      splitTracking(
        () => trackedValue(),
        (val: string) => {
          untrackedValue();
          executeCount++;
          return val + ' and ' + untrackedValue();
        },
      ),
    );

    expect(result()).toBe('tracked and untracked');
    expect(executeCount).toBe(1);

    untrackedValue.set('changed untracked');
    // untracked changing should not trigger recomputation
    expect(result()).toBe('tracked and untracked');
    expect(executeCount).toBe(1);

    trackedValue.set('changed tracked');
    // tracked changing should trigger recomputation, reading the new untracked value
    expect(result()).toBe('changed tracked and changed untracked');
    expect(executeCount).toBe(2);
  });
});
