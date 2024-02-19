/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed} from '@angular/core';
import {model} from '@angular/core/src/authoring/model/model';
import {ModelSignal} from '@angular/core/src/authoring/model/model_signal';

/**
 * Utility type representing a signal that can be subscribed to. This is already captured
 * in `ModelSignal`, but it's marked as internal which makes it unavailable in tests.
 */
type SubscribableSignal<T> = ModelSignal<T>&{
  subscribe(callback: (value: T) => void): () => void;
};

describe('model signal', () => {
  it('should work with computed expressions', () => {
    const signal = model(0);
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
    const signal = model(2);

    signal.update(value => value * 3);
    expect(signal()).toBe(6);

    signal.update(value => value * 3);
    expect(signal()).toBe(18);
  });

  it('should emit when the value changes', () => {
    const signal = model(1) as SubscribableSignal<number>;
    const values: number[] = [];

    signal.subscribe(value => values.push(value));

    signal.set(2);
    expect(values).toEqual([2]);

    signal.update(previous => previous * 2);
    expect(values).toEqual([2, 4]);

    signal.set(5);
    expect(values).toEqual([2, 4, 5]);
  });

  it('should stop emitting after unsubscribing', () => {
    const signal = model(0) as SubscribableSignal<number>;
    const values: number[] = [];
    const subscription = signal.subscribe(value => values.push(value));

    signal.set(1);
    expect(values).toEqual([1]);

    subscription();
    signal.set(2);
    expect(values).toEqual([1]);
  });

  it('should not emit if the value does not change', () => {
    const signal = model(0) as SubscribableSignal<number>;
    const values: number[] = [];
    signal.subscribe(value => values.push(value));

    signal.set(1);
    expect(values).toEqual([1]);
    signal.set(1);
    expect(values).toEqual([1]);

    signal.update(previous => previous * 2);
    expect(values).toEqual([1, 2]);
    signal.update(previous => previous * 1);
    expect(values).toEqual([1, 2]);
  });

  it('should not share subscriptions between models', () => {
    let emitCount = 0;
    const signal1 = model(0) as SubscribableSignal<number>;
    const signal2 = model(0) as SubscribableSignal<number>;
    const callback = () => emitCount++;
    const subscription1 = signal1.subscribe(callback);
    const subscription2 = signal2.subscribe(callback);

    signal1.set(1);
    expect(emitCount).toBe(1);

    signal2.set(1);
    expect(emitCount).toBe(2);

    subscription1();
    signal2.set(2);
    expect(emitCount).toBe(3);

    subscription2();
    signal2.set(3);
    expect(emitCount).toBe(3);
  });

  it('should throw if there is no value for required model', () => {
    const signal = model.required();

    expect(() => signal()).toThrowError(/Model is required but no value is available yet\./);

    signal.set(1);
    expect(signal()).toBe(1);
  });

  it('should throw if a `computed` depends on an uninitialized required model', () => {
    const signal = model.required<number>();
    const expr = computed(() => signal() + 1000);

    expect(() => expr()).toThrowError(/Model is required but no value is available yet\./);

    signal.set(1);
    expect(expr()).toBe(1001);
  });

  it('should have a toString implementation', () => {
    const signal = model(0);
    expect(signal + '').toBe('[Model Signal: 0]');
  });
});
