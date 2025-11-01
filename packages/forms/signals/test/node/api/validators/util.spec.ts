/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldTree} from '../../../../src/api/types';
import {customError, minError, ValidationError} from '../../../../src/api/validation_errors';
import {ensureCustomValidationResult} from '../../../../src/api/validators/util';
import {addDefaultField} from '../../../../src/field/validation';

describe('validators utils', () => {
  describe('ensureCustomValidationResult', () => {
    it('should return null as is', () => {
      expect(ensureCustomValidationResult(null)).toBe(null);
    });

    it('should return undefined as is', () => {
      expect(ensureCustomValidationResult(undefined)).toBe(undefined);
    });

    it('should wrap a plain error object with customError', () => {
      const error: ValidationError.WithField = {kind: 'meow', field: {} as FieldTree<unknown>};
      const result = ensureCustomValidationResult(error);
      expect(result).toEqual(customError(error));
    });

    it('should not wrap an error with the same shape', () => {
      class WeirdError {
        readonly kind = 'pirojok-the-weird-error';
      }

      const weirdError = addDefaultField(new WeirdError(), {} as FieldTree<unknown>);
      const result = ensureCustomValidationResult(weirdError);
      expect(result).toBe(weirdError);
    });

    it('should not wrap a custom user error', () => {
      class PirojokError implements ValidationError {
        readonly kind = 'pirojok-the-error';

        constructor(readonly flavor: string) {}
      }

      const pirojokError = addDefaultField(new PirojokError('jam'), {} as FieldTree<unknown>);
      const result = ensureCustomValidationResult(pirojokError);
      expect(result).toBe(pirojokError);
    });

    it('should not wrap a min error', () => {
      const min = minError(27);
      const result = ensureCustomValidationResult(min);
      expect(result).toBe(min);
    });

    it('should not wrap an error that is not a plain object', () => {
      const custom = customError({kind: 'meow'});
      const result = ensureCustomValidationResult(custom);
      expect(result).toBe(custom);
    });

    describe('arrays', () => {
      it('should process a mixed array of validation errors', () => {
        const plainError: ValidationError.WithField = {
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
