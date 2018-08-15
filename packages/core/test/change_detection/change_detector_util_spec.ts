/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {devModeEqual} from '@angular/core/src/change_detection/change_detection_util';

{
  describe('ChangeDetectionUtil', () => {
    describe('devModeEqual', () => {
      it('should do the deep comparison of iterables', () => {
        expect(devModeEqual([['one']], [['one']])).toBe(true);
        expect(devModeEqual(['one'], ['one', 'two'])).toBe(false);
        expect(devModeEqual(['one', 'two'], ['one'])).toBe(false);
        expect(devModeEqual(['one'], 'one')).toBe(false);
        expect(devModeEqual(['one'], {})).toBe(false);
        expect(devModeEqual('one', ['one'])).toBe(false);
        expect(devModeEqual({}, ['one'])).toBe(false);
      });

      it('should compare primitive numbers', () => {
        expect(devModeEqual(1, 1)).toBe(true);
        expect(devModeEqual(1, 2)).toBe(false);
        expect(devModeEqual({}, 2)).toBe(false);
        expect(devModeEqual(1, {})).toBe(false);
      });

      it('should compare primitive strings', () => {
        expect(devModeEqual('one', 'one')).toBe(true);
        expect(devModeEqual('one', 'two')).toBe(false);
        expect(devModeEqual({}, 'one')).toBe(false);
        expect(devModeEqual('one', {})).toBe(false);
      });

      it('should compare primitive booleans', () => {
        expect(devModeEqual(true, true)).toBe(true);
        expect(devModeEqual(true, false)).toBe(false);
        expect(devModeEqual({}, true)).toBe(false);
        expect(devModeEqual(true, {})).toBe(false);
      });

      it('should compare null', () => {
        expect(devModeEqual(null, null)).toBe(true);
        expect(devModeEqual(null, 1)).toBe(false);
        expect(devModeEqual({}, null)).toBe(false);
        expect(devModeEqual(null, {})).toBe(false);
      });

      it('should return true for other objects', () => {
        expect(devModeEqual({}, {})).toBe(true);
      });
    });
  });
}
