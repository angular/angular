/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, flushMicrotasks} from '@angular/core/testing/fake_async';
import {beforeEach, beforeEachProviders, ddescribe, describe, expect, iit, inject, it, xit} from '@angular/core/testing/testing_internal';

import {SyncAsyncResult} from '../src/util';

export function main() {
  describe('util', () => {
    describe('SyncAsyncResult', () => {
      it('async value should default to Promise.resolve(syncValue)', fakeAsync(() => {
           const syncValue = {};
           const sar = new SyncAsyncResult(syncValue);
           sar.asyncResult.then((v: any) => expect(v).toBe(syncValue));
         }));
    });
  })
}
