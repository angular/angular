/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {coerceToBoolean} from '@angular/core/src/util/coercion';

{
  describe('coerceToBoolean', () => {
    it('should coerce undefined to false', () => {
      expect(coerceToBoolean(undefined)).toBe(false);
    });

    it('should coerce null to false', () => {
      expect(coerceToBoolean(null)).toBe(false);
    });

    it('should coerce the empty string to true', () => {
      expect(coerceToBoolean('')).toBe(true);
    });

    it('should coerce zero to true', () => {
      expect(coerceToBoolean(0)).toBe(true);
    });

    it('should coerce the string "false" to false', () => {
      expect(coerceToBoolean('false')).toBe(false);
    });

    it('should coerce the boolean false to false', () => {
      expect(coerceToBoolean(false)).toBe(false);
    });

    it('should coerce the boolean true to true', () => {
      expect(coerceToBoolean(true)).toBe(true);
    });

    it('should coerce the string "true" to true', () => {
      expect(coerceToBoolean('true')).toBe(true);
    });

    it('should coerce an arbitrary string to true', () => {
      expect(coerceToBoolean('pink')).toBe(true);
    });

    it('should coerce an object to true', () => {
      expect(coerceToBoolean({})).toBe(true);
    });

    it('should coerce an array to true', () => {
      expect(coerceToBoolean([])).toBe(true);
    });
  });
}
