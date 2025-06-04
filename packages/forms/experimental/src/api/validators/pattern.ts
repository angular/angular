/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {metadata, validate} from '../logic';
import {FieldPath} from '../types';
import {BaseValidatorConfig} from './types';
import {PATTERN} from '@angular/forms/experimental';

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
export function pattern(path: FieldPath<string>, pattern: string, config?: BaseValidatorConfig<string>) {
  metadata(path, PATTERN, () => [pattern]);
  const regex = strToRegexp(pattern);


  return validate(path, (ctx) => {
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
