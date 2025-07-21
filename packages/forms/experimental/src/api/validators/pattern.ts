/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed, Signal} from '@angular/core';
import {aggregateProperty, property, validate} from '../logic';
import {PATTERN, Property} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './util';

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
export function pattern<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<string, TPathKind>,
  pattern: string | LogicFn<string | undefined, string | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
) {
  const PATTERN_MEMO = Property.create<Signal<string | undefined>>();

  property(path, PATTERN_MEMO, (ctx) =>
    computed(() => (typeof pattern === 'string' ? pattern : pattern(ctx))),
  );
  aggregateProperty(path, PATTERN, ({state}) => state.property(PATTERN_MEMO)!());
  validate(path, (ctx) => {
    const pattern = ctx.state.property(PATTERN_MEMO)!();
    if (pattern === undefined) {
      return undefined;
    }
    const regex = strToRegexp(pattern);
    if (!regex.test(ctx.value())) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.pattern(pattern);
      }
    }
    return undefined;
  });
}
