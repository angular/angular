/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This const is used to store the locale data registered with `registerLocaleData`
 */
export const LOCALE_DATA: {[localeId: string]: any} = {};

/**
 * Index of each type of locale data from the locale data array
 */
export enum LocaleDataIndex {
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
