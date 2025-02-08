/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  APP_INITIALIZER,
  ApplicationInitStatus,
  Component,
  inject,
  InjectionToken,
  provideAppInitializer,
} from '@angular/core';
import {EMPTY, Observable, Subscriber} from 'rxjs';

import {TestBed} from '../testing';

describe('ApplicationInitStatus', () => {
  let status: ApplicationInitStatus;
  const runInitializers = () =>
    // Cast to `any` to access an internal function for testing purposes.
    (status as any).runInitializers();

  describe('no initializers', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({providers: [{provide: APP_INITIALIZER, useValue: []}]});
      status = TestBed.inject(ApplicationInitStatus);
    });

    it('should return true for `done`', () => {
      runInitializers();
      expect(status.done).toBe(true);
    });

    it('should return a promise that resolves immediately for `donePromise`', async () => {
      runInitializers();
      await status.donePromise;
      expect(status.done).toBe(true);
    });
  });

  describe('with async promise initializers', () => {
    let resolve: (result: any) => void;
    let reject: (reason?: any) => void;
    let promise: Promise<any>;
    let initFnInvoked = false;

    beforeEach(() => {
      promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      TestBed.configureTestingModule({
        providers: [{provide: APP_INITIALIZER, useValue: [() => promise]}],
      });
      status = TestBed.inject(ApplicationInitStatus);
    });

    it('should update the status once all async promise initializers are done', async () => {
      runInitializers();

      setTimeout(() => {
        initFnInvoked = true;
        resolve(null);
      });

      expect(status.done).toBe(false);
      await status.donePromise;
      expect(status.done).toBe(true);
      expect(initFnInvoked).toBe(true);
    });

    it('should handle a case when promise is rejected', async () => {
      runInitializers();

      setTimeout(() => {
        initFnInvoked = true;
        reject();
      });

      expect(status.done).toBe(false);
      try {
        await status.donePromise;
        fail('donePromise should have been rejected when promise is rejected');
      } catch {
        expect(status.done).toBe(false);
        expect(initFnInvoked).toBe(true);
      }
    });
  });

  describe('with app initializers represented using observables', () => {
    let subscriber: Subscriber<any>;
    let initFnInvoked = false;
    beforeEach(() => {
      const observable = new Observable((res) => {
        subscriber = res;
      });

      TestBed.configureTestingModule({
        providers: [{provide: APP_INITIALIZER, useValue: [() => observable]}],
      });
      status = TestBed.inject(ApplicationInitStatus);
    });

    it('should update the status once all async observable initializers are completed', async () => {
      runInitializers();

      setTimeout(() => {
        initFnInvoked = true;
        subscriber.complete();
      });

      expect(status.done).toBe(false);
      await status.donePromise;
      expect(status.done).toBe(true);
      expect(initFnInvoked).toBe(true);
    });

    it('should update the status once all async observable initializers emitted and completed', async () => {
      runInitializers();

      subscriber.next('one');
      subscriber.next('two');

      setTimeout(() => {
        initFnInvoked = true;
        subscriber.complete();
      });

      await status.donePromise;
      expect(status.done).toBe(true);
      expect(initFnInvoked).toBe(true);
    });

    it('should update the status if all async observable initializers are completed synchronously', async () => {
      // Create a status instance using an initializer that returns the `EMPTY` Observable
      // which completes synchronously upon subscription.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{provide: APP_INITIALIZER, useValue: [() => EMPTY]}],
      });
      status = TestBed.inject(ApplicationInitStatus);

      runInitializers();

      // Although the Observable completes synchronously, we still queue a promise for
      // simplicity. This means that the `done` flag will not be `true` immediately, even
      // though there was not actually any asynchronous activity.
      expect(status.done).toBe(false);

      await status.donePromise;
      expect(status.done).toBe(true);
    });

    it('should handle a case when observable emits an error', async () => {
      runInitializers();

      setTimeout(() => {
        initFnInvoked = true;
        subscriber.error();
      });

      expect(status.done).toBe(false);

      try {
        await status.donePromise;
        fail('donePromise should have been rejected when observable emits an error');
      } catch {
        expect(status.done).toBe(false);
        expect(initFnInvoked).toBe(true);
      }
    });
  });

  describe('wrong initializers', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{provide: APP_INITIALIZER, useValue: 'notAnArray'}],
      });
    });

    it('should throw', () => {
      expect(() => TestBed.inject(ApplicationInitStatus)).toThrowError(
        'NG0209: Unexpected type of the `APP_INITIALIZER` token value ' +
          `(expected an array, but got string). ` +
          'Please check that the `APP_INITIALIZER` token is configured as a ' +
          '`multi: true` provider. Find more at https://angular.dev/errors/NG0209',
      );
    });
  });

  describe('provideAppInitializer', () => {
    it('should call the provided function when app is initialized', async () => {
      let isInitialized = false;
      TestBed.configureTestingModule({
        providers: [
          provideAppInitializer(() => {
            isInitialized = true;
          }),
        ],
      });

      expect(isInitialized).toBeFalse();

      await initApp();

      expect(isInitialized).toBeTrue();
    });

    it('should be able to inject dependencies', async () => {
      const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN', {
        providedIn: 'root',
        factory: () => 'test',
      });
      let injectedValue!: string;

      TestBed.configureTestingModule({
        providers: [
          provideAppInitializer(() => {
            injectedValue = inject(TEST_TOKEN);
          }),
        ],
      });

      await initApp();

      expect(injectedValue).toBe('test');
    });

    it('should handle async initializer', async () => {
      let isInitialized = false;
      TestBed.configureTestingModule({
        providers: [
          provideAppInitializer(async () => {
            await new Promise((resolve) => setTimeout(resolve));
            isInitialized = true;
          }),
        ],
      });

      await initApp();

      expect(isInitialized).toBeTrue();
    });
  });
});

async function initApp() {
  return await TestBed.inject(ApplicationInitStatus).donePromise;
}

/**
 * Typing tests.
 */

@Component({
  template: '',
  // @ts-expect-error: `provideAppInitializer()` should not work with Component.providers, as it
  // wouldn't be executed anyway.
  providers: [provideAppInitializer(() => {})],
})
class Test {}
