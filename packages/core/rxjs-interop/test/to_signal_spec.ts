/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Injector, runInInjectionContext} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';

describe('toSignal()', () => {
  it('should reflect the last emitted value of an Observable', test(() => {
       const counter$ = new BehaviorSubject(0);
       const counter = toSignal(counter$);

       expect(counter()).toBe(0);
       counter$.next(1);
       expect(counter()).toBe(1);
       counter$.next(3);
       expect(counter()).toBe(3);
     }));

  it('should notify when the last emitted value of an Observable changes', test(() => {
       let seenValue: number = 0;
       const counter$ = new BehaviorSubject(1);
       const counter = toSignal(counter$);

       expect(counter()).toBe(1);

       counter$.next(2);
       expect(counter()).toBe(2);
     }));

  it('should propagate an error returned by the Observable', test(() => {
       const counter$ = new BehaviorSubject(1);
       const counter = toSignal(counter$);

       expect(counter()).toBe(1);

       counter$.error('fail');
       expect(counter).toThrow('fail');
     }));

  it('should unsubscribe when the current context is destroyed', test(() => {
       const counter$ = new BehaviorSubject(0);
       const injector = Injector.create({providers: []}) as EnvironmentInjector;
       const counter = runInInjectionContext(injector, () => toSignal(counter$));

       expect(counter()).toBe(0);
       counter$.next(1);
       expect(counter()).toBe(1);

       // Destroying the injector should unsubscribe the Observable.
       injector.destroy();

       // The signal should have the last value observed.
       expect(counter()).toBe(1);

       // And this value should no longer be updating (unsubscribed).
       counter$.next(2);
       expect(counter()).toBe(1);
     }));

  describe('with no initial value', () => {
    it('should return `undefined` if read before a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = toSignal(counter$);

         expect(counter()).toBeUndefined();
         counter$.next(1);
         expect(counter()).toBe(1);
       }));

    it('should not throw if a value is emitted before called', test(() => {
         const counter$ = new Subject<number>();
         const counter = toSignal(counter$);

         counter$.next(1);
         expect(() => counter()).not.toThrow();
       }));
  });

  describe('with requireSync', () => {
    it('should throw if created before a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         expect(() => toSignal(counter$, {requireSync: true})).toThrow();
       }));

    it('should not throw if a value emits synchronously on creation', test(() => {
         const counter$ = new ReplaySubject<number>(1);
         counter$.next(1);
         const counter = toSignal(counter$);
         expect(counter()).toBe(1);
       }));
  });

  describe('with an initial value', () => {
    it('should return the initial value if called before a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = toSignal(counter$, {initialValue: null});

         expect(counter()).toBeNull();
         counter$.next(1);
         expect(counter()).toBe(1);
       }));

    it('should not return the initial value if called after a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = toSignal(counter$, {initialValue: null});

         counter$.next(1);
         expect(counter()).not.toBeNull();
       }));
  });
});

function test(fn: () => void|Promise<void>): () => Promise<void> {
  return async () => {
    const injector = Injector.create({
      providers: [
        {provide: EnvironmentInjector, useFactory: () => injector},
      ]
    }) as EnvironmentInjector;
    try {
      return await runInInjectionContext(injector, fn);
    } finally {
      injector.destroy();
    }
  };
}
