/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';
import {strHash} from '../../src/i18n/digest';

export function main(): void {
  describe('strHash', () => {
    it('should return a hash value', () => {
      // https://github.com/google/closure-library/blob/1fb19a857b96b74e6523f3e9d33080baf25be046/closure/goog/string/string_test.js#L1115
      expectHash('', 0);
      expectHash('foo', 101574);
      expectHash('\uAAAAfoo', 1301670364);
      expectHash('a', 92567585, 5);
      expectHash('a', 2869595232, 6);
      expectHash('a', 3058106369, 7);
      expectHash('a', 312017024, 8);
      expectHash('a', 2929737728, 1024);
    });
  });
}

function expectHash(text: string, decimal: number, repeat: number = 1) {
  let acc = text;
  for (let i = 1; i < repeat; i++) {
    acc += text;
  }

  const hash = strHash(acc);
  expect(typeof(hash)).toEqual('string');
  expect(hash.length > 0).toBe(true);
  expect(parseInt(hash, 16)).toEqual(decimal);
}