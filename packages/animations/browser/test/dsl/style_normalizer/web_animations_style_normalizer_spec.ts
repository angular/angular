/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {WebAnimationsStyleNormalizer} from '../../../src/dsl/style_normalization/web_animations_style_normalizer';

describe('WebAnimationsStyleNormalizer', () => {
  const normalizer = new WebAnimationsStyleNormalizer();

  describe('normalizePropertyName', () => {
    it('should normalize CSS property values to camel-case', () => {
      expect(normalizer.normalizePropertyName('width', [])).toEqual('width');
      expect(normalizer.normalizePropertyName('border-width', [])).toEqual('borderWidth');
      expect(normalizer.normalizePropertyName('borderHeight', [])).toEqual('borderHeight');
      expect(normalizer.normalizePropertyName('-webkit-animation', [])).toEqual('WebkitAnimation');
    });
  });

  describe('normalizeStyleValue', () => {
    function normalize(prop: string, val: string | number): string {
      const errors: Error[] = [];
      const result = normalizer.normalizeStyleValue(prop, prop, val, errors);
      if (errors.length) {
        throw new Error(errors.join('\n'));
      }
      return result;
    }

    it('should normalize number-based dimensional properties to use a `px` suffix if missing', () => {
      expect(normalize('width', 10)).toEqual('10px');
      expect(normalize('height', 20)).toEqual('20px');
    });

    it('should report an error when a string-based dimensional value does not contain a suffix at all', () => {
      expect(() => {
        normalize('width', '50');
      }).toThrowError(/Please provide a CSS unit value for width:50/);
    });

    it('should not normalize non-dimensional properties with `px` values, but only convert them to string', () => {
      expect(normalize('opacity', 0)).toEqual('0');
      expect(normalize('opacity', '1')).toEqual('1');
      expect(normalize('color', 'red')).toEqual('red');
      expect(normalize('fontWeight', '100')).toEqual('100');
    });

    it('should not normalize dimensional-based values that already contain a dimensional suffix or a non dimensional value', () => {
      expect(normalize('width', '50em')).toEqual('50em');
      expect(normalize('height', '500pt')).toEqual('500pt');
      expect(normalize('borderWidth', 'inherit')).toEqual('inherit');
      expect(normalize('paddingTop', 'calc(500px + 200px)')).toEqual('calc(500px + 200px)');
    });

    it('should allow `perspective` to be a numerical property', () => {
      expect(normalize('perspective', 10)).toEqual('10px');
      expect(normalize('perspective', '100pt')).toEqual('100pt');
      expect(normalize('perspective', 'none')).toEqual('none');
    });
  });
});
