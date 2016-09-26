/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {isBlank} from '../facade/lang';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @whatItDoes Transforms string to uppercase.
 * @howToUse `expression | uppercase`
 * @description
 *
 * Converts value into lowercase string using `String.prototype.toUpperCase()`.
 *
 * ### Example
 *
 * {@example common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe'}
 *
 * @stable
 */
@Pipe({name: 'uppercase'})
export class UpperCasePipe implements PipeTransform {
  transform(value: string): string {
    if (isBlank(value)) return value;
    if (typeof value !== 'string') {
      throw new InvalidPipeArgumentError(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }
}
