/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, setPostSignalSetFn, signal} from '@angular/core/src/signals';

describe('signals', () => {
  it('should be a getter which reflect the set value', () => {
    const state = signal(false);
    expect(state()).toBeFalse();
    state.set(true);
    expect(state()).toBeTrue();
  });

  it('should accept update function to set new value based on the previous one', () => {
    const counter = signal(0);
    expect(counter()).toEqual(0);

    counter.update(c => c + 1);
    expect(counter()).toEqual(1);
  });

  it('should have mutate function for mutable, out of bound updates', () => {
    const state = signal<string[]>(['a']);
    const derived = computed(() => state().join(':'));

    expect(derived()).toEqual('a');

    state.mutate((s) => {
      s.push('b');
    });
    expect(derived()).toEqual('a:b');
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

  it('should consider objects as non-equal with the default equality function', () => {
    let stateValue: unknown = {};
    const state = signal(stateValue);
    let computeCount = 0;
    const derived = computed(() => `${typeof state()}:${++computeCount}`);
    expect(derived()).toEqual('object:1');

    // reset signal value to the same object instance, expect change notification
    state.set(stateValue);
    expect(derived()).toEqual('object:2');

    // reset signal value to a different object instance, expect change notification
    stateValue = {};
    state.set(stateValue);
    expect(derived()).toEqual('object:3');

    // reset signal value to a different object type, expect change notification
    stateValue = [];
    state.set(stateValue);
    expect(derived()).toEqual('object:4');

    // reset signal value to the same array instance, expect change notification
    state.set(stateValue);
    expect(derived()).toEqual('object:5');
  });

  it('should allow converting writable signals to their readonly counterpart', () => {
    const counter = signal(0);
    const readOnlyCounter = counter.asReadonly();

    // @ts-expect-error
    expect(readOnlyCounter.set).toBeUndefined();
    // @ts-expect-error
    expect(readOnlyCounter.update).toBeUndefined();
    // @ts-expect-error
    expect(readOnlyCounter.mutate).toBeUndefined();

    const double = computed(() => readOnlyCounter() * 2);
    expect(double()).toBe(0);

    counter.set(2);
    expect(double()).toBe(4);
  });

  describe('post-signal-set functions', () => {
    let prevPostSignalSetFn: (() => void)|null = null;
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

      counter.update(c => c + 2);
      expect(log).toBe(1);
    });

    it('should call the post-signal-set fn when invoking .mutate()', () => {
      const counter = signal(0);

      counter.mutate(() => {});
      expect(log).toBe(1);
    });

    it('should not call the post-signal-set fn when the value doesn\'t change', () => {
      const counter = signal(0);

      counter.set(0);
      expect(log).toBe(0);
    });
  });
});
