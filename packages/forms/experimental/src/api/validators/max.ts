/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {setMetadata} from '../data';
import {addToMetadata, validate} from '../logic';
import {MAX, MetadataKey} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './util';

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxValue`.
 * This function can only be called on number paths.
 * In addition to binding a validator, this function adds `MAX` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param maxValue The maximum value, or a LogicFn that returns the maximum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.max(maxValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function max<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<number, TPathKind>,
  maxValue: number | LogicFn<number, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
) {
  const MAX_MEMO = MetadataKey.create<Signal<number | undefined>>();

  setMetadata(path, MAX_MEMO, (ctx) =>
    computed(() => (typeof maxValue === 'number' ? maxValue : maxValue(ctx))),
  );
  addToMetadata(path, MAX, ({state}) => state.metadata(MAX_MEMO)!());
  validate(path, (ctx) => {
    const max = ctx.state.metadata(MAX_MEMO)!();
    if (max === undefined || Number.isNaN(max)) {
      return undefined;
    }
    if (ctx.value() > max) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.max(max);
      }
    }
    return undefined;
  });
}
