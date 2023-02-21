/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Injector, runInInjectionContext} from '@angular/core';
import {fromObservable} from '@angular/core/rxjs-interop';
import {BehaviorSubject, Subject} from 'rxjs';

import {test} from './util';

describe('fromObservable()', () => {
  it('should reflect the last emitted value of an Observable', test(() => {
       const counter$ = new BehaviorSubject(0);
       const counter = fromObservable(counter$);

       expect(counter()).toBe(0);
       counter$.next(1);
       expect(counter()).toBe(1);
       counter$.next(3);
       expect(counter()).toBe(3);
     }));

  it('should notify when the last emitted value of an Observable changes', test(() => {
       let seenValue: number = 0;
       const counter$ = new BehaviorSubject(1);
       const counter = fromObservable(counter$);

       expect(counter()).toBe(1);

       counter$.next(2);
       expect(counter()).toBe(2);
     }));

  it('should propagate an error returned by the Observable', test(() => {
       const counter$ = new BehaviorSubject(1);
       const counter = fromObservable(counter$);

       expect(counter()).toBe(1);

       counter$.error('fail');
       expect(counter).toThrow('fail');
     }));

  it('should unsubscribe when the current context is destroyed', test(() => {
       const counter$ = new BehaviorSubject(0);
       const injector = Injector.create({providers: []}) as EnvironmentInjector;
       const counter = runInInjectionContext(injector, () => fromObservable(counter$));

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
    it('should throw if called before a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = fromObservable(counter$);

         expect(() => counter()).toThrow();
         counter$.next(1);
         expect(counter()).toBe(1);
       }));

    it('should not throw if a value is emitted before called', test(() => {
         const counter$ = new Subject<number>();
         const counter = fromObservable(counter$);

         counter$.next(1);
         expect(() => counter()).not.toThrow();
       }));
  });

  describe('with an initial value', () => {
    it('should return the initial value if called before a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = fromObservable(counter$, null);

         expect(counter()).toBeNull();
         counter$.next(1);
         expect(counter()).toBe(1);
       }));

    it('should not return the initial value if called after a value is emitted', test(() => {
         const counter$ = new Subject<number>();
         const counter = fromObservable(counter$, null);

         counter$.next(1);
         expect(counter()).not.toBeNull();
       }));
  });
});
