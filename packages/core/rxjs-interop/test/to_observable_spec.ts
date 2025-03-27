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
} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {ComponentFixture, TestBed} from '@angular/core/testing';
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

  it('should produce an observable that tracks a signal', () => {
    const counter = signal(0);
    const values: number[] = [];
    toObservable(counter, {injector}).subscribe((value) => values.push(value));

    expect(values).toEqual([0]);

    // Initial effect execution, emits nothing.
    flushEffects();
    expect(values).toEqual([0]);

    counter.set(1);
    // Emits 1.
    flushEffects();
    expect(values).toEqual([0, 1]);

    counter.set(2);
    counter.set(3);
    // Emits 3 (ignores 2 as it was batched by the effect).
    flushEffects();

    expect(values).toEqual([0, 1, 3]);
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

  it('does not monitor the signal if the Observable is never subscribed', () => {
    let counterRead = false;
    const counter = computed(() => {
      counterRead = true;
      return 0;
    });

    toObservable(counter, {injector});

    // Simply creating the Observable shouldn't trigger a signal read.
    expect(counterRead).toBeFalse();

    // And no effects should be created which would read the signal.
    flushEffects();
    expect(counterRead).toBeFalse();
  });

  it('should not watch the signal when the Observable has no active subscribers', () => {
    const counter = signal(0);

    // Tracks how many reads of `counter()` there have been.
    let readCount = 0;
    const trackedCounter = computed(() => {
      readCount++;
      return counter();
    });

    const counter$ = toObservable(trackedCounter, {injector});

    // Verify that an effect is created
    const sub = counter$.subscribe();
    expect(readCount).toBe(1);

    // Sanity check of the read tracker - updating the counter should cause it to be read again
    // by the active effect.
    counter.set(1);
    flushEffects();
    expect(readCount).toBe(2);

    // Tear down the only subscription.
    sub.unsubscribe();

    // Now, setting the signal should not trigger additional reads.
    counter.set(2);
    flushEffects();
    expect(readCount).toBe(2);
  });

  it('should not watch the signal if the first value is an error', () => {
    let gotError = false;
    let readCount = 0;
    const source = signal(0);
    const alwaysErrors = computed(() => {
      source();
      readCount++;
      throw 'fail';
    });

    toObservable(alwaysErrors, {injector}).subscribe({
      next: () => {},
      error: () => {
        gotError = true;
      },
    });

    expect(gotError).toBeTrue();
    expect(readCount).toBe(1);

    // Dirty the `alwaysErrors` computed. Also reset the `gotError` flag to validate that the error
    // is never sent more than once.
    gotError = false;
    source.set(1);
    flushEffects();

    expect(readCount).toBe(1);
    expect(gotError).toBeFalse();
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
    toObservable(trackedCounter, {injector: childInjector}).subscribe();
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
