/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_DATA, LocaleDataIndex} from './locale_data';
import localeEn from './locale_en';
import {global} from '../util/global';

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

function getLocaleData(normalizedLocale: string): any {
  if (normalizedLocale in LOCALE_DATA) {
    return LOCALE_DATA[normalizedLocale];
  }

  if (typeof global.ng === 'undefined') global.ng = {};
  if (typeof global.ng.common === 'undefined') global.ng.common = {};
  if (typeof global.ng.common.locale === 'undefined') global.ng.common.locale = {};

  // The locale names on the global object are not normalized, so we have to do a search.
  // This is only once per requested locale; after that it is cached on LOCALE_DATA.
  // Also generally only one or very few locales should be loaded onto the global.
  for (const l in global.ng.common.locale) {
    if (normalizeLocale(l) === normalizedLocale) {
      const localeData = LOCALE_DATA[normalizedLocale] = global.ng.common.locale[l];
      if (localeData !== undefined) {
        localeData[LocaleDataIndex.ExtraData] = global.ng.common.locale[`extra/${l}`];
        return localeData;
      }
    }
  }

  return undefined;
}


function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}