/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {arrayEquals} from 'shared-utils';

describe('arrayEquals', () => {
  let a;
  let b;

  describe('true cases', () => {
    afterEach(() => {
      expect(arrayEquals(a, b)).toBe(true);
    });

    it('should return true for empty arrays', () => {
      a = [];
      b = [];
    });

    describe('same type array', () => {
      it('should return true for arrays with equal value numbers', () => {
        a = [0, 1, 2, 3];
        b = [0, 1, 2, 3];
      });

      it('should return true for arrays with equal value strings', () => {
        a = ['hello', 'world'];
        b = ['hello', 'world'];
      });

      it('should return true for arrays with equal value booleans', () => {
        a = [true, false, false, true];
        b = [true, false, false, true];
      });
    });
  });

  describe('false cases', () => {
    afterEach(() => {
      expect(arrayEquals(a, b)).toBe(false);
    });

    describe('same type array', () => {
      it('should return false for arrays of different numbers', () => {
        a = [0, 1, 2, 3];
        b = [4, 1, 1, 12];
      });

      it('should return false for arrays of different strings', () => {
        a = ['hello', 'world'];
        b = ['hello', 'planet'];
      });

      it('should return false for arrays of different booleans', () => {
        a = [true, true, true, false, true, true, false, false];
        b = [true, true, false, true, false, true, true, false];
      });
    });

    it('should return false for arrays with different values', () => {
      a = [1, 'false', 2, '7'];
      b = [true, false, '2', 7];
    });

    it('should return false for arrays with different lengths', () => {
      a = [0, 1, 2, 3];
      b = [0, 1, 2, 3, 100];
    });
  });
});
