/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/testing_internal';

import {Observable} from '../../src/facade/async';

export function main() {
  describe('Observable', () => {
    describe('#core', () => {

      it('should call next with values',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

           let o = new Observable((sink: any /** TODO #9100 */) => { sink.next(1); });

           o.subscribe(v => {
             expect(v).toEqual(1);
             async.done();
           });

         }));

      it('should call next and then complete',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

           let o = new Observable((sink: any /** TODO #9100 */) => {
             sink.next(1);
             sink.complete();
           });
           let nexted = false;

           o.subscribe(
               v => { nexted = true; }, null,
               () => {
                 expect(nexted).toBe(true);
                 async.done();
               });

         }));

      it('should call error with errors',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

           let o = new Observable((sink: any /** TODO #9100 */) => { sink.error('oh noes!'); });

           o.subscribe(
               v => {

               },
               (err) => {
                 expect(err).toEqual('oh noes!');
                 async.done();
               });

         }));
    });
  });
}
