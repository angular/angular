/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isCustomElementByFunction, matchingSchemas} from '../../src/render3/instructions/element_validation';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '../../src/metadata/schema';

describe('element validation', () => {
  describe('isCustomElementByFunction', () => {
    it('should return true when function returns true', () => {
      const isCustomElement = (tag: string) => tag.includes('-');
      expect(isCustomElementByFunction(isCustomElement, 'my-element')).toBe(true);
    });

    it('should return false when function returns false', () => {
      const isCustomElement = (tag: string) => tag.includes('-');
      expect(isCustomElementByFunction(isCustomElement, 'div')).toBe(false);
    });

    it('should return false when function is null', () => {
      expect(isCustomElementByFunction(null, 'my-element')).toBe(false);
    });

    it('should return false when tagName is null', () => {
      const isCustomElement = (tag: string) => tag.includes('-');
      expect(isCustomElementByFunction(isCustomElement, null)).toBe(false);
    });

    it('should work with complex logic', () => {
      const isCustomElement = (tag: string) => {
        return tag.startsWith('polymer-') || tag.startsWith('lit-') || tag === 'special-element';
      };
      
      expect(isCustomElementByFunction(isCustomElement, 'polymer-button')).toBe(true);
      expect(isCustomElementByFunction(isCustomElement, 'lit-element')).toBe(true);
      expect(isCustomElementByFunction(isCustomElement, 'special-element')).toBe(true);
      expect(isCustomElementByFunction(isCustomElement, 'regular-element')).toBe(false);
      expect(isCustomElementByFunction(isCustomElement, 'div')).toBe(false);
    });
  });

  describe('matchingSchemas integration', () => {
    it('should work with NO_ERRORS_SCHEMA', () => {
      expect(matchingSchemas([NO_ERRORS_SCHEMA], 'any-element')).toBe(true);
      expect(matchingSchemas([NO_ERRORS_SCHEMA], 'div')).toBe(true);
    });

    it('should work with CUSTOM_ELEMENTS_SCHEMA for hyphenated elements', () => {
      expect(matchingSchemas([CUSTOM_ELEMENTS_SCHEMA], 'my-element')).toBe(true);
      expect(matchingSchemas([CUSTOM_ELEMENTS_SCHEMA], 'div')).toBe(false);
    });

    it('should work with null schemas', () => {
      expect(matchingSchemas(null, 'my-element')).toBe(false);
      expect(matchingSchemas(null, 'div')).toBe(false);
    });

    it('should work with empty schemas array', () => {
      expect(matchingSchemas([], 'my-element')).toBe(false);
      expect(matchingSchemas([], 'div')).toBe(false);
    });
  });
});
