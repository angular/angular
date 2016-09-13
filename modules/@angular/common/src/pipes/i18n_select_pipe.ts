/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {isBlank, isStringMap} from '../facade/lang';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @whatItDoes Generic selector that displays the string that matches the current value.
 * @howToUse `expression | i18nSelect:mapping`
 * @description
 *
 *  Where:
 *  - `mapping`: is an object that indicates the text that should be displayed
 *  for different values of the provided `expression`.
 *
 *  ## Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
 *
 *  @experimental
 */
@Pipe({name: 'i18nSelect', pure: true})
export class I18nSelectPipe implements PipeTransform {
  transform(value: string, mapping: {[key: string]: string}): string {
    if (isBlank(value)) return '';

    if (!isStringMap(mapping)) {
      throw new InvalidPipeArgumentError(I18nSelectPipe, mapping);
    }

    return mapping.hasOwnProperty(value) ? mapping[value] : '';
  }
}
