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
 * Validator allowing to validate a string against a pattern.
 *
 * @param path Path to the target field
 * @param pattern Regular expression to validate against.
 * @param config Optional, currently allows providing custom errors function.
 */
export function pattern<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<string, TPathKind>,
  pattern: RegExp | LogicFn<string | undefined, RegExp | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
) {
  const PATTERN_MEMO = property(path, (ctx) =>
    computed(() => (pattern instanceof RegExp ? pattern : pattern(ctx))),
  );
  aggregateProperty(path, PATTERN, ({state}) => state.property(PATTERN_MEMO)!()?.source);
  validate(path, (ctx) => {
    const pattern = ctx.state.property(PATTERN_MEMO)!();

    // A pattern validator should not fail on an empty value.
    if (pattern === undefined || ctx.value() == null || ctx.value() === '') {
      return undefined;
    }

    if (!pattern.test(ctx.value())) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.pattern(pattern.source);
      }
    }
    return undefined;
  });
}
