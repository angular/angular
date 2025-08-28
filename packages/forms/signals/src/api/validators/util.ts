/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, OneOrMany, PathKind, type FieldContext} from '../types';
import {ValidationError, WithoutField} from '../validation_errors';

/** Represents a value that has a length or size, such as an array or string, or set. */
export type ValueWithLengthOrSize = {length: number} | {size: number};

/** Common options available on the standard validators. */
export type BaseValidatorConfig<TValue, TPathKind extends PathKind = PathKind.Root> =
  | {
      /** A user-facing error message to include with the error. */
      message?: string | LogicFn<TValue, string, TPathKind>;
      error?: never;
    }
  | {
      /**
       * Custom validation error(s) to report instead of the default,
       * or a function that receives the `FieldContext` and returns custom validation error(s).
       */
      error?:
        | OneOrMany<WithoutField<ValidationError>>
        | LogicFn<TValue, OneOrMany<WithoutField<ValidationError>>, TPathKind>;
      message?: never;
    };

/** Gets the length or size of the given value. */
export function getLengthOrSize(value: ValueWithLengthOrSize) {
  const v = value as {length: number; size: number};
  return typeof v.length === 'number' ? v.length : v.size;
}

/**
 * Gets the value for an option that may be either a static value or a logic function that produces
 * the option value.
 *
 * @param opt The option from BaseValidatorConfig.
 * @param ctx The current FieldContext.
 * @returns The value for the option.
 */
export function getOption<TOption, TValue, TPathKind extends PathKind = PathKind.Root>(
  opt: Exclude<TOption, Function> | LogicFn<TValue, TOption, TPathKind> | undefined,
  ctx: FieldContext<TValue, TPathKind>,
): TOption | undefined {
  return opt instanceof Function ? opt(ctx) : opt;
}

/**
 * Checks if the given value is considered empty. Empty values are: null, undefined, '', false, NaN.
 */
export function isEmpty(value: unknown): boolean {
  if (typeof value === 'number') {
    return isNaN(value);
  }
  return value === '' || value === false || value == null;
}
