/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {BaseValidatorConfig, getOption, isEmpty} from './util';
import {validate} from './validate';
import {numericError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be a valid finite number or numeric string.
 * This function can be called on string or number paths.
 *
 * @param path Path of the field to validate.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.numeric()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (root path, child path, or array item).
 *
 * @see [Signal Form Validation](guide/forms/signals/validation#numeric)
 * @category validation
 * @publicApi 22.0
 */
export function numeric<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string | number, SchemaPathRules.Supported, TPathKind>,
  config?: BaseValidatorConfig<string | number, TPathKind>,
): void {
  validate(path, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }

    const value = ctx.value();
    if (isEmpty(value)) {
      return undefined;
    }

    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      return undefined;
    }

    if (config?.error) {
      return getOption(config.error, ctx);
    } else {
      return numericError({message: getOption(config?.message, ctx)});
    }
  });
}
