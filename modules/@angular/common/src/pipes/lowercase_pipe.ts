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
 * @whatItDoes Transforms string to lowercase.
 * @howToUse `expression | lowercase`
 * @description
 *
 * Converts value into lowercase string using `String.prototype.toLowerCase()`.
 *
 * ### Example
 *
 * {@example common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe'}
 *
 * @stable
 */
@Pipe({name: 'lowercase'})
export class LowerCasePipe implements PipeTransform {
  transform(value: string): string {
    if (isBlank(value)) return value;
    if (typeof value !== 'string') {
      throw new InvalidPipeArgumentError(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }
}
