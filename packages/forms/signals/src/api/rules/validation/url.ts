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
import {urlError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be a valid HTTP or HTTPS URL.
 * This function can only be called on string paths.
 *
 * @param path Path of the field to validate
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.url()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form URL Validation](guide/forms/signals/validation#url)
 * @category validation
 * @publicApi 22.0
 */
export function url<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
) {
  validate(path, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }

    const value = ctx.value();
    if (isEmpty(value)) {
      return undefined;
    }

    let isValid = false;
    try {
      const url = new URL(value);
      isValid = url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      isValid = false;
    }

    if (!isValid) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return urlError({message: getOption(config?.message, ctx)});
      }
    }

    return undefined;
  });
}
