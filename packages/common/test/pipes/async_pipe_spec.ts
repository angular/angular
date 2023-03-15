/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {ChangeDetectorRef, Component, EventEmitter} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {of, Subscribable, Unsubscribable} from 'rxjs';

{
  describe('AsyncPipe', () => {
    let pipe: AsyncPipe;
    let ref: ChangeDetectorRef&jasmine.SpyObj<ChangeDetectorRef>;

    function getChangeDetectorRefSpy() {
      return jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
    }

    beforeEach(() => {
      ref = getChangeDetectorRefSpy();
      pipe = new AsyncPipe(ref);
    });

    afterEach(() => {
      pipe.ngOnDestroy();  // Close all subscriptions.
    });

    describe('Observable', () => {
      // only expose methods from the Subscribable interface, to ensure that
      // the implementation does not rely on other methods:
      const wrapSubscribable = <T>(input: Subscribable<T>): Subscribable<T> => ({
        subscribe(...args: any): Unsubscribable {
          const subscription = input.subscribe.apply(input, args);
          return {
            unsubscribe() {
              subscription.unsubscribe();
            }
          };
        }
      });

      let emitter: EventEmitter<any>;
      let subscribable: Subscribable<any>;
      const message = {};

      beforeEach(() => {
        emitter = new EventEmitter();
        subscribable = wrapSubscribable(emitter);
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
        const emitter = new EventEmitter<{name: 'T'}>();
        // The following line will fail to compile if the type cannot be inferred.
        const name = pipe.transform(emitter)?.name;
      });
    });

    describe('Promise', () => {
      const message = {};
      let resolve: (result: any) => void;
      let reject: (error: any) => void;
      let promise: Promise<any>;
      // adds longer timers for passing tests in IE
      const timer = 10;

      beforeEach(() => {
        promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
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

          it('should ignore signals after the pipe has been destroyed', done => {
            pipe.transform(promise);
            expect(pipe.transform(promise)).toBe(null);
            pipe.ngOnDestroy();
            resolve(message);

            setTimeout(() => {
              expect(pipe.transform(promise)).toBe(null);
              done();
            }, timer);
          });
        });
      });
    });

    describe('null', () => {
      it('should return null when given null', () => {
        expect(pipe.transform(null)).toEqual(null);
      });
    });

    describe('undefined', () => {
      it('should return null when given undefined', () => {
        expect(pipe.transform(undefined)).toEqual(null);
      });
    });

    describe('other types', () => {
      it('should throw when given an invalid object', () => {
        expect(() => pipe.transform('some bogus object' as any)).toThrowError();
      });
    });

    it('should be available as a standalone pipe', () => {
      @Component({
        selector: 'test-component',
        imports: [AsyncPipe],
        template: '{{ value | async }}',
        standalone: true,
      })
      class TestComponent {
        value = of('foo');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('foo');
    });
  });
}
