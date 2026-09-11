/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, metadata, REQUIRED} from '../metadata';
import {BaseValidatorConfig, getOption, isEmpty} from './util';
import {validate} from './validate';
import {requiredError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be non-empty.
 * This function can only be called on any type of path.
 * In addition to binding a validator, this function adds `REQUIRED` property to the field.
 *
 * A value is considered empty when it is `null`, `undefined`, the empty string `''`, `false`, or
 * `NaN`. Every other value is considered non-empty, including `0` and the empty array `[]` — use
 * [`minLength()`](api/forms/signals/minLength) to require a minimum number of items in an array.
 *
 * `false` and `NaN` are empty because they are the values native controls produce when left blank:
 * an unchecked `<input type="checkbox">` binds `false`, and a blank or unparseable
 * `<input type="number">` binds `NaN`. A blank number input therefore reports a `required` error
 * rather than a number-specific one, since [`min()`](api/forms/signals/min) and
 * [`max()`](api/forms/signals/max) skip `NaN`.
 *
 * @param path Path of the field to validate
 * @param config Optional, allows providing any of the following options:
 *  - `message`: A user-facing message for the error.
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.required()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 *  - `when`: A function that receives the `FieldContext` and returns true if the field is required
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Required Validation](guide/forms/signals/validation#required)
 * @category validation
 * @publicApi 22.0
 */
export function required<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind> & {
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
  },
): void {
  const REQUIRED_MEMO = metadata(path, createMetadataKey<boolean>(), (ctx) =>
    config?.when ? config.when(ctx) : true,
  );
  metadata(path, REQUIRED, ({state}) => state.metadata(REQUIRED_MEMO)!()!);
  validate(path, (ctx) => {
    if (ctx.state.metadata(REQUIRED_MEMO)!() && isEmpty(ctx.value())) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return requiredError({message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
