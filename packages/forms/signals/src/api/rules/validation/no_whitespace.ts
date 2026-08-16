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
import {noWhitespaceError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the string value to not consist solely of whitespace,
 * nor contain leading or trailing whitespace.
 * This function can only be called on string paths.
 *
 * @param path Path of the field to validate.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.noWhitespace()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (root path, child path, or array item).
 *
 * @see [Signal Form Validation](guide/forms/signals/validation#nowhitespace)
 * @category validation
 * @publicApi 22.0
 */
export function noWhitespace<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
): void {
  validate(path, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    const value = ctx.value();
    if (isEmpty(value)) {
      return undefined;
    }
    const isBlank = value.trim().length === 0;
    const isUntrimmed = value.trim() !== value;

    if (!isBlank && !isUntrimmed) {
      return undefined;
    }

    return config?.error
      ? getOption(config.error, ctx)
      : noWhitespaceError({
          message: getOption(config?.message, ctx),
          isBlank,
          isUntrimmed,
        });
  });
}
