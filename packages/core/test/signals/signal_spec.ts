/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  signal,
  ɵupgradeSignalToWritable as upgradeSignalToWritable,
} from '../../src/core';
import {
  ReactiveHookFn,
  ReactiveNode,
  setPostProducerCreatedFn,
  setPostSignalSetFn,
  SIGNAL,
} from '../../primitives/signals';

describe('signals', () => {
  it('should be a getter which reflects the set value', () => {
    const state = signal(false);
    expect(state()).toBeFalse();
    state.set(true);
    expect(state()).toBeTrue();
  });

  it('should accept update function to set new value based on the previous one', () => {
    const counter = signal(0);
    expect(counter()).toEqual(0);

    counter.update((c) => c + 1);
    expect(counter()).toEqual(1);
  });

  it('should not update signal when new value is equal to the previous one', () => {
    const state = signal('aaa', {equal: (a, b) => a.length === b.length});
    expect(state()).toEqual('aaa');

    // set to a "different" value that is "equal" to the previous one
    // there should be no change in the signal's value as the new value is determined to be equal
    // to the previous one
    state.set('bbb');
    expect(state()).toEqual('aaa');

    state.update((_) => 'ccc');
    expect(state()).toEqual('aaa');

    // setting a "non-equal" value
    state.set('d');
    expect(state()).toEqual('d');
  });

  it('should not propagate change when the new signal value is equal to the previous one', () => {
    const state = signal('aaa', {equal: (a, b) => a.length === b.length});
    const upper = computed(() => state().toUpperCase());

    // set to a "different" value that is "equal" to the previous one
    // there should be no change in the signal's value as the new value is determined to be equal
    // to the previous one
    state.set('bbb');
    expect(upper()).toEqual('AAA');

    state.update((_) => 'ccc');
    expect(upper()).toEqual('AAA');

    // setting a "non-equal" value
    state.set('d');
    expect(upper()).toEqual('D');
  });

  it('should consider objects as equal based on their identity with the default equality function', () => {
    let stateValue: unknown = {};
    const state = signal(stateValue);
    let computeCount = 0;
    const derived = computed(() => `${typeof state()}:${++computeCount}`);
    expect(derived()).toEqual('object:1');

    // reset signal value to the same object instance, expect NO change notification
    state.set(stateValue);
    expect(derived()).toEqual('object:1');

    // reset signal value to a different object instance, expect change notification
    stateValue = {};
    state.set(stateValue);
    expect(derived()).toEqual('object:2');

    // reset signal value to a different object type, expect change notification
    stateValue = [];
    state.set(stateValue);
    expect(derived()).toEqual('object:3');

    // reset signal value to the same array instance, expect NO change notification
    state.set(stateValue);
    expect(derived()).toEqual('object:3');
  });

  it('should invoke custom equality function even if old / new references are the same', () => {
    const state = {value: 0};
    const stateSignal = signal(state, {equal: (a, b) => false});

    let computeCount = 0;
    const derived = computed(() => `${stateSignal().value}:${++computeCount}`);

    // derived is re-computed initially
    expect(derived()).toBe('0:1');

    // setting signal with the same reference should propagate change due to the custom equality
    stateSignal.set(state);
    expect(derived()).toBe('0:2');

    // updating signal with the same reference should propagate change as well
    stateSignal.update((state) => state);
    expect(derived()).toBe('0:3');
  });

  it('should allow converting writable signals to their readonly counterpart', () => {
    const counter = signal(0);
    const readOnlyCounter = counter.asReadonly();

    // @ts-expect-error
    expect(readOnlyCounter.set).toBeUndefined();
    // @ts-expect-error
    expect(readOnlyCounter.update).toBeUndefined();

    const double = computed(() => readOnlyCounter() * 2);
    expect(double()).toBe(0);

    counter.set(2);
    expect(double()).toBe(4);
  });

  it('should have a toString implementation', () => {
    const state = signal(false);
    expect(state + '').toBe('[Signal: false]');
  });

  it('should set debugName when a debugName is provided', () => {
    const node = signal(false, {debugName: 'falseSignal'})[SIGNAL] as ReactiveNode;
    expect(node.debugName).toBe('falseSignal');
  });

  describe('optimizations', () => {
    it('should not repeatedly poll status of a non-live node if no signals have changed', () => {
      const unrelated = signal(0);
      const source = signal(1);
      let computations = 0;
      const derived = computed(() => {
        computations++;
        return source() * 2;
      });

      expect(derived()).toBe(2);
      expect(computations).toBe(1);

      const sourceNode = source[SIGNAL] as ReactiveNode;
      // Forcibly increment the version of the source signal. This will cause a mismatch during
      // polling, and will force the derived signal to recompute if polled (which we should observe
      // in this test).
      sourceNode.version++;

      // Read the derived signal again. This should not recompute (even with the forced version
      // update) as no signals have been set since the last read.
      expect(derived()).toBe(2);
      expect(computations).toBe(1);

      // Set the `unrelated` signal, which now means that `derived` should poll if read again.
      // Because of the forced version, that poll will cause a recomputation which we will observe.
      unrelated.set(1);

      expect(derived()).toBe(2);
      expect(computations).toBe(2);
    });
  });

  describe('post-signal-set functions', () => {
    let prevPostSignalSetFn: ReactiveHookFn | null = null;
    let log: number;
    beforeEach(() => {
      log = 0;
      prevPostSignalSetFn = setPostSignalSetFn(() => log++);
    });

    afterEach(() => {
      setPostSignalSetFn(prevPostSignalSetFn);
    });

    it('should call the post-signal-set fn when invoking .set()', () => {
      const counter = signal(0);

      counter.set(1);
      expect(log).toBe(1);
    });

    it('should call the post-signal-set fn when invoking .update()', () => {
      const counter = signal(0);

      counter.update((c) => c + 2);
      expect(log).toBe(1);
    });

    it("should not call the post-signal-set fn when the value doesn't change", () => {
      const counter = signal(0);

      counter.set(0);
      expect(log).toBe(0);
    });

    it('should pass post-signal-set fn the node that was updated', () => {
      const counter = signal(0, {debugName: 'test-signal'});
      let node: ReactiveNode | null = null;
      setPostSignalSetFn((n: ReactiveNode) => {
        node = n;
      });

      counter.set(1);
      expect(node!.debugName).toBe('test-signal');
    });
  });

  it('should call the post-producer-created fn when signal is called', () => {
    const producerKindsCreated: string[] = [];
    const prev = setPostProducerCreatedFn((node) => producerKindsCreated.push(node.kind));
    signal(0);

    expect(producerKindsCreated).toEqual(['signal']);
    setPostProducerCreatedFn(prev);
  });

  describe('upgradeSignalToWritable', () => {
    it('should upgrade a signal to a writable signal', () => {
      const celsius = signal(-40);
      const fahrenheit = computed(() => celsius() * (9 / 5) + 32);
      upgradeSignalToWritable(fahrenheit, (valueF) => celsius.set((valueF - 32) * (5 / 9)));

      expect(celsius()).toBe(-40);
      expect(fahrenheit()).toBe(-40);

      fahrenheit.set(212);
      expect(celsius()).toBe(0);

      celsius.set(0);
      expect(fahrenheit()).toBe(32);
    });
  });
});
