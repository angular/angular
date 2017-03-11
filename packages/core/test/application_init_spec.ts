/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {APP_INITIALIZER, ApplicationInitStatus} from '../src/application_init';
import {TestBed, async, inject} from '../testing';

export function main() {
  describe('ApplicationInitStatus', () => {
    describe('no initializers', () => {

      it('should return true for `done`',
         async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           expect(status.done).toBe(true);
         })));

      it('should return a promise that resolves immediately for `donePromise`',
         async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
           status.donePromise.then(() => { expect(status.done).toBe(true); });
         })));
    });

    describe('with async initializers', () => {
      describe('Promise', () => {
        let resolve: (result: any) => void;
        let promise: Promise<any>;
        beforeEach(() => {
          promise = new Promise((res) => { resolve = res; });
          TestBed.configureTestingModule(
              {providers: [{provide: APP_INITIALIZER, multi: true, useValue: () => promise}]});
        });

        it('should update the status once all async initializers are done',
           async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
             let completerResolver = false;
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

      describe('Observable', () => {
        let observer: Observer<any>;
        let observable: Observable<any>;
        beforeEach(() => {
          observable = new Observable((obs: Observer<any>) => {
            observer = obs;
            return () => {};
          });
          TestBed.configureTestingModule(
              {providers: [{provide: APP_INITIALIZER, multi: true, useValue: () => observable}]});
        });

        it('should update the status once all async initializers are done',
           async(inject([ApplicationInitStatus], (status: ApplicationInitStatus) => {
             let completer = false;
             setTimeout(() => {
               completer = true;
               observer.next(null);
               observer.complete();
             });

             expect(status.done).toBe(false);
             status.donePromise.then(() => {
               expect(status.done).toBe(true);
               expect(completer).toBe(true);
             });
           })));
      });
    });
  });
}
