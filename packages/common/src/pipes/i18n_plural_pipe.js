/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var I18nPluralPipe_1;
import {__decorate} from 'tslib';
import {Pipe} from '@angular/core';
import {getPluralCategory} from '../i18n/localization';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';
const _INTERPOLATION_REGEXP = /#/g;
/**
 * @ngModule CommonModule
 * @description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @publicApi
 */
let I18nPluralPipe = (I18nPluralPipe_1 = class I18nPluralPipe {
  constructor(_localization) {
    this._localization = _localization;
  }
  /**
   * @param value the number to be formatted
   * @param pluralMap an object that mimics the ICU format, see
   * https://unicode-org.github.io/icu/userguide/format_parse/messages/.
   * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
   * default).
   */
  transform(value, pluralMap, locale) {
    if (value == null) return '';
    if (typeof pluralMap !== 'object' || pluralMap === null) {
      throw invalidPipeArgumentError(I18nPluralPipe_1, pluralMap);
    }
    const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
});
I18nPluralPipe = I18nPluralPipe_1 = __decorate(
  [
    Pipe({
      name: 'i18nPlural',
    }),
  ],
  I18nPluralPipe,
);
export {I18nPluralPipe};
//# sourceMappingURL=i18n_plural_pipe.js.map
