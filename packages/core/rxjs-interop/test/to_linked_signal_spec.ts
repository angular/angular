/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  linkedSignal,
  WritableSignal,
  EnvironmentInjector,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {toLinkedSignal} from '../src/to_linked_signal';
import {BehaviorSubject, Subject} from 'rxjs';

describe('toLinkedSignal()', () => {
  it(
    'should reflect the last emitted value of an Observable',
    test(() => {
      const counter$ = new BehaviorSubject(0);
      const counter = toLinkedSignal(counter$);

      expect(counter()).toBe(0);
      counter$.next(1);
      expect(counter()).toBe(1);
      counter$.next(3);
      expect(counter()).toBe(3);
    }),
  );

  it(
    'should allow writing to the signal and update the value',
    test(() => {
      const counter$ = new BehaviorSubject(0);
      const counter = toLinkedSignal(counter$);

      counter.set(5);
      expect(counter()).toBe(5);
      // The BehaviorSubject should not be updated by set (one-way binding)
      expect(counter$.value).toBe(0);
    }),
  );

  it(
    'should support initialValue option',
    test(() => {
      const counter$ = new Subject<number>();
      const counter = toLinkedSignal(counter$, {initialValue: 42});
      expect(counter()).toBe(42);
      counter$.next(7);
      expect(counter()).toBe(7);
    }),
  );

  it(
    'should support null as initialValue',
    test(() => {
      const counter$ = new Subject<number>();
      const counter = toLinkedSignal(counter$, {initialValue: null});
      expect(counter()).toBeNull();
      counter$.next(2);
      expect(counter()).toBe(2);
    }),
  );

  it(
    'should return undefined if no value has been emitted and no initialValue',
    test(() => {
      const counter$ = new Subject<number>();
      const counter = toLinkedSignal(counter$);
      expect(counter()).toBeUndefined();
      counter$.next(10);
      expect(counter()).toBe(10);
    }),
  );
});

function test(fn: () => void | Promise<void>): () => Promise<void> {
  return async () => {
    const injector = Injector.create({providers: []}) as EnvironmentInjector;
    try {
      return await runInInjectionContext(injector, fn);
    } finally {
      injector.destroy();
    }
  };
}
