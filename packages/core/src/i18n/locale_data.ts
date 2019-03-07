/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @publicApi
 */
export const LOCALE_DATA: {[localeId: string]: any} = {};

/**
 * Register global data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale data.
 *
 * @publicApi
 */
// The signature registerLocaleData(data: any, extraData?: any) is deprecated since v5.1
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
  Currencies,
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

/**
 * Index of each value in currency data (used to describe CURRENCIES_EN in currencies.ts)
 */
export const enum CurrencyIndex {Symbol = 0, SymbolNarrow, NbOfDigits}
