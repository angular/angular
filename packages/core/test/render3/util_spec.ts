/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDifferent} from '../../src/render3/util';

describe('util', () => {

  describe('isDifferent', () => {

    it('should mark non-equal arguments as different', () => {
      expect(isDifferent({}, {})).toBeTruthy();
      expect(isDifferent('foo', 'bar')).toBeTruthy();
      expect(isDifferent(0, 1)).toBeTruthy();
    });

    it('should not mark equal arguments as different', () => {
      const obj = {};
      expect(isDifferent(obj, obj)).toBeFalsy();
      expect(isDifferent('foo', 'foo')).toBeFalsy();
      expect(isDifferent(1, 1)).toBeFalsy();
    });

    it('should not mark NaN as different', () => { expect(isDifferent(NaN, NaN)).toBeFalsy(); });

    it('should mark NaN with other values as different', () => {
      expect(isDifferent(NaN, 'foo')).toBeTruthy();
      expect(isDifferent(5, NaN)).toBeTruthy();
    });
  });
});