/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, isSignal, model, WritableSignal} from '../../src/core';
import {TestBed} from '../../testing';

describe('model signal', () => {
  it('should work with computed expressions', () => {
    const signal = TestBed.runInInjectionContext(() => model(0));
    let computedCount = 0;
    const derived = computed(() => (computedCount++, signal() + 1000));

    expect(derived()).toBe(1000);
    expect(computedCount).toBe(1);

    signal.set(1);
    expect(computedCount).toBe(1);

    expect(derived()).toBe(1001);
    expect(computedCount).toBe(2);
  });

  it('should allow updates based on the previous value', () => {
    const signal = TestBed.runInInjectionContext(() => model(2));

    signal.update((value) => value * 3);
    expect(signal()).toBe(6);

    signal.update((value) => value * 3);
    expect(signal()).toBe(18);
  });

  it('should return readonly signal', () => {
    const signal = TestBed.runInInjectionContext(() => model(2));
    const readOnly = signal.asReadonly();

    expect(isSignal(readOnly)).toBeTrue();
    expect(readOnly()).toBe(2);
    expect((readOnly as WritableSignal<unknown>).set).toBeUndefined();
    expect((readOnly as WritableSignal<unknown>).update).toBeUndefined();
  });

  it('should emit when the value changes', () => {
    const signal = TestBed.runInInjectionContext(() => model(1));
    const values: number[] = [];

    signal.subscribe((value) => values.push(value));

    signal.set(2);
    expect(values).toEqual([2]);

    signal.update((previous) => previous * 2);
    expect(values).toEqual([2, 4]);

    signal.set(5);
    expect(values).toEqual([2, 4, 5]);
  });

  it('should error when subscribing to a destroyed model', () => {
    const signal = TestBed.runInInjectionContext(() => model(1));
    const values: number[] = [];

    signal.subscribe((value) => values.push(value));

    TestBed.resetTestingModule();

    expect(() => signal.subscribe(() => {})).toThrowError(
      /Unexpected subscription to destroyed `OutputRef`/,
    );
  });

  it('should stop emitting after unsubscribing', () => {
    const signal = TestBed.runInInjectionContext(() => model(0));
    const values: number[] = [];
    const subscription = signal.subscribe((value) => values.push(value));

    signal.set(1);
    expect(values).toEqual([1]);

    subscription.unsubscribe();
    signal.set(2);
    expect(values).toEqual([1]);
  });

  it('should not emit if the value does not change', () => {
    const signal = TestBed.runInInjectionContext(() => model(0));
    const values: number[] = [];
    signal.subscribe((value) => values.push(value));

    signal.set(1);
    expect(values).toEqual([1]);
    signal.set(1);
    expect(values).toEqual([1]);

    signal.update((previous) => previous * 2);
    expect(values).toEqual([1, 2]);
    signal.update((previous) => previous * 1);
    expect(values).toEqual([1, 2]);
  });

  it('should not share subscriptions between models', () => {
    let emitCount = 0;
    const signal1 = TestBed.runInInjectionContext(() => model(0));
    const signal2 = TestBed.runInInjectionContext(() => model(0));
    const callback = () => emitCount++;
    const subscription1 = signal1.subscribe(callback);
    const subscription2 = signal2.subscribe(callback);

    signal1.set(1);
    expect(emitCount).toBe(1);

    signal2.set(1);
    expect(emitCount).toBe(2);

    subscription1.unsubscribe();
    signal2.set(2);
    expect(emitCount).toBe(3);

    subscription2.unsubscribe();
    signal2.set(3);
    expect(emitCount).toBe(3);
  });

  it('should throw if there is no value for required model', () => {
    const signal = TestBed.runInInjectionContext(() => model.required());

    expect(() => signal()).toThrowError(/Model is required but no value is available yet\./);

    signal.set(1);
    expect(signal()).toBe(1);
  });

  it('should throw if a `computed` depends on an uninitialized required model', () => {
    const signal = TestBed.runInInjectionContext(() => model.required<number>());
    const expr = computed(() => signal() + 1000);

    expect(() => expr()).toThrowError(/Model is required but no value is available yet\./);

    signal.set(1);
    expect(expr()).toBe(1001);
  });

  it('should have a toString implementation', () => {
    const signal = TestBed.runInInjectionContext(() => model(0));
    expect(signal + '').toBe('[Model Signal: 0]');
  });
});
