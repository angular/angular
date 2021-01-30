/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe, ɵgetDOM as getDOM} from '@angular/common';
import {EventEmitter} from '@angular/core';
import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {Subscribable, Unsubscribable} from 'rxjs';

import {SpyChangeDetectorRef} from '../spies';

{
  describe('AsyncPipe', () => {
    describe('Observable', () => {
      // only expose methods from the Subscribable interface, to ensure that
      // the implementation does not rely on other methods:
      const wrapSubscribable = <T>(input: Subscribable<T>): Subscribable<T> => ({
        subscribe(...args: any): Unsubscribable {
          const subscription = input.subscribe(...args);
          return {
            unsubscribe() {
              subscription.unsubscribe();
            }
          };
        }
      });

      let emitter: EventEmitter<any>;
      let subscribable: Subscribable<any>;
      let pipe: AsyncPipe;
      let ref: any;
      const message = {};

      beforeEach(() => {
        emitter = new EventEmitter();
        subscribable = wrapSubscribable(emitter);
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref);
      });

      describe('transform', () => {
        it('should return null when subscribing to an observable', () => {
          expect(pipe.transform(subscribable)).toBe(null);
        });

        it('should return the latest available value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(subscribable);
             emitter.emit(message);

             setTimeout(() => {
               expect(pipe.transform(subscribable)).toEqual(message);
               async.done();
             }, 0);
           }));


        it('should return same value when nothing has changed since the last call',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(subscribable);
             emitter.emit(message);

             setTimeout(() => {
               pipe.transform(subscribable);
               expect(pipe.transform(subscribable)).toBe(message);
               async.done();
             }, 0);
           }));

        it('should dispose of the existing subscription when subscribing to a new observable',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(subscribable);

             const newEmitter = new EventEmitter();
             const newSubscribable = wrapSubscribable(newEmitter);
             expect(pipe.transform(newSubscribable)).toBe(null);
             emitter.emit(message);

             // this should not affect the pipe
             setTimeout(() => {
               expect(pipe.transform(newSubscribable)).toBe(null);
               async.done();
             }, 0);
           }));

        it('should request a change detection check upon receiving a new value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(subscribable);
             emitter.emit(message);

             setTimeout(() => {
               expect(ref.spy('markForCheck')).toHaveBeenCalled();
               async.done();
             }, 10);
           }));

        it('should return value for unchanged NaN', () => {
          emitter.emit(null);
          pipe.transform(subscribable);
          emitter.next(NaN);
          const firstResult = pipe.transform(subscribable);
          const secondResult = pipe.transform(subscribable);
          expect(firstResult).toBeNaN();
          expect(secondResult).toBeNaN();
        });
      });

      describe('ngOnDestroy', () => {
        it('should do nothing when no subscription', () => {
          expect(() => pipe.ngOnDestroy()).not.toThrow();
        });

        it('should dispose of the existing subscription',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(subscribable);
             pipe.ngOnDestroy();
             emitter.emit(message);

             setTimeout(() => {
               expect(pipe.transform(subscribable)).toBe(null);
               async.done();
             }, 0);
           }));
      });
    });

    describe('Subscribable', () => {
      it('should infer the type from the subscribable', () => {
        const ref = new SpyChangeDetectorRef() as any;
        const pipe = new AsyncPipe(ref);
        const emitter = new EventEmitter<{name: 'T'}>();
        // The following line will fail to compile if the type cannot be inferred.
        const name = pipe.transform(emitter)?.name;
      });
    });

    describe('Promise', () => {
      const message = {};
      let pipe: AsyncPipe;
      let resolve: (result: any) => void;
      let reject: (error: any) => void;
      let promise: Promise<any>;
      let ref: SpyChangeDetectorRef;
      // adds longer timers for passing tests in IE
      const timer = (getDOM() && browserDetection.isIE) ? 50 : 10;

      beforeEach(() => {
        promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref as any);
      });

      describe('transform', () => {
        it('should return null when subscribing to a promise', () => {
          expect(pipe.transform(promise)).toBe(null);
        });

        it('should return the latest available value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);

             resolve(message);

             setTimeout(() => {
               expect(pipe.transform(promise)).toEqual(message);
               async.done();
             }, timer);
           }));

        it('should return value when nothing has changed since the last call',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);
             resolve(message);

             setTimeout(() => {
               pipe.transform(promise);
               expect(pipe.transform(promise)).toBe(message);
               async.done();
             }, timer);
           }));

        it('should dispose of the existing subscription when subscribing to a new promise',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);

             promise = new Promise<any>(() => {});
             expect(pipe.transform(promise)).toBe(null);

             resolve(message);

             setTimeout(() => {
               expect(pipe.transform(promise)).toBe(null);
               async.done();
             }, timer);
           }));

        it('should request a change detection check upon receiving a new value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const markForCheck = ref.spy('markForCheck');
             pipe.transform(promise);
             resolve(message);

             setTimeout(() => {
               expect(markForCheck).toHaveBeenCalled();
               async.done();
             }, timer);
           }));

        describe('ngOnDestroy', () => {
          it('should do nothing when no source', () => {
            expect(() => pipe.ngOnDestroy()).not.toThrow();
          });

          it('should dispose of the existing source',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               pipe.transform(promise);
               expect(pipe.transform(promise)).toBe(null);
               resolve(message);


               setTimeout(() => {
                 expect(pipe.transform(promise)).toEqual(message);
                 pipe.ngOnDestroy();
                 expect(pipe.transform(promise)).toBe(null);
                 async.done();
               }, timer);
             }));
        });
      });
    });

    describe('null', () => {
      it('should return null when given null', () => {
        const pipe = new AsyncPipe(null as any);
        expect(pipe.transform(null)).toEqual(null);
      });
    });

    describe('undefined', () => {
      it('should return null when given undefined', () => {
        const pipe = new AsyncPipe(null as any);
        expect(pipe.transform(undefined)).toEqual(null);
      });
    });

    describe('other types', () => {
      it('should throw when given an invalid object', () => {
        const pipe = new AsyncPipe(null as any);
        expect(() => pipe.transform('some bogus object' as any)).toThrowError();
      });
    });
  });
}
