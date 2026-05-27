/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {global} from '../util/global';

import localeEn from './locale_en';

/**
 * This const is used to store the locale data registered with `registerLocaleData`
 */
let LOCALE_DATA: {[localeId: string]: any} = {};

/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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

  throw new RuntimeError(
    RuntimeErrorCode.MISSING_LOCALE_DATA,
    ngDevMode && `Missing locale data for the locale "${locale}".`,
  );
}

/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 */
export function getLocaleCurrencyCode(locale: string): string | null {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.CurrencyCode] || null;
}

/**
 * Retrieves the plural function used by ICU expressions to determine the plural case to use
 * for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The plural function for the locale.
 * @see {@link NgPlural}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
export function getLocalePluralCase(locale: string): (value: number) => number {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}

/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`
 * or from the global `ng.common.locale`.
 */
export function getLocaleData(normalizedLocale: string): any {
  if (!(normalizedLocale in LOCALE_DATA)) {
    LOCALE_DATA[normalizedLocale] =
      global.ng &&
      global.ng.common &&
      global.ng.common.locales &&
      global.ng.common.locales[normalizedLocale];
  }
  return LOCALE_DATA[normalizedLocale];
}

/**
 * Helper function to remove all the locale data from `LOCALE_DATA`.
 */
export function unregisterAllLocaleData() {
  LOCALE_DATA = {};
}

/**
 * Index of each type of locale data from the locale data array.
 * Not an enum: TS enums compile to IIFE side-effects and are not tree-shakable,
 * even when unused. Using a plain const object with 'as const' instead.
 */
export const LocaleDataIndex = {
  LocaleId: 0,
  DayPeriodsFormat: 1,
  DayPeriodsStandalone: 2,
  DaysFormat: 3,
  DaysStandalone: 4,
  MonthsFormat: 5,
  MonthsStandalone: 6,
  Eras: 7,
  FirstDayOfWeek: 8,
  WeekendRange: 9,
  DateFormat: 10,
  TimeFormat: 11,
  DateTimeFormat: 12,
  NumberSymbols: 13,
  NumberFormats: 14,
  CurrencyCode: 15,
  CurrencySymbol: 16,
  CurrencyName: 17,
  Currencies: 18,
  Directionality: 19,
  PluralCase: 20,
  ExtraData: 21,
} as const;

/**
 * Index of each type of locale data from the extra locale data array
 */
export const enum ExtraLocaleDataIndex {
  ExtraDayPeriodFormats = 0,
  ExtraDayPeriodStandalone,
  ExtraDayPeriodsRules,
}

/**
 * Index of each value in currency data (used to describe CURRENCIES_EN in currencies.ts)
 */
export const enum CurrencyIndex {
  Symbol = 0,
  SymbolNarrow,
  NbOfDigits,
}

/**
 * Returns the canonical form of a locale name - lowercase with `_` replaced with `-`.
 */
function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}
