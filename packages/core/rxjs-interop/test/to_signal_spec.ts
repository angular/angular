/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, computed, EnvironmentInjector, Injector, runInInjectionContext, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject, Observable, Observer, ReplaySubject, Subject, Subscribable, Unsubscribable} from 'rxjs';

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



  it('should unsubscribe when an explicitly provided injector is destroyed', test(() => {
       const counter$ = new BehaviorSubject(0);
       const injector = Injector.create({providers: []}) as EnvironmentInjector;
       const counter = toSignal(counter$, {injector});

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

  it('should not require an injection context when manualCleanup is passed', () => {
    const counter$ = new BehaviorSubject(0);
    expect(() => toSignal(counter$, {manualCleanup: true})).not.toThrow();
    counter$.complete();
  });

  it('should not unsubscribe when manualCleanup is passed', () => {
    const counter$ = new BehaviorSubject(0);
    const injector = Injector.create({providers: []}) as EnvironmentInjector;
    const counter =
        runInInjectionContext(injector, () => toSignal(counter$, {manualCleanup: true}));

    injector.destroy();

    // Destroying the injector should not have unsubscribed the Observable.
    counter$.next(1);
    expect(counter()).toBe(1);

    counter$.complete();

    // The signal should have the last value observed before the observable completed.
    expect(counter()).toBe(1);
  });

  it('should not allow toSignal creation in a reactive context', () => {
    const counter$ = new BehaviorSubject(1);
    const doubleCounter = computed(() => {
      const counter = toSignal(counter$, {requireSync: true});
      return counter() * 2;
    });

    expect(() => doubleCounter())
        .toThrowError(
            /toSignal\(\) cannot be called from within a reactive context. Invoking `toSignal` causes new subscriptions every time./);
  });

  it('should throw the error back to RxJS if rejectErrors is set', () => {
    let capturedObserver: Observer<number> = null!;
    const fake$ = {
      subscribe(observer: Observer<number>): Unsubscribable {
        capturedObserver = observer;
        return {unsubscribe(): void {}};
      },
    } as Subscribable<number>;

    const s = toSignal(fake$, {initialValue: 0, rejectErrors: true, manualCleanup: true});
    expect(s()).toBe(0);
    if (capturedObserver === null) {
      return fail('Observer not captured as expected.');
    }

    capturedObserver.next(1);
    expect(s()).toBe(1);

    expect(() => capturedObserver.error('test')).toThrow('test');
    expect(s()).toBe(1);
  });

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

  describe('in a @Component', () => {
    it('should support `toSignal` as a class member initializer', () => {
      @Component({
        template: '{{counter()}}',
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TestCmp {
        // Component creation should not run inside the template effect/consumer,
        // hence using `toSignal` should be allowed/supported.
        counter$ = new Subject<number>();
        counter = toSignal(this.counter$);
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('');

      fixture.componentInstance.counter$.next(2);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('2');
    });
  });

  describe('type tests', () => {
    const src = new Subject<any>();
    it('should allow empty array initial values', test(() => {
         const res: Signal<string[]> = toSignal(src as Observable<string[]>, {initialValue: []});
         expect(res).toBeDefined();
       }));

    it('should allow literal types', test(() => {
         type Animal = 'cat'|'dog';
         const res: Signal<Animal> = toSignal(src as Observable<Animal>, {initialValue: 'cat'});
         expect(res).toBeDefined();
       }));

    it('should not allow initial values outside of the observable type', test(() => {
         type Animal = 'cat'|'dog';
         // @ts-expect-error
         const res = toSignal(src as Observable<Animal>, {initialValue: 'cow'});
         expect(res).toBeDefined();
       }));

    it('allows null as an initial value', test(() => {
         const res = toSignal(src as Observable<string>, {initialValue: null});
         const res2: Signal<string|null> = res;
         // @ts-expect-error
         const res3: Signal<string|undefined> = res;
         expect(res2).toBeDefined();
         expect(res3).toBeDefined();
       }));


    it('allows undefined as an initial value', test(() => {
         const res = toSignal(src as Observable<string>, {initialValue: undefined});
         const res2: Signal<string|undefined> = res;
         // @ts-expect-error
         const res3: Signal<string|null> = res;
         expect(res2).toBeDefined();
         expect(res3).toBeDefined();
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
