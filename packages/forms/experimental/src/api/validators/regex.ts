/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {metadata, validate} from '../logic';
import {REGEX} from '../metadata';
import {FieldPath, LogicFn} from '../types';
import {BaseValidatorConfig} from './types';

/*
 * Validator allowing to validate a string against a Regular Expression.
 *
 * @param path Path to the target field
 * @param pattern Regex as a string. `^` and `$` would be added automatically if not present.
 * @param config Optional, currently allows providing custom errors function.
 */
export function regex(
  path: FieldPath<string>,
  regex: RegExp | LogicFn<string | undefined, RegExp | undefined>,
  config?: BaseValidatorConfig<string>,
) {
  const reactiveRegexValue = regex instanceof RegExp ? () => regex : regex;
  metadata(path, REGEX, (ctx) => [reactiveRegexValue(ctx)]);

  return validate(path, (ctx) => {
    const value = reactiveRegexValue(ctx);

    if (value === undefined) {
      return undefined;
    }

    if (!value.test(ctx.value())) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'regex'};
      }
    }

    return undefined;
  });
}
