/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {formatBytes, getFormattedValue} from './formatting';

describe('Formatting utilities', () => {
  describe('formatBytes', () => {
    it('should format bytes less than 1024 as B', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
    });

    it('should format bytes between 1024 and 1024*1024 as KB', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
    });

    it('should format bytes 1024*1024 and above as MB', () => {
      expect(formatBytes(1048576)).toBe('1.0 MB');
    });

    it('should handle edge cases', () => {
      expect(formatBytes(1)).toBe('1 B');
      expect(formatBytes(1025)).toBe('1.0 KB');
      expect(formatBytes(1048577)).toBe('1.0 MB');
    });
  });

  describe('getFormattedValue', () => {
    it('should format null values', () => {
      expect(getFormattedValue(null)).toBe('null');
    });

    it('should format undefined values', () => {
      expect(getFormattedValue(undefined)).toBe('undefined');
    });

    it('should format string values with quotes', () => {
      expect(getFormattedValue('hello')).toBe('"hello"');
      expect(getFormattedValue('')).toBe('""');
      expect(getFormattedValue('test string')).toBe('"test string"');
    });

    it('should format object values as JSON', () => {
      const obj = {name: 'John', age: 30};
      const expected = JSON.stringify(obj, null, 2);
      expect(getFormattedValue(obj)).toBe(expected);
    });

    it('should format array values as JSON', () => {
      const arr = [1, 2, 3];
      const expected = JSON.stringify(arr, null, 2);
      expect(getFormattedValue(arr)).toBe(expected);
    });

    it('should format other primitive types as strings', () => {
      expect(getFormattedValue(42)).toBe('42');
      expect(getFormattedValue(3.14)).toBe('3.14');
      expect(getFormattedValue(true)).toBe('true');
      expect(getFormattedValue(false)).toBe('false');
    });

    it('should handle symbols', () => {
      const symbol = Symbol('test');
      expect(getFormattedValue(symbol)).toBe(symbol.toString());
    });

    it('should handle BigInt', () => {
      const bigInt = BigInt(123456789);
      expect(getFormattedValue(bigInt)).toBe('123456789');
    });
  });
});
