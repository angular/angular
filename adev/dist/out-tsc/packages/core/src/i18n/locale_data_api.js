/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {global} from '../util/global';
import localeEn from './locale_en';
/**
 * This const is used to store the locale data registered with `registerLocaleData`
 */
let LOCALE_DATA = {};
/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
export function registerLocaleData(data, localeId, extraData) {
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
export function findLocaleData(locale) {
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
    701 /* RuntimeErrorCode.MISSING_LOCALE_DATA */,
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
export function getLocaleCurrencyCode(locale) {
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
export function getLocalePluralCase(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}
/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`
 * or from the global `ng.common.locale`.
 */
export function getLocaleData(normalizedLocale) {
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
 * Index of each type of locale data from the locale data array
 */
export var LocaleDataIndex;
(function (LocaleDataIndex) {
  LocaleDataIndex[(LocaleDataIndex['LocaleId'] = 0)] = 'LocaleId';
  LocaleDataIndex[(LocaleDataIndex['DayPeriodsFormat'] = 1)] = 'DayPeriodsFormat';
  LocaleDataIndex[(LocaleDataIndex['DayPeriodsStandalone'] = 2)] = 'DayPeriodsStandalone';
  LocaleDataIndex[(LocaleDataIndex['DaysFormat'] = 3)] = 'DaysFormat';
  LocaleDataIndex[(LocaleDataIndex['DaysStandalone'] = 4)] = 'DaysStandalone';
  LocaleDataIndex[(LocaleDataIndex['MonthsFormat'] = 5)] = 'MonthsFormat';
  LocaleDataIndex[(LocaleDataIndex['MonthsStandalone'] = 6)] = 'MonthsStandalone';
  LocaleDataIndex[(LocaleDataIndex['Eras'] = 7)] = 'Eras';
  LocaleDataIndex[(LocaleDataIndex['FirstDayOfWeek'] = 8)] = 'FirstDayOfWeek';
  LocaleDataIndex[(LocaleDataIndex['WeekendRange'] = 9)] = 'WeekendRange';
  LocaleDataIndex[(LocaleDataIndex['DateFormat'] = 10)] = 'DateFormat';
  LocaleDataIndex[(LocaleDataIndex['TimeFormat'] = 11)] = 'TimeFormat';
  LocaleDataIndex[(LocaleDataIndex['DateTimeFormat'] = 12)] = 'DateTimeFormat';
  LocaleDataIndex[(LocaleDataIndex['NumberSymbols'] = 13)] = 'NumberSymbols';
  LocaleDataIndex[(LocaleDataIndex['NumberFormats'] = 14)] = 'NumberFormats';
  LocaleDataIndex[(LocaleDataIndex['CurrencyCode'] = 15)] = 'CurrencyCode';
  LocaleDataIndex[(LocaleDataIndex['CurrencySymbol'] = 16)] = 'CurrencySymbol';
  LocaleDataIndex[(LocaleDataIndex['CurrencyName'] = 17)] = 'CurrencyName';
  LocaleDataIndex[(LocaleDataIndex['Currencies'] = 18)] = 'Currencies';
  LocaleDataIndex[(LocaleDataIndex['Directionality'] = 19)] = 'Directionality';
  LocaleDataIndex[(LocaleDataIndex['PluralCase'] = 20)] = 'PluralCase';
  LocaleDataIndex[(LocaleDataIndex['ExtraData'] = 21)] = 'ExtraData';
})(LocaleDataIndex || (LocaleDataIndex = {}));
/**
 * Returns the canonical form of a locale name - lowercase with `_` replaced with `-`.
 */
function normalizeLocale(locale) {
  return locale.toLowerCase().replace(/_/g, '-');
}
//# sourceMappingURL=locale_data_api.js.map
