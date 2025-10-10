/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {makeValidationResultCustomIfNeeded} from '../../../../src/api/validators/util';
import {customError, ValidationError} from '../../../../src/api/validation_errors';
import {FieldTree} from '../../../../src/api/types';

describe('validators utils', () => {
  describe('makeValidationResultCustomIfNeeded', () => {
    it('should return null and undefined as is', () => {
      expect(makeValidationResultCustomIfNeeded(null)).toBe(null);
      expect(makeValidationResultCustomIfNeeded(undefined)).toBe(undefined);
    });

    it('should wrap a plain error object with customError', () => {
      const error: ValidationError = {kind: 'meow', field: {} as FieldTree<unknown>};
      const result = makeValidationResultCustomIfNeeded(error);
      expect(result).toEqual(customError(error));
    });

    it('should not wrap an error that is not a plain object', () => {
      const custom = customError({kind: 'meow'});
      const result = makeValidationResultCustomIfNeeded(custom);
      expect(result).toBe(custom);
    });

    describe('arrays', () => {
      it('should process a mixed array of validation errors', () => {
        const plainError: ValidationError = {kind: 'plain', field: {} as FieldTree<unknown>};
        const custom = customError({kind: 'custom'});

        const result = makeValidationResultCustomIfNeeded([plainError, custom]);

        expect(result).toEqual([customError(plainError), custom]);
      });
    });
  });
});
