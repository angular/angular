import { ElementRef } from '@angular/core';

import { AttrMap, getAttrs, getAttrValue, getBoolFromAttribute, boolFromValue } from './attribute-utils';

describe('Attribute Utilities', () => {
  let testEl: HTMLElement;

  beforeEach(() => {
    const div = document.createElement('div');
    div.innerHTML = `<div a b="true" c="false" D="foo" d-E></div>`;
    testEl = div.querySelector('div')!;
  });

  describe('getAttrs', () => {
    const expectedMap = {
      a: '',
      b: 'true',
      c: 'false',
      d: 'foo',
      'd-e': ''
    };

    it('should get attr map from getAttrs(element)', () => {
      const actual = getAttrs(testEl);
      expect(actual).toEqual(expectedMap);
    });

    it('should get attr map from getAttrs(elementRef)', () => {
      const actual = getAttrs(new ElementRef(testEl));
      expect(actual).toEqual(expectedMap);
    });
  });

  describe('getAttrValue', () => {
    let attrMap: AttrMap;

    beforeEach(() => {
      attrMap = getAttrs(testEl);
    });

    it('should return empty string for attribute "a"', () => {
      expect(getAttrValue(attrMap, 'a')).toBe('');
    });

    it('should return empty string for attribute "A"', () => {
      expect(getAttrValue(attrMap, 'A')).toBe('');
    });

    it('should return "true" for attribute "b"', () => {
      expect(getAttrValue(attrMap, 'b')).toBe('true');
    });

    it('should return empty string for attribute "d-E"', () => {
      expect(getAttrValue(attrMap, 'd-E')).toBe('');
    });

    it('should return empty string for attribute ["d-e"]', () => {
      expect(getAttrValue(attrMap, ['d-e'])).toBe('');
    });

    it('should return "foo" for attribute ["d", "d-e"]', () => {
      // because d will be found before d-e
      expect(getAttrValue(attrMap, ['d', 'd-e'])).toBe('foo');
    });

    it('should return empty string for attribute ["d-e", "d"]', () => {
      // because d-e will be found before d
      expect(getAttrValue(attrMap, ['d-e', 'd'])).toBe('');
    });

    it('should return undefined for non-existent attributes', () => {
      expect(getAttrValue(attrMap, 'x')).toBeUndefined();
      expect(getAttrValue(attrMap, '')).toBeUndefined();
      expect(getAttrValue(attrMap, ['', 'x'])).toBeUndefined();
    });

  });

  describe('boolFromValue', () => {

    it('should return true for "" as in present but unassigned attr "a"', () => {
      expect(boolFromValue('')).toBe(true);
    });

    it('should return false for "false" as in attr "c"', () => {
      expect(boolFromValue('false')).toBe(false);
    });
    it('should return true for "true" as in attr "b"', () => {
      expect(boolFromValue('true')).toBe(true);
    });

    it('should return true for something other than "false"', () => {
      expect(boolFromValue('foo')).toBe(true);
    });

    it('should return true for "False" because case-sensitive', () => {
      expect(boolFromValue('False')).toBe(true);
    });


    it('should return false by default as in undefined attr "x"', () => {
      expect(boolFromValue(undefined)).toBe(false);
    });

    it('should return true for undefined value when default is true', () => {
      expect(boolFromValue(undefined, true)).toBe(true);
    });

    it('should return false for undefined value when default is false', () => {
      expect(boolFromValue(undefined, false)).toBe(false);
    });

    it('should return true for "" as in unassigned attr "a" even when default is false', () => {
      // default value is only applied when the attribute is missing
      expect(boolFromValue('', false)).toBe(true);
    });
  });

  // Combines the three utilities for convenience.
  describe('getBoolFromAttribute', () => {
    it('should return true for present but unassigned attr "a"', () => {
      expect(getBoolFromAttribute(testEl, 'a')).toBe(true);
    });

    it('should return true for attr "b" which is "true"', () => {
      expect(getBoolFromAttribute(testEl, 'b')).toBe(true);
    });

    it('should return false for attr "c" which is "false"', () => {
      expect(getBoolFromAttribute(testEl, 'c')).toBe(false);
    });

    it('should return true for attributes ["d-e", "d"]', () => {
      // because d-e will be found before D="foo"
      expect(getBoolFromAttribute(testEl, ['d-e', 'd'])).toBe(true);
    });

    it('should return false for non-existent attribute "x"', () => {
      expect(getBoolFromAttribute(testEl, 'x')).toBe(false);
    });
  });
});
