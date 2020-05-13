/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';

import {getPluralCategory, NgLocalization} from '../i18n/localization';

import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

const _INTERPOLATION_REGEXP: RegExp = /#/g;

/**
 * @ngModule CommonModule
 * @description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 * @usageNotes
 *
 * The following example defines a mapping object and uses the pipe to transform
 * a set of messages using that mapping with the default locale information.
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @see [Transforming data with pipes](guide/pipes)
 * @see [Internationalization](guide/i18n) guide
 *
 * @publicApi
 */
@Pipe({name: 'i18nPlural', pure: true})
export class I18nPluralPipe implements PipeTransform {
  constructor(private _localization: NgLocalization) {}

  /**
   * @param value The number to be formatted.
   * @param pluralMap An object that mimics the ICU format. See
   * http://userguide.icu-project.org/formatparse/messages.
   * @param locale A locale string to use. Default is the current value of `LOCALE_ID`.
   */
  transform(value: number, pluralMap: {[count: string]: string}, locale?: string): string {
    if (value == null) return '';

    if (typeof pluralMap !== 'object' || pluralMap === null) {
      throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
    }

    const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);

    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
}
