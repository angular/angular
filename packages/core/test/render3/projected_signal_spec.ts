/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, effect, Injector, Signal, signal} from '../../src/core';
import {TestBed} from '../../testing';
import {ReactiveNode, SIGNAL} from '@angular/core/primitives/signals';
import {projectedSignal} from '../../src/render3/reactivity/projected_signal/projected_signal';
import {structuralSignal} from '../../src/render3/reactivity/projected_signal/structural_signal';

describe('projectedSignal', () => {
  it('propagates an update from parent -> child correctly', () => {
    const parent = signal({name: 'John'});
    const child = projectedSignal(parent, 'name');

    parent.set({name: 'Jane'});
    expect(child()).toBe('Jane');
  });

  it('propagates an update from child -> parent correctly', () => {
    const parent = signal({name: 'John'});
    const child = projectedSignal(parent, 'name');

    child.set('Jane');
    expect(parent().name).toBe('Jane');
  });

  it('does not block updates to normal computed children', () => {
    const parent = signal({name: 'John'});
    const nestedName = projectedSignal(parent, 'name');
    const nameLog = log(computed(() => parent().name));
    expect(nameLog).toEqual(['John']);

    act(() => nestedName.set('Jane'));
    expect(nameLog).toEqual(['John', 'Jane']);
  });

  it('blocks updates to siblings of a parent', () => {
    const parent = signal({first: 'John', last: 'Wick'});
    const first = projectedSignal(parent, 'first', {debugName: 'first'});
    const last = projectedSignal(parent, 'last', {debugName: 'last'});

    // Keep `last` live, ensuring it gets dirty notifications.
    act(() => log(last));
    expect(isDirty(last)).toBeFalse();

    // Update first via the nested signal write path.
    first.set('James');

    // `last` should not become dirty.
    expect(isDirty(last)).toBeFalse();
  });

  it('deeply blocks updates to unaffected parts of the tree', () => {
    const parent = signal({name: {first: 'John', last: 'Wick'}, status: 'Retired'});
    const name = projectedSignal(parent, 'name', {debugName: 'name'});
    const first = projectedSignal(name, 'first', {debugName: 'first'});
    const last = projectedSignal(name, 'last', {debugName: 'last'});
    const status = projectedSignal(parent, 'status', {debugName: 'status'});

    // Keep `last` and `status` live, ensuring they get dirty notifications.
    act(() => {
      log(last);
      log(status);
    });
    expect(isDirty(last)).toBeFalse();
    expect(isDirty(status)).toBeFalse();

    // Update `first` via the nested signal write path.
    first.set('James');

    // `last` and `status` should not become dirty.
    expect(isDirty(last)).toBeFalse();
    expect(isDirty(status)).toBeFalse();
  });

  it('updates siblings targeting the same property', () => {
    const parent = signal({first: 'John', last: 'Wick'});
    const first1 = projectedSignal(parent, 'first', {debugName: 'first1'});
    const first2 = projectedSignal(parent, 'first', {debugName: 'first2'});

    // Keep `first2` live, ensuring it gets dirty notifications.
    act(() => log(first2));
    expect(isDirty(first2)).toBeFalse();

    // Update first via the nested signal write path.
    first1.set('James');

    // `first2` should become dirty.
    expect(isDirty(first2)).toBeTrue();
    expect(first2()).toBe('James');
  });

  it('blocks updates when the property name is dynamic but stable', () => {
    const parent = signal({first: 'John', last: 'Wick', age: 52});
    const property = computed<'first'>(() => 'first');
    const dynamic = projectedSignal(parent, property, {debugName: 'dynamic'});

    const age = projectedSignal(parent, 'age', {debugName: 'age'});

    // Keep `dynamic` live, ensuring it gets dirty notifications.
    act(() => log(dynamic));
    expect(isDirty(dynamic)).toBeFalse();

    // Update `age` via the nested signal write path.
    age.set(53);

    expect(isDirty(dynamic)).toBeFalse();
  });

  describe('structuralSignal', () => {
    it('tracks only non-projected signal changes', () => {
      const parent = signal<{first: string; last: string; age?: number}>({
        first: 'John',
        last: 'Wick',
      });
      const first = projectedSignal(parent, 'first', {debugName: 'first'});
      const structure = structuralSignal(parent);

      const shapes = log(structure);
      expect(shapes.length).toBe(1);

      // Updating `parent` through a nested signal write does not change `structure`.
      act(() => first.set('James'));
      expect(shapes.length).toBe(1);

      // Updating `parent` directly _does_ change `structure`.
      act(() => parent.update((v) => ({...v, age: 52})));
      expect(shapes.length).toBe(2);
    });

    it('notifies even if a nested signal write adds a new property', () => {
      const parent = signal<{age?: number}>({});
      const age = projectedSignal(parent, 'age', {debugName: 'age'});

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
