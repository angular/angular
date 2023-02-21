/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal} from '@angular/core';
import {fromSignal} from '@angular/core/rxjs-interop';
import {take, toArray} from 'rxjs/operators';

import {test} from './util';

describe('fromSignal()', () => {
  it('should produce an observable that tracks a signal', test(async () => {
       const counter = signal(0);
       const counterValues = fromSignal(counter).pipe(take(3), toArray()).toPromise();

       // Initial effect execution, emits 0.
       await Promise.resolve();

       counter.set(1);
       // Emits 1.
       await Promise.resolve();

       counter.set(2);
       counter.set(3);
       // Emits 3 (ignores 2 as it was batched by the effect).
       await Promise.resolve();

       expect(await counterValues).toEqual([0, 1, 3]);
     }));

  it('should propagate errors from the signal', test(async () => {
       const source = signal(1);
       const counter = computed(() => {
         const value = source();
         if (value === 2) {
           throw 'fail';
         } else {
           return value;
         }
       });

       const counter$ = fromSignal(counter);

       let currentValue: number = 0;
       let currentError: any = null;

       const sub = counter$.subscribe({
         next: value => currentValue = value,
         error: err => currentError = err,
       });

       await Promise.resolve();
       expect(currentValue).toBe(1);

       source.set(2);
       await Promise.resolve();
       expect(currentError).toBe('fail');

       sub.unsubscribe();
     }));

  it('should not monitor the signal if the Observable is never subscribed', test(async () => {
       let counterRead = false;
       const counter = computed(() => {
         counterRead = true;
         return 0;
       });

       fromSignal(counter);

       // Simply creating the Observable shouldn't trigger a signal read.
       expect(counterRead).toBeFalse();

       // Nor should the signal be read after effects have run.
       await Promise.resolve();
       expect(counterRead).toBeFalse();
     }));

  it('should not monitor the signal if the Observable has no active subscribers', test(async () => {
       const counter = signal(0);

       // Tracks how many reads of `counter()` there have been.
       let readCount = 0;
       const trackedCounter = computed(() => {
         readCount++;
         return counter();
       });

       const counter$ = fromSignal(trackedCounter);

       const sub = counter$.subscribe();
       expect(readCount).toBe(0);

       await Promise.resolve();
       expect(readCount).toBe(1);

       // Sanity check of the read tracker - updating the counter should cause it to be read again
       // by the active effect.
       counter.set(1);
       await Promise.resolve();
       expect(readCount).toBe(2);

       // Tear down the only subscription and hence the effect that's monitoring the signal.
       sub.unsubscribe();

       // Now, setting the signal shouldn't trigger any additional reads, as the Observable is no
       // longer interested in its value.

       counter.set(2);
       await Promise.resolve();

       expect(readCount).toBe(2);
     }));
});
