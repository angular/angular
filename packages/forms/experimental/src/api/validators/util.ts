/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';

/** Represents a value that has a length or size, such as an array or string, or set. */
export type ValueWithLengthOrSize = {length: number} | {size: number};

/** Common options available on the standard validators. */
export interface BaseValidatorConfig<T, TPathKind extends PathKind = PathKind.Root> {
  /**
   * Custom validation error(s) to report instead of the default,
   * or a function that receives the `FieldContext` and returns custom validation error(s).
   */
  error?:
    | ValidationError
    | ValidationError[]
    | LogicFn<T, ValidationError | ValidationError[], TPathKind>;
}

export function getLengthOrSize(value: ValueWithLengthOrSize) {
  const v = value as {length: number; size: number};
  return typeof v.length === 'number' ? v.length : v.size;
}
