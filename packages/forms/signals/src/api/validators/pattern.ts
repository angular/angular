/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateMetadata, metadata, validate} from '../logic';
import {PATTERN} from '../metadata';
import {SchemaPath, LogicFn, PathKind, SchemaPathRules} from '../types';
import {patternError} from '../validation_errors';
import {BaseValidatorConfig, getOption, isEmpty} from './util';

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
 *
 * @category validation
 * @experimental 21.0.0
 */
export function pattern<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  pattern: RegExp | LogicFn<string | undefined, RegExp | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
) {
  const PATTERN_MEMO = metadata(path, (ctx) =>
    computed(() => (pattern instanceof RegExp ? pattern : pattern(ctx))),
  );
  aggregateMetadata(path, PATTERN, ({state}) => state.metadata(PATTERN_MEMO)!());
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const pattern = ctx.state.metadata(PATTERN_MEMO)!();
    if (pattern === undefined) {
      return undefined;
    }
    if (!pattern.test(ctx.value())) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return patternError(pattern, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
