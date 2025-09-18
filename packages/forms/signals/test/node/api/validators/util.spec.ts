/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ensureCustomValidationResult} from '../../../../src/api/validators/util';
import {
  customError,
  ValidationError,
  ValidationErrorWithField,
} from '../../../../src/api/validation_errors';
import {FieldTree} from '../../../../src/api/types';

describe('validators utils', () => {
  describe('makeValidationResultCustomIfNeeded', () => {
    it('should return null and undefined as is', () => {
      expect(ensureCustomValidationResult(null)).toBe(null);
      expect(ensureCustomValidationResult(undefined)).toBe(undefined);
    });

    it('should wrap a plain error object with customError', () => {
      const error: ValidationErrorWithField = {kind: 'meow', field: {} as FieldTree<unknown>};
      const result = ensureCustomValidationResult(error);
      expect(result).toEqual(customError(error));
    });

    it('should not wrap an error that is not a plain object', () => {
      const custom = customError({kind: 'meow'});
      const result = ensureCustomValidationResult(custom);
      expect(result).toBe(custom);
    });

    describe('arrays', () => {
      it('should process a mixed array of validation errors', () => {
        const plainError: ValidationErrorWithField = {
          kind: 'plain',
          field: {} as FieldTree<unknown>,
        };
        const custom = customError({kind: 'custom'});

        const result = ensureCustomValidationResult([plainError, custom]);

        expect(result).toEqual([customError(plainError), custom]);
      });
    });
  });
});
