/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @experimental i18n support is experimental.
 */
export const LOCALE_DATA: {[localeId: string]: any} = {};

/**
 * Register global data to be used internally by Angular. See the
 * {@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale data.
 *
 * @experimental i18n support is experimental.
 */
export function registerLocaleData(data: any, extraData?: any) {
  const localeId = data[LocaleDataIndex.LocaleId].toLowerCase().replace(/_/g, '-');
  LOCALE_DATA[localeId] = data;
  if (extraData) {
    LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData;
  }
}

/**
 * Index of each type of locale data from the locale data array
 */
export const enum LocaleDataIndex {
  LocaleId = 0,
  DayPeriodsFormat,
  DayPeriodsStandalone,
  DaysFormat,
  DaysStandalone,
  MonthsFormat,
  MonthsStandalone,
  Eras,
  FirstDayOfWeek,
  WeekendRange,
  DateFormat,
  TimeFormat,
  DateTimeFormat,
  NumberSymbols,
  NumberFormats,
  CurrencySymbol,
  CurrencyName,
  PluralCase,
  ExtraData
}

/**
 * Index of each type of locale data from the extra locale data array
 */
export const enum ExtraLocaleDataIndex {
  ExtraDayPeriodFormats = 0,
  ExtraDayPeriodStandalone,
  ExtraDayPeriodsRules
}
