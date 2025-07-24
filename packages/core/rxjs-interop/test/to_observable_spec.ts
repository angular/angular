/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
  Injector,
  Signal,
  signal,
} from '../../src/core';
import {toObservable} from '../src';
import {ComponentFixture, TestBed} from '../../testing';
import {take, toArray} from 'rxjs/operators';

describe('toObservable()', () => {
  let fixture!: ComponentFixture<unknown>;
  let injector!: EnvironmentInjector;

  @Component({
    template: '',
  })
  class Cmp {}

  beforeEach(() => {
    fixture = TestBed.createComponent(Cmp);
    injector = TestBed.inject(EnvironmentInjector);
  });

  function flushEffects(): void {
    fixture.detectChanges();
  }

  it('should produce an observable that tracks a signal', async () => {
    const counter = signal(0);
    const counterValues = toObservable(counter, {injector}).pipe(take(3), toArray()).toPromise();

    // Initial effect execution, emits 0.
    flushEffects();

    counter.set(1);
    // Emits 1.
    flushEffects();

    counter.set(2);
    counter.set(3);
    // Emits 3 (ignores 2 as it was batched by the effect).
    flushEffects();

    expect(await counterValues).toEqual([0, 1, 3]);
  });

  it('should propagate errors from the signal', () => {
    const source = signal(1);
    const counter = computed(() => {
      const value = source();
      if (value === 2) {
        throw 'fail';
      } else {
        return value;
      }
    });

    const counter$ = toObservable(counter, {injector});

    let currentValue: number = 0;
    let currentError: any = null;

    const sub = counter$.subscribe({
      next: (value) => (currentValue = value),
      error: (err) => (currentError = err),
    });

    flushEffects();
    expect(currentValue).toBe(1);

    source.set(2);
    flushEffects();
    expect(currentError).toBe('fail');

    sub.unsubscribe();
  });

  it('monitors the signal even if the Observable is never subscribed', () => {
    let counterRead = false;
    const counter = computed(() => {
      counterRead = true;
      return 0;
    });

    toObservable(counter, {injector});

    // Simply creating the Observable shouldn't trigger a signal read.
    expect(counterRead).toBeFalse();

    // The signal is read after effects have run.
    flushEffects();
    expect(counterRead).toBeTrue();
  });

  it('should still monitor the signal if the Observable has no active subscribers', () => {
    const counter = signal(0);

    // Tracks how many reads of `counter()` there have been.
    let readCount = 0;
    const trackedCounter = computed(() => {
      readCount++;
      return counter();
    });

    const counter$ = toObservable(trackedCounter, {injector});

    const sub = counter$.subscribe();
    expect(readCount).toBe(0);

    flushEffects();
    expect(readCount).toBe(1);

    // Sanity check of the read tracker - updating the counter should cause it to be read again
    // by the active effect.
    counter.set(1);
    flushEffects();
    expect(readCount).toBe(2);

    // Tear down the only subscription.
    sub.unsubscribe();

    // Now, setting the signal still triggers additional reads
    counter.set(2);
    flushEffects();
    expect(readCount).toBe(3);
  });

  it('stops monitoring the signal once injector is destroyed', () => {
    const counter = signal(0);

    // Tracks how many reads of `counter()` there have been.
    let readCount = 0;
    const trackedCounter = computed(() => {
      readCount++;
      return counter();
    });

    const childInjector = createEnvironmentInjector([], injector);
    toObservable(trackedCounter, {injector: childInjector});

    expect(readCount).toBe(0);

    flushEffects();
    expect(readCount).toBe(1);

    // Now, setting the signal shouldn't trigger any additional reads, as the Injector was destroyed
    childInjector.destroy();
    counter.set(2);
    flushEffects();
    expect(readCount).toBe(1);
  });

  it('does not track downstream signal reads in the effect', () => {
    const counter = signal(0);
    const emits = signal(0);
    toObservable(counter, {injector}).subscribe(() => {
      // Read emits. If we are still tracked in the effect, this will cause an infinite loop by
      // triggering the effect again.
      emits();
      emits.update((v) => v + 1);
    });
    flushEffects();
    expect(emits()).toBe(1);
    flushEffects();
    expect(emits()).toBe(1);
  });
});
