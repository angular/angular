/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {APP_INITIALIZER, ApplicationInitStatus} from '@angular/core/src/application_init';
import {Observable, Subscriber} from 'rxjs';

import {inject, TestBed, waitForAsync} from '../testing';

{
  describe('ApplicationInitStatus', () => {
    describe('no initializers', () => {
      it('should return true for `done`',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           (status as any).runInitializers();
           expect(status.done).toBe(true);
         })));

      it('should return a promise that resolves immediately for `donePromise`',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           (status as any).runInitializers();
           status.donePromise.then(() => {
             expect(status.done).toBe(true);
           });
         })));
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
          providers: [
            {provide: APP_INITIALIZER, multi: true, useValue: () => promise},
          ]
        });
      });

      it('should update the status once all async promise initializers are done',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           setTimeout(() => {
             initFnInvoked = true;
             resolve(null);
           });

           expect(status.done).toBe(false);
           status.donePromise.then(() => {
             expect(status.done).toBe(true);
             expect(initFnInvoked).toBe(true);
           });
         })));

      it('should handle a case when promise is rejected',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           setTimeout(() => {
             initFnInvoked = true;
             reject();
           });

           expect(status.done).toBe(false);
           status.donePromise
               .then(
                   () => fail('`donePromise.then` should not be invoked when promise is rejected'))
               .catch(() => {
                 expect(status.done).toBe(false);
                 expect(initFnInvoked).toBe(true);
               });
         })));
    });

    describe('with app initializers represented using observables', () => {
      let subscriber: Subscriber<any>;
      let observable: Observable<any>;
      let initFnInvoked = false;
      beforeEach(() => {
        observable = new Observable((res) => {
          subscriber = res;
        });
        TestBed.configureTestingModule({
          providers: [
            {provide: APP_INITIALIZER, multi: true, useValue: () => observable},
          ]
        });
      });

      it('should update the status once all async observable initializers are completed',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           setTimeout(() => {
             initFnInvoked = true;
             subscriber.complete();
           });

           expect(status.done).toBe(false);
           status.donePromise.then(() => {
             expect(status.done).toBe(true);
             expect(initFnInvoked).toBe(true);
           });
         })));

      it('should update the status once all async observable initializers nexted and completed',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           subscriber.next('one');
           subscriber.next('two');

           setTimeout(() => {
             initFnInvoked = true;
             subscriber.complete();
           });

           expect(status.done).toBe(false);
           status.donePromise.then(() => {
             expect(status.done).toBe(true);
             expect(initFnInvoked).toBe(true);
           });
         })));

      it('should update the status if all async observable initializers are completed before runInitializers',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           subscriber.complete();
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           expect(status.done).toBe(false);

           status.donePromise.then(() => {
             expect(status.done).toBe(true);
           });
         })));

      it('should handle a case when observable emits an error',
         waitForAsync(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           // Accessing internal `runInitializers` function of the `ApplicationInitStatus` class
           // instance for testing purposes to invoke initializer functions.
           (status as any).runInitializers();

           setTimeout(() => {
             initFnInvoked = true;
             subscriber.error();
           });

           expect(status.done).toBe(false);
           status.donePromise
               .then(
                   () => fail(
                       '`donePromise.then` should not be invoked when observable emits an error'))
               .catch(() => {
                 expect(status.done).toBe(false);
                 expect(initFnInvoked).toBe(true);
               });
         })));
    });
  });
}
