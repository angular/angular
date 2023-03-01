/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrLocaleData} from './cldr-data';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocaleExtraDataArrayCode} from './locale-extra-file';
import {generateBasicLocaleString} from './locale-file';
import {getPluralFunction} from './plural-function';

/**
 * Generated the contents for the global locale file
 */
export function generateLocaleGlobalFile(
    locale: string, localeData: CldrLocaleData, baseCurrencies: BaseCurrencies) {
  const basicLocaleData = generateBasicLocaleString(locale, localeData, baseCurrencies);
  const extraLocaleData = generateLocaleExtraDataArrayCode(locale, localeData);
  const data = basicLocaleData.replace(/\]$/, `, ${extraLocaleData}]`);
  return `${fileHeader}
  (function(global) {
    global.ng = global.ng || {};
    global.ng.common = global.ng.common || {};
    global.ng.common.locales = global.ng.common.locales || {};
    const u = undefined;
    ${getPluralFunction(localeData, false)}
    global.ng.common.locales['${normalizeLocale(locale)}'] = ${data};
  })(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global || typeof window !== 'undefined' && window);
    `;
}


/**
 * In Angular the locale is referenced by a "normalized" form.
 */
function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}
