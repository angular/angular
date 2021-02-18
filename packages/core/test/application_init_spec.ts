/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ApplicationInitStatus} from '@angular/core/src/application_init';
import {Observable, Subscriber} from 'rxjs';

import {waitForAsync} from '../testing';

describe('ApplicationInitStatus', () => {
  let status: ApplicationInitStatus;
  const runInitializers = () =>
      // Cast to `any` to access an internal function for testing purposes.
      (status as any).runInitializers();

  describe('no initializers', () => {
    beforeEach(() => {
      status = new ApplicationInitStatus([]);
    });

    it('should return true for `done`', () => {
      runInitializers();
      expect(status.done).toBe(true);
    });

    it('should return a promise that resolves immediately for `donePromise`', () => {
      runInitializers();
      status.donePromise.then(() => {
        expect(status.done).toBe(true);
      });
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
      status = new ApplicationInitStatus([() => promise]);
    });

    it('should update the status once all async promise initializers are done', waitForAsync(() => {
         runInitializers();

         setTimeout(() => {
           initFnInvoked = true;
           resolve(null);
         });

         expect(status.done).toBe(false);
         status.donePromise.then(() => {
           expect(status.done).toBe(true);
           expect(initFnInvoked).toBe(true);
         });
       }));

    it('should handle a case when promise is rejected', waitForAsync(() => {
         runInitializers();

         setTimeout(() => {
           initFnInvoked = true;
           reject();
         });

         expect(status.done).toBe(false);
         status.donePromise
             .then(() => fail('`donePromise.then` should not be invoked when promise is rejected'))
             .catch(() => {
               expect(status.done).toBe(false);
               expect(initFnInvoked).toBe(true);
             });
       }));
  });

  describe('with app initializers represented using observables', () => {
    let subscriber: Subscriber<any>;
    let observable: Observable<any>;
    let initFnInvoked = false;
    beforeEach(() => {
      observable = new Observable((res) => {
        subscriber = res;
      });
      status = new ApplicationInitStatus([() => observable]);
    });

    it('should update the status once all async observable initializers are completed',
       waitForAsync(() => {
         runInitializers();

         setTimeout(() => {
           initFnInvoked = true;
           subscriber.complete();
         });

         expect(status.done).toBe(false);
         status.donePromise.then(() => {
           expect(status.done).toBe(true);
           expect(initFnInvoked).toBe(true);
         });
       }));

    it('should update the status once all async observable initializers emitted and completed',
       waitForAsync(() => {
         runInitializers();

         setTimeout(() => {
           initFnInvoked = true;
           subscriber.next('one');
           subscriber.next('two');
           subscriber.complete();
         });

         expect(status.done).toBe(false);
         status.donePromise.then(() => {
           expect(status.done).toBe(true);
           expect(initFnInvoked).toBe(true);
         });
       }));

    it('should update the status if all async observable initializers are completed before runInitializers',
       waitForAsync(() => {
         // Call subscribe to initialize `subscriber`.
         observable.subscribe(() => {});

         subscriber.complete();

         runInitializers();

         expect(status.done).toBe(false);

         status.donePromise.then(() => {
           expect(status.done).toBe(true);
         });
       }));

    it('should handle a case when observable emits an error', waitForAsync(() => {
         runInitializers();

         setTimeout(() => {
           initFnInvoked = true;
           subscriber.error();
         });

         expect(status.done).toBe(false);
         status.donePromise
             .then(() => {
               fail('`donePromise.then` should not be invoked when observable emits an error');
             })
             .catch(() => {
               expect(status.done).toBe(false);
               expect(initFnInvoked).toBe(true);
             });
       }));
  });
});