/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/testing_internal';

import {sha1} from '../../src/i18n/digest';

export function main(): void {
  describe('sha1', () => {
    it('should work on emnpty strings',
       () => { expect(sha1('')).toEqual('da39a3ee5e6b4b0d3255bfef95601890afd80709'); });

    it('should returns the sha1 of "hello world"',
       () => { expect(sha1('abc')).toEqual('a9993e364706816aba3e25717850c26c9cd0d89d'); });

    it('should returns the sha1 of unicode strings',
       () => { expect(sha1('你好，世界')).toEqual('3becb03b015ed48050611c8d7afe4b88f70d5a20'); });

    it('should support arbitrary string size', () => {
      // node.js reference code:
      //
      // var crypto = require('crypto');
      //
      // function sha1(string) {
      //   var shasum = crypto.createHash('sha1');
      //   shasum.update(string, 'utf8');
      //   return shasum.digest('hex', 'utf8');
      // }
      //
      // var prefix = `你好，世界`;
      // var result = sha1(prefix);
      // for (var size = prefix.length; size < 5000; size += 101) {
      //   result = prefix + sha1(result);
      //   while (result.length < size) {
      //     result += result;
      //   }
      //   result = result.slice(-size);
      // }
      //
      // console.log(sha1(result));
      const prefix = `你好，世界`;
      let result = sha1(prefix);
      for (let size = prefix.length; size < 5000; size += 101) {
        result = prefix + sha1(result);
        while (result.length < size) {
          result += result;
        }
        result = result.slice(-size);
      }
      expect(sha1(result)).toEqual('24c2dae5c1ac6f604dbe670a60290d7ce6320b45');
    });
  });
}
