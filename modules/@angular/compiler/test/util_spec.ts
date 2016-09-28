/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync} from '@angular/core/testing/fake_async';
import {describe, expect, it} from '@angular/core/testing/testing_internal';

import {SyncAsyncResult, splitAtColon} from '../src/util';

export function main() {
  describe('util', () => {
    describe('SyncAsyncResult', () => {
      it('async value should default to Promise.resolve(syncValue)', fakeAsync(() => {
           const syncValue = {};
           const sar = new SyncAsyncResult(syncValue);
           sar.asyncResult.then((v: any) => expect(v).toBe(syncValue));
         }));
    });

    describe('splitAtColon', () => {
      it('should split when a single ":" is present', () => {
        expect(splitAtColon('a:b', [])).toEqual(['a', 'b']);
      });

      it('should trim parts', () => { expect(splitAtColon(' a : b ', [])).toEqual(['a', 'b']); });

      it('should support multiple ":"', () => {
        expect(splitAtColon('a:b:c', [])).toEqual(['a', 'b:c']);
      });

      it('should use the default value when no ":" is present', () => {
        expect(splitAtColon('ab', ['c', 'd'])).toEqual(['c', 'd']);
      });
    });
  });
}
