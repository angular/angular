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
 * The signature registerLocaleData(data: any, extraData?: any) is deprecated since v5.1
 * Use registerLocaleData(data: any, localeId?: string, extraData?: any) instead.
 *
 * @experimental i18n support is experimental.
 */
// we cannot overwrite the function signature like we do with classes because it doesn't
// generate the correct api file.
// See: https://github.com/angular/ts-api-guardian/issues/22
// TODO(ocombe): uncomment the following lines when the bug is fixed
// export function registerLocaleData(data: any, extraData?: any): void;
// export function registerLocaleData(data: any, localeId?: string, extraData?: any): void;
export function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void {
  if (typeof localeId !== 'string') {
    extraData = extraData || localeId;
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
