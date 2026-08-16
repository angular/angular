/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵeq as eq} from '@angular/core';
import {PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {BaseValidatorConfig, getOption, isEmpty} from './util';
import {validate} from './validate';
import {compareError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to equal the value of another target path in the same form schema.
 *
 * @param path Path of the primary field to validate.
 * @param targetPath Path of the target field to compare against.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.compare(targetPath)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (root path, child path, or array item).
 *
 * @see [Signal Form Validation](guide/forms/signals/validation#compare)
 * @category validation
 * @publicApi 22.0
 */
export function compare<T, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<T, SchemaPathRules.Supported, TPathKind>,
  targetPath: SchemaPath<T, SchemaPathRules.Supported, PathKind>,
  config?: BaseValidatorConfig<T, TPathKind>,
): void {
  validate(path, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    const currentVal = ctx.value();
    const targetVal = ctx.valueOf(targetPath);

    if (isEmpty(currentVal)) {
      return undefined;
    }

    if (eq(currentVal, targetVal)) {
      return undefined;
    }

    return config?.error
      ? getOption(config.error, ctx)
      : compareError({message: getOption(config?.message, ctx)});
  });
}
