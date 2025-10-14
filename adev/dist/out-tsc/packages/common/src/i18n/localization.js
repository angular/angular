/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable, LOCALE_ID, ɵRuntimeError as RuntimeError} from '@angular/core';
import {getLocalePluralCase, Plural} from './locale_data_api';
/**
 * @publicApi
 */
let NgLocalization = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
      useFactory: () => new NgLocaleLocalization(inject(LOCALE_ID)),
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NgLocalization = class {
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
      NgLocalization = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (NgLocalization = _classThis);
})();
export {NgLocalization};
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
  let key = `=${value}`;
  if (cases.indexOf(key) > -1) {
    return key;
  }
  key = ngLocalization.getPluralCategory(value, locale);
  if (cases.indexOf(key) > -1) {
    return key;
  }
  if (cases.indexOf('other') > -1) {
    return 'other';
  }
  throw new RuntimeError(
    2308 /* RuntimeErrorCode.NO_PLURAL_MESSAGE_FOUND */,
    ngDevMode && `No plural message found for value "${value}"`,
  );
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
let NgLocaleLocalization = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = NgLocalization;
  var NgLocaleLocalization = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgLocaleLocalization = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    locale;
    constructor(locale) {
      super();
      this.locale = locale;
    }
    getPluralCategory(value, locale) {
      const plural = getLocalePluralCase(locale || this.locale)(value);
      switch (plural) {
        case Plural.Zero:
          return 'zero';
        case Plural.One:
          return 'one';
        case Plural.Two:
          return 'two';
        case Plural.Few:
          return 'few';
        case Plural.Many:
          return 'many';
        default:
          return 'other';
      }
    }
  };
  return (NgLocaleLocalization = _classThis);
})();
export {NgLocaleLocalization};
//# sourceMappingURL=localization.js.map
