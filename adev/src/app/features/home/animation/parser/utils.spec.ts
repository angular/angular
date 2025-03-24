/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {stringifyParsedValue} from './utils';

describe('CSS Value Parser Utils', () => {
  describe('stringifyParsedValue', () => {
    it('should stringify a static value', () => {
      const output = stringifyParsedValue({
        type: 'static',
        value: 'block',
      });

      expect(output).toEqual('block');
    });

    it('should stringify an RGB color value', () => {
      const output = stringifyParsedValue({
        type: 'color',
        value: ['rgb', 255, 255, 0],
      });

      expect(output).toEqual('rgb(255, 255, 0)');
    });

    it('should stringify an RGBA color value', () => {
      const output = stringifyParsedValue({
        type: 'color',
        value: ['rgba', 255, 125, 0, 0.75],
      });

      expect(output).toEqual('rgba(255, 125, 0, 0.75)');
    });

    it('should stringify a single numeric value', () => {
      const output = stringifyParsedValue({
        type: 'numeric',
        values: [[42, 'px']],
      });

      expect(output).toEqual('42px');
    });

    it('should stringify a unitless numeric value', () => {
      const output = stringifyParsedValue({
        type: 'numeric',
        values: [[1337, '']],
      });

      expect(output).toEqual('1337');
    });

    it('should stringify multiple numeric values', () => {
      const output = stringifyParsedValue({
        type: 'numeric',
        values: [
          [42, 'px'],
          [13.37, '%'],
          [0, 'rem'],
        ],
      });

      expect(output).toEqual('42px 13.37% 0rem');
    });

    it('should stringify multiple unitless values', () => {
      const output = stringifyParsedValue({
        type: 'numeric',
        values: [
          [42, ''],
          [13.37, ''],
          [0, ''],
        ],
      });

      expect(output).toEqual('42 13.37 0');
    });

    it('should stringify a transform value', () => {
      const output = stringifyParsedValue({
        type: 'transform',
        values: new Map([['translate', [[42, 'px']]]]),
      });

      expect(output).toEqual('translate(42px)');
    });

    it('should stringify a transform value with a function with multiple paramters', () => {
      const output = stringifyParsedValue({
        type: 'transform',
        values: new Map([
          [
            'translate',
            [
              [42, 'px'],
              [13.37, '%'],
            ],
          ],
        ]),
      });

      expect(output).toEqual('translate(42px, 13.37%)');
    });

    it('should stringify a transform value with multiple functions', () => {
      const output = stringifyParsedValue({
        type: 'transform',
        values: new Map([
          [
            'translate',
            [
              [42, 'px'],
              [13.37, '%'],
            ],
          ],
          ['scale', [[1.5, '']]],
        ]),
      });

      expect(output).toEqual('translate(42px, 13.37%) scale(1.5)');
    });
  });
});
