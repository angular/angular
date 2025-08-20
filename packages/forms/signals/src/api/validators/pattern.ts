/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateProperty, property, validate} from '../logic';
import {PATTERN} from '../property';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './util';

/**
 * Binds a validator to the given path that requires the value to match a specific regex pattern.
 * This function can only be called on string paths.
 * In addition to binding a validator, this function adds `PATTERN` property to the field.
 *
 * @param path Path of the field to validate
 * @param pattern The RegExp pattern to match, or a LogicFn that returns the RegExp pattern.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.pattern(pattern)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function pattern<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<string, TPathKind>,
  pattern: RegExp | LogicFn<string | undefined, RegExp | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
) {
  const PATTERN_MEMO = property(path, (ctx) =>
    computed(() => (pattern instanceof RegExp ? pattern : pattern(ctx))),
  );
  aggregateProperty(path, PATTERN, ({state}) => state.property(PATTERN_MEMO)!());
  validate(path, (ctx) => {
    const pattern = ctx.state.property(PATTERN_MEMO)!();

    // A pattern validator should not fail on an empty value. This matches the behavior of HTML's
    // built in `pattern` attribute.
    if (pattern === undefined || ctx.value() == null || ctx.value() === '') {
      return undefined;
    }

    if (!pattern.test(ctx.value())) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.pattern(pattern);
      }
    }
    return undefined;
  });
}
