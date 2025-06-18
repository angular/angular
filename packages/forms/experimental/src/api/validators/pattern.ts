/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {metadata, validate} from '../logic';
import {PATTERN} from '../metadata';
import {FieldPath, LogicFn} from '../types';
import {BaseValidatorConfig} from './types';

function strToRegexp(pattern: string) {
  let regexStr = '';

  if (pattern.charAt(0) !== '^') regexStr += '^';

  regexStr += pattern;

  if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';

  return new RegExp(regexStr);
}

/*
 * Validator allowing to validate a string against a pattern.
 *
 * @param path Path to the target field
 * @param pattern Regex as a string. `^` and `$` would be added automatically if not present.
 * @param config Optional, currently allows providing custom errors function.
 */
export function pattern(
  path: FieldPath<string>,
  pattern: string | LogicFn<string | undefined, string | undefined>,
  config?: BaseValidatorConfig<string>,
) {
  const reactivePatternValue = typeof pattern === 'string' ? () => pattern : pattern;
  metadata(path, PATTERN, (ctx) => [reactivePatternValue(ctx)]);

  return validate(path, (ctx) => {
    const value = reactivePatternValue(ctx);

    if (value === undefined) {
      return undefined;
    }

    const regex = strToRegexp(value);
    if (!regex.test(ctx.value())) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'pattern', pattern};
      }
    }

    return undefined;
  });
}
