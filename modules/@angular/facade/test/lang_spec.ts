/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NumberWrapper, StringWrapper, escapeRegExp, hasConstructor} from '../src/lang';

class MySuperclass {}
class MySubclass extends MySuperclass {}

export function main() {
  describe('RegExp', () => {
    it('should escape regexp', () => {
      expect(new RegExp(escapeRegExp('b')).exec('abc')).toBeTruthy();
      expect(new RegExp(escapeRegExp('b')).exec('adc')).toBeFalsy();
      expect(new RegExp(escapeRegExp('a.b')).exec('a.b')).toBeTruthy();
      expect(new RegExp(escapeRegExp('a.b')).exec('axb')).toBeFalsy();
    });

  });

  describe('const', () => {
    it('should support const expressions both in TS and Dart', () => {
      const numbers = [1, 2, 3];
      expect(numbers).toEqual([1, 2, 3]);
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

  describe('String', () => {
    var s: string;

    describe('slice', () => {
      beforeEach(() => { s = 'abcdefghij'; });

      it('should return the whole string if neither start nor end are specified',
         () => { expect(StringWrapper.slice(s)).toEqual('abcdefghij'); });

      it('should return up to the end if end is not specified',
         () => { expect(StringWrapper.slice(s, 1)).toEqual('bcdefghij'); });

      it('should support negative start',
         () => { expect(StringWrapper.slice(s, -1)).toEqual('j'); });

      it('should support negative end',
         () => { expect(StringWrapper.slice(s, -3, -1)).toEqual('hi'); });

      it('should return empty string if start is greater than end', () => {
        expect(StringWrapper.slice(s, 4, 2)).toEqual('');
        expect(StringWrapper.slice(s, -2, -4)).toEqual('');
      });
    });

    describe('stripLeft', () => {
      it('should strip the first character of the string if it matches the provided input', () => {
        var input = '~angular2 is amazing';
        var expectedOutput = 'angular2 is amazing';

        expect(StringWrapper.stripLeft(input, '~')).toEqual(expectedOutput);
      });

      it('should keep stripping characters from the start until the first unmatched character',
         () => {
           var input = '#####hello';
           var expectedOutput = 'hello';
           expect(StringWrapper.stripLeft(input, '#')).toEqual(expectedOutput);
         });

      it('should not alter the provided input if the first character does not match the provided input',
         () => {
           var input = '+angular2 is amazing';
           expect(StringWrapper.stripLeft(input, '*')).toEqual(input);
         });

      it('should not do any alterations when an empty string or null value is passed in', () => {
        expect(StringWrapper.stripLeft('', 'S')).toEqual('');
        expect(StringWrapper.stripLeft(null, 'S')).toEqual(null);
      });
    });

    describe('stripRight', () => {
      it('should strip the first character of the string if it matches the provided input', () => {
        var input = 'angular2 is amazing!';
        var expectedOutput = 'angular2 is amazing';

        expect(StringWrapper.stripRight(input, '!')).toEqual(expectedOutput);
      });

      it('should not alter the provided input if the first character does not match the provided input',
         () => {
           var input = 'angular2 is amazing+';

           expect(StringWrapper.stripRight(input, '*')).toEqual(input);
         });

      it('should keep stripping characters from the end until the first unmatched character',
         () => {
           var input = 'hi&!&&&&&';
           var expectedOutput = 'hi&!';
           expect(StringWrapper.stripRight(input, '&')).toEqual(expectedOutput);
         });

      it('should not do any alterations when an empty string or null value is passed in', () => {
        expect(StringWrapper.stripRight('', 'S')).toEqual('');
        expect(StringWrapper.stripRight(null, 'S')).toEqual(null);
      });
    });

    describe('hasConstructor', () => {
      it('should be true when the type matches',
         () => { expect(hasConstructor(new MySuperclass(), MySuperclass)).toEqual(true); });

      it('should be false for subtypes',
         () => { expect(hasConstructor(new MySubclass(), MySuperclass)).toEqual(false); });
    });
  });
}
