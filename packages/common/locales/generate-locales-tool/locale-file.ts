/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {removeDuplicates} from './array-deduplication';
import {CldrLocaleData} from './cldr-data';
import {getDayPeriodsAmPm} from './day-periods';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocaleCurrencies, getCurrencySettings} from './locale-currencies';
import {stringify} from './object-stringify';
import {getPluralFunction} from './plural-function';

const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Generate contents for the basic locale data file */
export function generateLocale(
    locale: string, localeData: CldrLocaleData, baseCurrencies: BaseCurrencies) {
  return `${fileHeader}
const u = undefined;

${getPluralFunction(localeData)}

export default ${generateBasicLocaleString(locale, localeData, baseCurrencies)};
`;
}


/**
 * Collect up the basic locale data [ localeId, dateTime, number, currency, directionality,
 * pluralCase ].
 */
export function generateBasicLocaleString(
    locale: string, localeData: CldrLocaleData, baseCurrencies: BaseCurrencies) {
  let data = stringify([
               locale,
               ...getDateTimeTranslations(localeData),
               ...getDateTimeSettings(localeData),
               ...getNumberSettings(localeData),
               ...getCurrencySettings(locale, localeData),
               generateLocaleCurrencies(localeData, baseCurrencies),
               getDirectionality(localeData),
             ])
                 // We remove "undefined" added by spreading arrays when there is no value
                 .replace(/undefined/g, 'u');

  // adding plural function after, because we don't want it as a string. The function named `plural`
  // is expected to be available in the file. See `generateLocale` above.
  data = data.replace(/\]$/, ', plural]');
  return data;
}

/**
 * Returns the writing direction for a locale
 * @returns 'rtl' | 'ltr'
 */
function getDirectionality(localeData: CldrLocaleData): 'rtl'|'ltr' {
  const rtl = localeData.get('scriptMetadata/{script}/rtl');
  return rtl === 'YES' ? 'rtl' : 'ltr';
}


/**
 * Returns dateTime data for a locale
 * @returns [ firstDayOfWeek, weekendRange, formats ]
 */
function getDateTimeSettings(localeData: CldrLocaleData) {
  return [
    getFirstDayOfWeek(localeData), getWeekendRange(localeData), ...getDateTimeFormats(localeData)
  ];
}



/**
 * Returns the number symbols and formats for a locale
 * @returns [ symbols, formats ]
 * symbols: [ decimal, group, list, percentSign, plusSign, minusSign, exponential,
 * superscriptingExponent, perMille, infinity, nan, timeSeparator, currencyDecimal?, currencyGroup?
 * ]
 * formats: [ currency, decimal, percent, scientific ]
 */
function getNumberSettings(localeData: CldrLocaleData) {
  const decimalFormat = localeData.main('numbers/decimalFormats-numberSystem-latn/standard');
  const percentFormat = localeData.main('numbers/percentFormats-numberSystem-latn/standard');
  const scientificFormat = localeData.main('numbers/scientificFormats-numberSystem-latn/standard');
  const currencyFormat = localeData.main('numbers/currencyFormats-numberSystem-latn/standard');
  const symbols = localeData.main('numbers/symbols-numberSystem-latn');
  const symbolValues = [
    symbols.decimal,
    symbols.group,
    symbols.list,
    symbols.percentSign,
    symbols.plusSign,
    symbols.minusSign,
    symbols.exponential,
    symbols.superscriptingExponent,
    symbols.perMille,
    symbols.infinity,
    symbols.nan,
    symbols.timeSeparator,
  ];

  if (symbols.currencyDecimal || symbols.currencyGroup) {
    symbolValues.push(symbols.currencyDecimal);
  }

  if (symbols.currencyGroup) {
    symbolValues.push(symbols.currencyGroup);
  }

  return [symbolValues, [decimalFormat, percentFormat, currencyFormat, scientificFormat]];
}

/**
 * Returns week-end range for a locale, based on US week days
 * @returns [number, number]
 */
function getWeekendRange(localeData: CldrLocaleData) {
  const startDay =
      localeData.get(`supplemental/weekData/weekendStart/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendStart/001');
  const endDay =
      localeData.get(`supplemental/weekData/weekendEnd/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendEnd/001');
  return [WEEK_DAYS.indexOf(startDay), WEEK_DAYS.indexOf(endDay)];
}



/**
 * Returns date-related translations for a locale
 * @returns [ dayPeriodsFormat, dayPeriodsStandalone, daysFormat, dayStandalone, monthsFormat,
 * monthsStandalone, eras ]
 * each value: [ narrow, abbreviated, wide, short? ]
 */
function getDateTimeTranslations(localeData: CldrLocaleData) {
  const dayNames = localeData.main(`dates/calendars/gregorian/days`);
  const monthNames = localeData.main(`dates/calendars/gregorian/months`);
  const erasNames = localeData.main(`dates/calendars/gregorian/eras`);
  const dayPeriods = getDayPeriodsAmPm(localeData);

  const dayPeriodsFormat = removeDuplicates([
    Object.values(dayPeriods.format.narrow), Object.values(dayPeriods.format.abbreviated),
    Object.values(dayPeriods.format.wide)
  ]);

  const dayPeriodsStandalone = removeDuplicates([
    Object.values(dayPeriods['stand-alone'].narrow),
    Object.values(dayPeriods['stand-alone'].abbreviated),
    Object.values(dayPeriods['stand-alone'].wide)
  ]);

  const daysFormat = removeDuplicates([
    Object.values(dayNames.format.narrow), Object.values(dayNames.format.abbreviated),
    Object.values(dayNames.format.wide), Object.values(dayNames.format.short)
  ]);

  const daysStandalone = removeDuplicates([
    Object.values(dayNames['stand-alone'].narrow),
    Object.values(dayNames['stand-alone'].abbreviated), Object.values(dayNames['stand-alone'].wide),
    Object.values(dayNames['stand-alone'].short)
  ]);

  const monthsFormat = removeDuplicates([
    Object.values(monthNames.format.narrow), Object.values(monthNames.format.abbreviated),
    Object.values(monthNames.format.wide)
  ]);

  const monthsStandalone = removeDuplicates([
    Object.values(monthNames['stand-alone'].narrow),
    Object.values(monthNames['stand-alone'].abbreviated),
    Object.values(monthNames['stand-alone'].wide)
  ]);

  const eras = removeDuplicates([
    [erasNames.eraNarrow['0'], erasNames.eraNarrow['1']],
    [erasNames.eraAbbr['0'], erasNames.eraAbbr['1']],
    [erasNames.eraNames['0'], erasNames.eraNames['1']]
  ]);

  const dateTimeTranslations = [
    ...removeDuplicates([dayPeriodsFormat, dayPeriodsStandalone]),
    ...removeDuplicates([daysFormat, daysStandalone]),
    ...removeDuplicates([monthsFormat, monthsStandalone]), eras
  ];

  return dateTimeTranslations;
}


/**
 * Returns date, time and dateTime formats for a locale
 * @returns [dateFormats, timeFormats, dateTimeFormats]
 * each format: [ short, medium, long, full ]
 */
function getDateTimeFormats(localeData: CldrLocaleData) {
  function getFormats(data: any) {
    return removeDuplicates([
      data.short._value || data.short, data.medium._value || data.medium,
      data.long._value || data.long, data.full._value || data.full
    ]);
  }

  const dateFormats = localeData.main('dates/calendars/gregorian/dateFormats');
  const timeFormats = localeData.main('dates/calendars/gregorian/timeFormats');
  const dateTimeFormats = localeData.main('dates/calendars/gregorian/dateTimeFormats');

  return [getFormats(dateFormats), getFormats(timeFormats), getFormats(dateTimeFormats)];
}


/**
 * Returns the first day of the week, based on US week days
 * @returns number
 */
function getFirstDayOfWeek(localeData: CldrLocaleData) {
  // The `cldrjs` package does not provide proper types for `supplemental`. The
  // types are part of the package but embedded incorrectly and not usable.
  return WEEK_DAYS.indexOf((localeData as any).supplemental.weekData.firstDay());
}
