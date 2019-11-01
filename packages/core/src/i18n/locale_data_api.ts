/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_DATA, LocaleDataIndex} from './locale_data';
import localeEn from './locale_en';

/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
export function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void {
  if (typeof localeId !== 'string') {
    extraData = localeId;
    localeId = data[LocaleDataIndex.LocaleId];
  }

  localeId = localeId.toLowerCase().replace(/_/g, '-');

  LOCALE_DATA[localeId] = data;

  if (extraData) {
    LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData;
  }
}

/**
 * Finds the locale data for a given locale.
 *
 * @param locale The locale code.
 * @returns The locale data.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
export function findLocaleData(locale: string): any {
  const normalizedLocale = normalizeLocale(locale);

  let match = getLocaleData(normalizedLocale);
  if (match) {
    return match;
  }

  // let's try to find a parent locale
  const parentLocale = normalizedLocale.split('-')[0];
  match = getLocaleData(parentLocale);
  if (match) {
    return match;
  }

  if (parentLocale === 'en') {
    return localeEn;
  }

  throw new Error(`Missing locale data for the locale "${locale}".`);
}

/**
 * Retrieves the plural function used by ICU expressions to determine the plural case to use
 * for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The plural function for the locale.
 * @see `NgPlural`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
export function getLocalePluralCase(locale: string): (value: number) => number {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}



/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`.
 */
export function getLocaleData(normalizedLocale: string): any {
  return LOCALE_DATA[normalizedLocale];
}

/**
 * Helper function to remove all the locale data from `LOCALE_DATA`.
 */
export function unregisterLocaleData() {
  Object.keys(LOCALE_DATA).forEach(key => delete LOCALE_DATA[key]);
}

/**
 * Returns the canonical form of a locale name - lowercase with `_` replaced with `-`.
 */
function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}