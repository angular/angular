/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NumberWrapper, escapeRegExp} from '../src/lang';

export function main() {
  describe('RegExp', () => {
    it('should escape regexp', () => {
      expect(new RegExp(escapeRegExp('b')).exec('abc')).toBeTruthy();
      expect(new RegExp(escapeRegExp('b')).exec('adc')).toBeFalsy();
      expect(new RegExp(escapeRegExp('a.b')).exec('a.b')).toBeTruthy();
      expect(new RegExp(escapeRegExp('a.b')).exec('axb')).toBeFalsy();
    });

  });

  describe('Number', () => {
    describe('isNumeric', () => {
      it('should return true when passing correct numeric string',
         () => { expect(NumberWrapper.isNumeric('2')).toBe(true); });

      it('should return true when passing correct double string',
         () => { expect(NumberWrapper.isNumeric('1.123')).toBe(true); });

      it('should return true when passing correct negative string',
         () => { expect(NumberWrapper.isNumeric('-2')).toBe(true); });

      it('should return true when passing correct scientific notation string',
         () => { expect(NumberWrapper.isNumeric('1e5')).toBe(true); });

      it('should return false when passing incorrect numeric',
         () => { expect(NumberWrapper.isNumeric('a')).toBe(false); });

      it('should return false when passing parseable but non numeric',
         () => { expect(NumberWrapper.isNumeric('2a')).toBe(false); });
    });
  });
}
