/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * Transforms text to lowercase.
 *
 * {@example  core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe' }
 *
 * @stable
 */
@Pipe({name: 'lowercase'})
export class LowerCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    if (typeof value !== 'string') {
      throw new InvalidPipeArgumentError(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }
}

/**
 * Transforms text to titlecase.
 *
 * @stable
 */
@Pipe({name: 'titlecase'})
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    if (typeof value !== 'string') {
      throw new InvalidPipeArgumentError(TitleCasePipe, value);
    }

    return value[0].toUpperCase() + value.substr(1).toLowerCase();
  }
}

/**
 * Transforms text to uppercase.
 *
 * @stable
 */
@Pipe({name: 'uppercase'})
export class UpperCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    if (typeof value !== 'string') {
      throw new InvalidPipeArgumentError(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }
}
