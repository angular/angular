/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, LOCALE_DATA, LOCALE_ID, NgLocale, Optional, Plural} from '@angular/core';
import {AVAILABLE_LOCALES} from './available_locales';
import {NgLocaleEn} from './data/locale_en';


/**
 * @experimental
 */
export abstract class NgLocalization {
  abstract getPluralCategory(value: any, locale?: string): string;
}


/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 *
 * @internal
 */
export function getPluralCategory(
    value: number, cases: string[], ngLocalization: NgLocalization, locale?: string): string {
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

  throw new Error(`No plural message found for value "${value}"`);
}

/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
@Injectable()
export class NgLocaleLocalization extends NgLocalization {
  constructor(
      @Inject(LOCALE_ID) protected locale: string,
      @Optional() @Inject(LOCALE_DATA) protected localeData: NgLocale[]) {
    super();
  }

  getPluralCategory(value: any, locale?: string): string {
    const localeDatum = findNgLocale(locale || this.locale, this.localeData);
    const plural = localeDatum.getPluralCase(value);

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
}

/**
 * Returns the closest existing locale or null
 * ie: "en-US" will return "en", and "fr_ca" will return "fr-CA"
 */
function getNormalizedLocale(locale: string): string {
  let normalizedLocale = locale.replace('_', '-');
  const match =
      AVAILABLE_LOCALES.find((l: string) => l.toLocaleLowerCase() === locale.toLocaleLowerCase());

  if (match) {
    normalizedLocale = match;
  } else {
    const parentLocale = normalizedLocale.split('-')[0].toLocaleLowerCase();
    if (AVAILABLE_LOCALES.find((l: string) => l.toLocaleLowerCase() === parentLocale)) {
      normalizedLocale = parentLocale;
    } else {
      throw new Error(
          `"${locale}" is not a valid LOCALE_ID value. See https://github.com/unicode-cldr/cldr-core/blob/master/availableLocales.json for a list of valid locales`);
    }
  }

  return normalizedLocale;
}

/**
 * Finds the matching NgLocale for a locale
 *
 * @internal
 * @experimental i18n support is experimental.
 */
export function findNgLocale(locale: string, localeData: NgLocale[] | null): NgLocale {
  const currentLocale = getNormalizedLocale(locale);

  if (localeData) {
    const match =
        localeData.find((providedLocale: NgLocale) => providedLocale.localeId === currentLocale);
    if (match) {
      return match;
    }
  }

  if (currentLocale === 'en') {
    return NgLocaleEn;
  } else {
    throw new Error(`Missing NgLocale data for the locale "${locale}"`);
  }
}
