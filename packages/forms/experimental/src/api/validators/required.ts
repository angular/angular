/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {defineComputed} from '../data';
import {metadata, validate} from '../logic';
import {REQUIRED} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './util';

/**
 * Binds a validator to the given path that requires the value to be non-empty.
 * This function can only be called on any type of path.
 * In addition to binding a validator, this function adds `REQUIRED` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.required()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 *  - `emptyPredicate`: A function that receives the value, and returns `true` if it is considered empty.
 *    By default `false`, `''`, `null`, and `undefined` are considered empty
 *  - `condition`: A function that receives the `FieldContext` and returns true if the field is required
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function required<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind> & {
    emptyPredicate?: (value: TValue) => boolean;
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
  },
): void {
  const emptyPredicate =
    config?.emptyPredicate ?? ((value) => value === false || value == null || value === '');
  const condition = defineComputed(path, (ctx) => (config?.when ? config.when(ctx) : true));

  metadata(path, REQUIRED, ({state}) => state.metadata(condition)!());
  validate(path, (ctx) => {
    if (ctx.state.metadata(condition)!() && emptyPredicate(ctx.value())) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.required();
      }
    }
    return undefined;
  });
}
