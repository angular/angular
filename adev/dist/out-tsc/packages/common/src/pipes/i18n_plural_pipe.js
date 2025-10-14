/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
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
let I18nPluralPipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'i18nPlural',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var I18nPluralPipe = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      I18nPluralPipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _localization;
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
        throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
      }
      const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
      return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
    }
  };
  return (I18nPluralPipe = _classThis);
})();
export {I18nPluralPipe};
//# sourceMappingURL=i18n_plural_pipe.js.map
