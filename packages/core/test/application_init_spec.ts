/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector} from '@angular/core';
import {APP_INITIALIZER, ApplicationInitStatus} from '@angular/core/src/application_init';
import {TestBed, async, inject} from '../testing';

{
  describe('ApplicationInitStatus', () => {
    describe('no initializers', () => {

      it('should return true for `done`',
         async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           (status as any).runInitializers();
           expect(status.done).toBe(true);
         })));

      it('should return a promise that resolves immediately for `donePromise`',
         async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           (status as any).runInitializers();
           status.donePromise.then(() => { expect(status.done).toBe(true); });
         })));
    });

    describe('with async initializers', () => {
      let resolve: (result: any) => void;
      let promise: Promise<any>;
      let completerResolver = false;
      beforeEach(() => {
        let initializerFactory = (injector: Injector) => {
          return () => {
            const initStatus = injector.get(ApplicationInitStatus);
            initStatus.donePromise.then(() => { expect(completerResolver).toBe(true); });
          };
        };
        promise = new Promise((res) => { resolve = res; });
        TestBed.configureTestingModule({
          providers: [
            {provide: APP_INITIALIZER, multi: true, useValue: () => promise},
            {
              provide: APP_INITIALIZER,
              multi: true,
              useFactory: initializerFactory,
              deps: [Injector]
            },
          ]
        });
      });

      it('should update the status once all async initializers are done',
         async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           (status as any).runInitializers();

           setTimeout(() => {
             completerResolver = true;
             resolve(null);
           });

           expect(status.done).toBe(false);
           status.donePromise.then(() => {
             expect(status.done).toBe(true);
             expect(completerResolver).toBe(true);
           });
         })));
    });
  });
}
