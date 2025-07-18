/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {metadata, validate} from '../logic';
import {PATTERN} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './types';

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
  const reactivePatternValue = pattern instanceof RegExp ? () => pattern : pattern;

  metadata(path, PATTERN, (ctx) => {
    const result = reactivePatternValue(ctx);
    if (result === undefined) {
      return [];
    }
    return [result.source];
  });

  validate(path, (ctx) => {
    const regex = reactivePatternValue(ctx);
    const value = ctx.value();

    // A pattern validator should not fail on an empty value.
    if (regex === undefined || value == null || value === '') {
      return undefined;
    }

    if (!regex.test(value)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return ValidationError.pattern(regex.source);
      }
    }

    return undefined;
  });
}
