/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {isBlank, isStringMap} from '../facade/lang';
import {NgLocalization, getPluralCategory} from '../localization';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

const _INTERPOLATION_REGEXP: RegExp = /#/g;

/**
 * @ngModule CommonModule
 * @whatItDoes Maps a value to a string that pluralizes the value according to locale rules.
 * @howToUse `expression | i18nPlural:mapping`
 * @description
 *
 *  Where:
 *  - `expression` is a number.
 *  - `mapping` is an object that mimics the ICU format, see
 *    http://userguide.icu-project.org/formatparse/messages
 *
 *  ## Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @experimental
 */
@Pipe({name: 'i18nPlural', pure: true})
export class I18nPluralPipe implements PipeTransform {
  constructor(private _localization: NgLocalization) {}

  transform(value: number, pluralMap: {[count: string]: string}): string {
    if (isBlank(value)) return '';

    if (!isStringMap(pluralMap)) {
      throw new InvalidPipeArgumentError(I18nPluralPipe, pluralMap);
    }

    const key = getPluralCategory(value, Object.keys(pluralMap), this._localization);

    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
}
