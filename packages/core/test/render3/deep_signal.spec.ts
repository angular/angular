/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, effect, Injector, Signal, signal} from '../../src/core';
import {TestBed} from '../../testing';
import {ReactiveNode, SIGNAL} from '@angular/core/primitives/signals';
import {deepSignal} from '../../src/render3/reactivity/deep_signal/deep_signal';
import {structuralSignal} from '../../src/render3/reactivity/deep_signal/structural_signal';

describe('deepSignal', () => {
  it('propagates an update from parent -> child correctly', () => {
    const parent = signal({name: 'John'});
    const child = deepSignal(parent, 'name');

    parent.set({name: 'Jane'});
    expect(child()).toBe('Jane');
  });

  it('propagates an update from child -> parent correctly', () => {
    const parent = signal({name: 'John'});
    const child = deepSignal(parent, 'name');

    child.set('Jane');
    expect(parent().name).toBe('Jane');
  });

  it('does not block updates to normal computed children', () => {
    const parent = signal({name: 'John'});
    const deepName = deepSignal(parent, 'name');
    const nameLog = log(computed(() => parent().name));
    expect(nameLog).toEqual(['John']);

    act(() => deepName.set('Jane'));
    expect(nameLog).toEqual(['John', 'Jane']);
  });

  it('blocks updates to siblings of a parent', () => {
    const parent = signal({first: 'John', last: 'Wick'});
    const first = deepSignal(parent, 'first', {debugName: 'first'});
    const last = deepSignal(parent, 'last', {debugName: 'last'});

    // Keep `last` live, ensuring it gets dirty notifications.
    act(() => log(last));
    expect(isDirty(last)).toBeFalse();

    // Update first via the deep signal write path.
    first.set('James');

    // `last` should not become dirty.
    expect(isDirty(last)).toBeFalse();
  });

  it('deeply blocks updates to unaffected parts of the tree', () => {
    const parent = signal({name: {first: 'John', last: 'Wick'}, status: 'Retired'});
    const name = deepSignal(parent, 'name', {debugName: 'name'});
    const first = deepSignal(name, 'first', {debugName: 'first'});
    const last = deepSignal(name, 'last', {debugName: 'last'});
    const status = deepSignal(parent, 'status', {debugName: 'status'});

    // Keep `last` and `status` live, ensuring they get dirty notifications.
    act(() => {
      log(last);
      log(status);
    });
    expect(isDirty(last)).toBeFalse();
    expect(isDirty(status)).toBeFalse();

    // Update `first` via the deep signal write path.
    first.set('James');

    // `last` and `status` should not become dirty.
    expect(isDirty(last)).toBeFalse();
    expect(isDirty(status)).toBeFalse();
  });

  it('updates siblings targeting the same property', () => {
    const parent = signal({first: 'John', last: 'Wick'});
    const first1 = deepSignal(parent, 'first', {debugName: 'first1'});
    const first2 = deepSignal(parent, 'first', {debugName: 'first2'});

    // Keep `first2` live, ensuring it gets dirty notifications.
    act(() => log(first2));
    expect(isDirty(first2)).toBeFalse();

    // Update first via the deep signal write path.
    first1.set('James');

    // `first2` should become dirty.
    expect(isDirty(first2)).toBeTrue();
    expect(first2()).toBe('James');
  });

  it('blocks updates when the property name is dynamic but stable', () => {
    const parent = signal({first: 'John', last: 'Wick', age: 52});
    const property = computed<'first'>(() => 'first');
    const dynamic = deepSignal(parent, property, {debugName: 'dynamic'});

    const age = deepSignal(parent, 'age', {debugName: 'age'});

    // Keep `dynamic` live, ensuring it gets dirty notifications.
    act(() => log(dynamic));
    expect(isDirty(dynamic)).toBeFalse();

    // Update `age` via the deep signal write path.
    age.set(53);

    expect(isDirty(dynamic)).toBeFalse();
  });

  describe('structuralSignal', () => {
    it('tracks only non-deep signal changes', () => {
      const parent = signal<{first: string; last: string; age?: number}>({
        first: 'John',
        last: 'Wick',
      });
      const first = deepSignal(parent, 'first', {debugName: 'first'});
      const structure = structuralSignal(parent);

      const shapes = log(structure);
      expect(shapes.length).toBe(1);

      // Updating `parent` through a deep signal write does not change `structure`.
      act(() => first.set('James'));
      expect(shapes.length).toBe(1);

      // Updating `parent` directly _does_ change `structure`.
      act(() => parent.update((v) => ({...v, age: 52})));
      expect(shapes.length).toBe(2);
    });

    it('notifies even if a deep signal write adds a new property', () => {
      const parent = signal<{age?: number}>({});
      const age = deepSignal(parent, 'age', {debugName: 'age'});

      const structure = structuralSignal(parent);
      const shapes = log(structure);
      expect(shapes.length).toBe(1);

      // Adding `age` is a structural change.
      act(() => age.set(52));
      expect(shapes.length).toBe(2);

      // But updating it again should not be.
      act(() => age.set(42));
      expect(shapes.length).toBe(2);
    });
  });
});

function log<T>(value: Signal<T>): readonly T[] {
  const out: T[] = [];
  effect(() => out.push(value()), {injector: TestBed.inject(Injector)});
  TestBed.tick();
  return out;
}

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}

function isDirty(signal: Signal<unknown>): boolean {
  return (signal[SIGNAL] as ReactiveNode).dirty;
}
