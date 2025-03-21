/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {booleanAttribute, numberAttribute} from '../../src/core';

describe('coercion functions', () => {
  describe('booleanAttribute', () => {
    it('should coerce undefined to false', () => {
      expect(booleanAttribute(undefined)).toBe(false);
    });

    it('should coerce null to false', () => {
      expect(booleanAttribute(null)).toBe(false);
    });

    it('should coerce the empty string to true', () => {
      expect(booleanAttribute('')).toBe(true);
    });

    it('should coerce zero to true', () => {
      expect(booleanAttribute(0)).toBe(true);
    });

    it('should coerce the string "false" to false', () => {
      expect(booleanAttribute('false')).toBe(false);
    });

    it('should coerce the boolean false to false', () => {
      expect(booleanAttribute(false)).toBe(false);
    });

    it('should coerce the boolean true to true', () => {
      expect(booleanAttribute(true)).toBe(true);
    });

    it('should coerce the string "true" to true', () => {
      expect(booleanAttribute('true')).toBe(true);
    });

    it('should coerce an arbitrary string to true', () => {
      expect(booleanAttribute('pink')).toBe(true);
    });

    it('should coerce an object to true', () => {
      expect(booleanAttribute({})).toBe(true);
    });

    it('should coerce an array to true', () => {
      expect(booleanAttribute([])).toBe(true);
    });
  });

  describe('numberAttribute', () => {
    it('should coerce undefined to the default value', () => {
      expect(numberAttribute(undefined)).toBeNaN();
      expect(numberAttribute(undefined, 111)).toBe(111);
    });

    it('should coerce null to the default value', () => {
      expect(numberAttribute(null)).toBeNaN();
      expect(numberAttribute(null, 111)).toBe(111);
    });

    it('should coerce true to the default value', () => {
      expect(numberAttribute(true)).toBeNaN();
      expect(numberAttribute(true, 111)).toBe(111);
    });

    it('should coerce false to the default value', () => {
      expect(numberAttribute(false)).toBeNaN();
      expect(numberAttribute(false, 111)).toBe(111);
    });

    it('should coerce the empty string to the default value', () => {
      expect(numberAttribute('')).toBeNaN();
      expect(numberAttribute('', 111)).toBe(111);
    });

    it('should coerce the string "1" to 1', () => {
      expect(numberAttribute('1')).toBe(1);
      expect(numberAttribute('1', 111)).toBe(1);
    });

    it('should coerce the string "123.456" to 123.456', () => {
      expect(numberAttribute('123.456')).toBe(123.456);
      expect(numberAttribute('123.456', 111)).toBe(123.456);
    });

    it('should coerce the string "-123.456" to -123.456', () => {
      expect(numberAttribute('-123.456')).toBe(-123.456);
      expect(numberAttribute('-123.456', 111)).toBe(-123.456);
    });

    it('should coerce an arbitrary string to the default value', () => {
      expect(numberAttribute('pink')).toBeNaN();
      expect(numberAttribute('pink', 111)).toBe(111);
    });

    it('should coerce an arbitrary string prefixed with a number to the default value', () => {
      expect(numberAttribute('123pink')).toBeNaN();
      expect(numberAttribute('123pink', 111)).toBe(111);
    });

    it('should coerce the number 1 to 1', () => {
      expect(numberAttribute(1)).toBe(1);
      expect(numberAttribute(1, 111)).toBe(1);
    });

    it('should coerce the number 123.456 to 123.456', () => {
      expect(numberAttribute(123.456)).toBe(123.456);
      expect(numberAttribute(123.456, 111)).toBe(123.456);
    });

    it('should coerce the number -123.456 to -123.456', () => {
      expect(numberAttribute(-123.456)).toBe(-123.456);
      expect(numberAttribute(-123.456, 111)).toBe(-123.456);
    });

    it('should coerce an object to the default value', () => {
      expect(numberAttribute({})).toBeNaN();
      expect(numberAttribute({}, 111)).toBe(111);
    });

    it('should coerce an array to the default value', () => {
      expect(numberAttribute([])).toBeNaN();
      expect(numberAttribute([], 111)).toBe(111);
    });
  });
});
