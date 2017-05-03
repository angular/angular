import { ElementRef } from '@angular/core';

import { getAttrs, getAttrValue, getBoolFromAttribute, boolFromValue } from './attribute-utils';

describe('Attribute Utilities', () => {
  let testEl: HTMLElement;

  beforeEach(() => {
    const div = document.createElement('div');
    div.innerHTML = `<div a b="true" c="false" D="foo" d-E></div>`;
    testEl = div.querySelector('div');
  });

  describe('#getAttrs', () => {

    beforeEach(() => {
      this.expectedMap = {
        a: '',
        b: 'true',
        c: 'false',
        d: 'foo',
        'd-e': ''
      };
    });

    it('should get attr map from getAttrs(element)', () => {
      const actual = getAttrs(testEl);
      expect(actual).toEqual(this.expectedMap);
    });

    it('should get attr map from getAttrs(elementRef)', () => {
      const actual = getAttrs(new ElementRef(testEl));
      expect(actual).toEqual(this.expectedMap);
    });
  });

  describe('#getAttrValue', () => {
    let attrMap: { [index: string]: string };

    beforeEach(() => {
      attrMap = getAttrs(testEl);
    });

    it('should return empty string value for attribute "a"', () => {
      expect(getAttrValue(attrMap, 'a')).toBe('');
    });

    it('should return empty string value for attribute "A"', () => {
      expect(getAttrValue(attrMap, 'a')).toBe('');
    });

    it('should return "true" for attribute "b"', () => {
      expect(getAttrValue(attrMap, 'b')).toBe('true');
    });

    it('should return empty string value for attribute "d-E"', () => {
      expect(getAttrValue(attrMap, 'd-e')).toBe('');
    });

    it('should return empty string for attribute ["d-e"]', () => {
      // because d-e will be found before d
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

    it('should return undefined value for non-existent attribute "x"', () => {
      expect(getAttrValue(attrMap, 'x')).toBeUndefined();
    });

    it('should return undefined if no argument', () => {
      expect(getAttrValue(attrMap)).toBeUndefined();
    });

  });

  describe('#boolFromValue', () => {
    let attrMap: { [index: string]: string };

    beforeEach(() => {
      attrMap = getAttrs(testEl);
    });

    it('should return true for present but unassigned attr "a"', () => {
      expect(boolFromValue(getAttrValue(attrMap, 'a'))).toBe(true);
    });

    it('should return true for attr "b" which is "true"', () => {
      expect(boolFromValue(getAttrValue(attrMap, 'b'))).toBe(true);
    });

    it('should return false for attr "c" which is "false"', () => {
      expect(boolFromValue(getAttrValue(attrMap, 'c'))).toBe(false);
    });

    it('should return false by default for undefined attr "x"', () => {
      expect(boolFromValue(getAttrValue(attrMap, 'x'))).toBe(false);
    });

    it('should return true for undefined attr "x" when default is true', () => {
      const value = getAttrValue(attrMap, 'x');
      expect(boolFromValue(value, true)).toBe(true);
    });

    it('should return false for undefined attr "x" when default is false', () => {
      const value = getAttrValue(attrMap, 'x');
      expect(boolFromValue(value, false)).toBe(false);
    });

    it('should return true for present but unassigned attr "a" even when default is false', () => {
      // default value is only applied when the attribute is missing
      const value = getAttrValue(attrMap, 'a');
      expect(boolFromValue(value, false)).toBe(true);
    });
  });

  // Combines the three utilities for convenience.
  describe('#getBoolFromAttribute', () => {
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
