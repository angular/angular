/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe, ɵgetDOM as getDOM} from '@angular/common';
import {ChangeDetectorRef, EventEmitter} from '@angular/core';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {Subscribable, Unsubscribable} from 'rxjs';

{
  describe('AsyncPipe', () => {
    function getChangeDetectorRefSpy() {
      return jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
    }

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
      let ref: ChangeDetectorRef&jasmine.SpyObj<ChangeDetectorRef>;
      const message = {};

      beforeEach(() => {
        emitter = new EventEmitter();
        subscribable = wrapSubscribable(emitter);
        ref = getChangeDetectorRefSpy();
        pipe = new AsyncPipe(ref);
      });

      describe('transform', () => {
        it('should return null when subscribing to an observable', () => {
          expect(pipe.transform(subscribable)).toBe(null);
        });

        it('should return the latest available value', done => {
          pipe.transform(subscribable);
          emitter.emit(message);

          setTimeout(() => {
            expect(pipe.transform(subscribable)).toEqual(message);
            done();
          }, 0);
        });


        it('should return same value when nothing has changed since the last call', done => {
          pipe.transform(subscribable);
          emitter.emit(message);

          setTimeout(() => {
            pipe.transform(subscribable);
            expect(pipe.transform(subscribable)).toBe(message);
            done();
          }, 0);
        });

        it('should dispose of the existing subscription when subscribing to a new observable',
           done => {
             pipe.transform(subscribable);

             const newEmitter = new EventEmitter();
             const newSubscribable = wrapSubscribable(newEmitter);
             expect(pipe.transform(newSubscribable)).toBe(null);
             emitter.emit(message);

             // this should not affect the pipe
             setTimeout(() => {
               expect(pipe.transform(newSubscribable)).toBe(null);
               done();
             }, 0);
           });

        it('should request a change detection check upon receiving a new value', done => {
          pipe.transform(subscribable);
          emitter.emit(message);

          setTimeout(() => {
            expect(ref.markForCheck).toHaveBeenCalled();
            done();
          }, 10);
        });

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

        it('should dispose of the existing subscription', done => {
          pipe.transform(subscribable);
          pipe.ngOnDestroy();
          emitter.emit(message);

          setTimeout(() => {
            expect(pipe.transform(subscribable)).toBe(null);
            done();
          }, 0);
        });
      });
    });

    describe('Subscribable', () => {
      it('should infer the type from the subscribable', () => {
        const ref = getChangeDetectorRefSpy();
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
      let ref: any;
      // adds longer timers for passing tests in IE
      const timer = (getDOM() && browserDetection.isIE) ? 50 : 10;

      beforeEach(() => {
        promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        ref = getChangeDetectorRefSpy();
        pipe = new AsyncPipe(ref);
      });

      describe('transform', () => {
        it('should return null when subscribing to a promise', () => {
          expect(pipe.transform(promise)).toBe(null);
        });

        it('should return the latest available value', done => {
          pipe.transform(promise);

          resolve(message);

          setTimeout(() => {
            expect(pipe.transform(promise)).toEqual(message);
            done();
          }, timer);
        });

        it('should return value when nothing has changed since the last call', done => {
          pipe.transform(promise);
          resolve(message);

          setTimeout(() => {
            pipe.transform(promise);
            expect(pipe.transform(promise)).toBe(message);
            done();
          }, timer);
        });

        it('should dispose of the existing subscription when subscribing to a new promise',
           done => {
             pipe.transform(promise);

             promise = new Promise<any>(() => {});
             expect(pipe.transform(promise)).toBe(null);

             resolve(message);

             setTimeout(() => {
               expect(pipe.transform(promise)).toBe(null);
               done();
             }, timer);
           });

        it('should request a change detection check upon receiving a new value', done => {
          pipe.transform(promise);
          resolve(message);

          setTimeout(() => {
            expect(ref.markForCheck).toHaveBeenCalled();
            done();
          }, timer);
        });

        describe('ngOnDestroy', () => {
          it('should do nothing when no source', () => {
            expect(() => pipe.ngOnDestroy()).not.toThrow();
          });

          it('should dispose of the existing source', done => {
            pipe.transform(promise);
            expect(pipe.transform(promise)).toBe(null);
            resolve(message);


            setTimeout(() => {
              expect(pipe.transform(promise)).toEqual(message);
              pipe.ngOnDestroy();
              expect(pipe.transform(promise)).toBe(null);
              done();
            }, timer);
          });
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
