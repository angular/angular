/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AsyncPipe} from '../../index';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ErrorHandler,
  EventEmitter,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable, of, Subscribable, Unsubscribable} from 'rxjs';

describe('AsyncPipe', () => {
  let pipe: AsyncPipe;
  let ref: ChangeDetectorRef & jasmine.SpyObj<ChangeDetectorRef>;

  function getChangeDetectorRefSpy() {
    return jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
  }

  beforeEach(() => {
    ref = getChangeDetectorRefSpy();
    pipe = TestBed.runInInjectionContext(() => new AsyncPipe(ref));
  });

  afterEach(() => {
    pipe.ngOnDestroy(); // Close all subscriptions.
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
          },
        };
      },
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

      it('should return the latest available value', (done) => {
        pipe.transform(subscribable);
        emitter.emit(message);

        setTimeout(() => {
          expect(pipe.transform(subscribable)).toEqual(message);
          done();
        }, 0);
      });

      it('should return same value when nothing has changed since the last call', (done) => {
        pipe.transform(subscribable);
        emitter.emit(message);

        setTimeout(() => {
          pipe.transform(subscribable);
          expect(pipe.transform(subscribable)).toBe(message);
          done();
        }, 0);
      });

      it('should dispose of the existing subscription when subscribing to a new observable', (done) => {
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

      it('should request a change detection check upon receiving a new value', (done) => {
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

      it('should not track signal reads in subscriptions', () => {
        const trigger = signal(false);

        const obs = new Observable(() => {
          // Whenever `obs` is subscribed, synchronously read `trigger`.
          trigger();
        });

        let trackCount = 0;
        const tracker = computed(() => {
          // Subscribe to `obs` within this `computed`. If the subscription side effect runs
          // within the computed, then changes to `trigger` will invalidate this computed.
          pipe.transform(obs);

          // The computed returns how many times it's run.
          return ++trackCount;
        });

        expect(tracker()).toBe(1);
        trigger.set(true);
        expect(tracker()).toBe(1);
      });
    });

    describe('ngOnDestroy', () => {
      it('should do nothing when no subscription', () => {
        expect(() => pipe.ngOnDestroy()).not.toThrow();
      });

      it('should dispose of the existing subscription', (done) => {
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

      it('should return the latest available value', async () => {
        pipe.transform(promise);

        resolve(message);
        await promise;

        expect(pipe.transform(promise)).toEqual(message);
      });

      it('should return value when nothing has changed since the last call', async () => {
        pipe.transform(promise);
        resolve(message);
        await promise;

        pipe.transform(promise);
        expect(pipe.transform(promise)).toBe(message);
      });

      it('should report rejections to error handler', async () => {
        const spy = spyOn(TestBed.inject(ErrorHandler), 'handleError');
        pipe.transform(promise);
        reject(message);
        try {
          await promise;
        } catch {}
        expect(spy).toHaveBeenCalledWith(message);
      });

      it('should dispose of the existing subscription when subscribing to a new promise', async () => {
        pipe.transform(promise);

        const newPromise = new Promise<any>(() => {});
        expect(pipe.transform(newPromise)).toBe(null);

        resolve(message);
        await promise;

        expect(pipe.transform(promise)).toBe(null);
      });

      it('should request a change detection check upon receiving a new value', async () => {
        pipe.transform(promise);
        resolve(message);
        await promise;

        expect(ref.markForCheck).toHaveBeenCalled();
      });

      describe('ngOnDestroy', () => {
        it('should do nothing when no source', () => {
          expect(() => pipe.ngOnDestroy()).not.toThrow();
        });

        it('should dispose of the existing source', async () => {
          pipe.transform(promise);
          expect(pipe.transform(promise)).toBe(null);
          resolve(message);
          await promise;

          expect(pipe.transform(promise)).toEqual(message);
          pipe.ngOnDestroy();
          expect(pipe.transform(promise)).toBe(null);
        });

        it('should ignore signals after the pipe has been destroyed', async () => {
          pipe.transform(promise);
          expect(pipe.transform(promise)).toBe(null);
          pipe.ngOnDestroy();
          resolve(message);
          await promise;

          expect(pipe.transform(promise)).toBe(null);
        });
      });
    });
  });

  describe('PromiseLike', () => {
    it('should infer the type from the subscribable', () => {
      const promiseLike = {then: (resolve) => resolve!({name: 'T'})} as PromiseLike<{name: 'T'}>;
      // The following line will fail to compile if the type cannot be inferred.
      const name = pipe.transform(promiseLike)?.name;
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
