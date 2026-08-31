/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, passiveRead, signal} from '../../src/core';

import {flushEffects, resetEffects, testingEffect} from './effect_util';

describe('passiveRead', () => {
  afterEach(() => {
    resetEffects();
  });

  it('should return an uncomputed signal without computing it', () => {
    let computations = 0;
    const value = computed(() => ++computations);

    expect(passiveRead(value)).toEqual({hasValue: false, value: undefined});
    expect(computations).toBe(0);
  });

  it('should return a cached value without recomputing a dirty signal', () => {
    const source = signal(1);
    let computations = 0;
    const value = computed(() => {
      computations++;
      return source() * 2;
    });

    expect(value()).toBe(2);
    source.set(2);

    expect(passiveRead(value)).toEqual({hasValue: true, value: 2});
    expect(computations).toBe(1);
  });

  it('should track a passive dependency from a computed without recomputing it', () => {
    const source = signal(1);
    let valueComputations = 0;
    const value = computed(() => {
      valueComputations++;
      return source() * 2;
    });
    let observerComputations = 0;
    const observer = computed(() => {
      observerComputations++;
      const result = passiveRead(value);
      return result.hasValue ? result.value : -1;
    });

    expect(value()).toBe(2);
    expect(observer()).toBe(2);
    expect(valueComputations).toBe(1);

    source.set(2);

    expect(observer()).toBe(2);
    expect(valueComputations).toBe(1);
    expect(observerComputations).toBe(2);
  });

  it('should remove a passive dependency when a computed stops reading it', () => {
    const shouldRead = signal(true);
    const source = signal(1);
    const value = computed(() => source() * 2);
    let observerComputations = 0;
    const observer = computed(() => {
      observerComputations++;
      if (!shouldRead()) {
        return -1;
      }

      const result = passiveRead(value);
      return result.hasValue ? result.value : -1;
    });

    expect(value()).toBe(2);
    expect(observer()).toBe(2);

    shouldRead.set(false);
    expect(observer()).toBe(-1);

    source.set(2);
    expect(observer()).toBe(-1);
    expect(observerComputations).toBe(2);
  });

  it('should schedule an effect when a passively read signal becomes dirty', () => {
    const source = signal(1);
    let computations = 0;
    const value = computed(() => {
      computations++;
      return source() * 2;
    });
    const results: number[] = [];
    let runs = 0;

    expect(value()).toBe(2);

    testingEffect(() => {
      runs++;
      const result = passiveRead(value);
      if (result.hasValue) {
        results.push(result.value);
      }
    });

    flushEffects();
    expect(results).toEqual([2]);
    expect(computations).toBe(1);

    source.set(2);
    flushEffects();
    expect(runs).toBe(2);
    expect(results).toEqual([2, 2]);
    expect(computations).toBe(1);
  });
});
