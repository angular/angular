/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {isBlank, isString} from '../facade/lang';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * Implements propercase transforms to text.
 *
 * ### Example
 *
 * 'hello there' will be transformed to 'Hello there'
 *
 * @stable
 */
@Pipe({name: 'propercase'})
export class ProperCasePipe implements PipeTransform {
  transform(value: string): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentError(ProperCasePipe, value);
    }
    return value[0].toUpperCase() + value.substr(1);
  }
}
