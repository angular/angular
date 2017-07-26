/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormStyle, FormatWidth, NumberSymbol, Time, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat} from './locale_data_api';

const NAMED_FORMATS: {[localeId: string]: {[format: string]: string}} = {};
const DATE_FORMATS_SPLIT =
    /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;

enum ZoneWidth {
  Short,
  ShortGMT,
  Long,
  Extended
}

enum DateType {
  FullYear,
  Month,
  Date,
  Hours,
  Minutes,
  Seconds,
  Milliseconds,
  Day
}

enum TranslationType {
  DayPeriods,
  Days,
  Months,
  Eras
}

/**
 * Transforms a date to a locale string based on a pattern and a timezone
 *
 * @internal
 */
export function formatDate(date: Date, format: string, locale: string, timezone?: string): string {
  const namedFormat = getNamedFormat(locale, format);
  format = namedFormat || format;

  let parts: string[] = [];
  let match;
  while (format) {
    match = DATE_FORMATS_SPLIT.exec(format);
    if (match) {
      parts = parts.concat(match.slice(1));
      const part = parts.pop();
      if (!part) {
        break;
      }
      format = part;
    } else {
      parts.push(format);
      break;
    }
  }

  let dateTimezoneOffset = date.getTimezoneOffset();
  if (timezone) {
    dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    date = convertTimezoneToLocal(date, timezone, true);
  }

  let text = '';
  parts.forEach(value => {
    const dateFormatter = getDateFormatter(value);
    text += dateFormatter ?
        dateFormatter(date, locale, dateTimezoneOffset) :
        value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
  });

  return text;
}

function getNamedFormat(locale: string, format: string): string {
  const localeId = getLocaleId(locale);
  NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};

  if (NAMED_FORMATS[localeId][format]) {
    return NAMED_FORMATS[localeId][format];
  }

  let formatValue = '';
  switch (format) {
    case 'shortDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
      break;
    case 'mediumDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
      break;
    case 'longDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
      break;
    case 'fullDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
      break;
    case 'shortTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
      break;
    case 'mediumTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
      break;
    case 'longTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
      break;
    case 'fullTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
      break;
    case 'short':
      const shortTime = getNamedFormat(locale, 'shortTime');
      const shortDate = getNamedFormat(locale, 'shortDate');
      formatValue = formatDateTime(
          getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
      break;
    case 'medium':
      const mediumTime = getNamedFormat(locale, 'mediumTime');
      const mediumDate = getNamedFormat(locale, 'mediumDate');
      formatValue = formatDateTime(
          getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
      break;
    case 'long':
      const longTime = getNamedFormat(locale, 'longTime');
      const longDate = getNamedFormat(locale, 'longDate');
      formatValue =
          formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
      break;
    case 'full':
      const fullTime = getNamedFormat(locale, 'fullTime');
      const fullDate = getNamedFormat(locale, 'fullDate');
      formatValue =
          formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
      break;
  }
  if (formatValue) {
    NAMED_FORMATS[localeId][format] = formatValue;
  }
  return formatValue;
}

function formatDateTime(str: string, opt_values: string[]) {
  if (opt_values) {
    str = str.replace(/\{([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ? opt_values[key] : match;
    });
  }
  return str;
}

function padNumber(
    num: number, digits: number, minusSign = '-', trim?: boolean, negWrap?: boolean): string {
  let neg = '';
  if (num < 0 || (negWrap && num <= 0)) {
    if (negWrap) {
      num = -num + 1;
    } else {
      num = -num;
      neg = minusSign;
    }
  }
  let strNum = '' + num;
  while (strNum.length < digits) strNum = '0' + strNum;
  if (trim) {
    strNum = strNum.substr(strNum.length - digits);
  }
  return neg + strNum;
}

/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(
    name: DateType, size: number, offset: number = 0, trim = false,
    negWrap = false): DateFormatter {
  return function(date: Date, locale: string): string {
    let part = getDatePart(name, date, size);
    if (offset > 0 || part > -offset) {
      part += offset;
    }
    if (name === DateType.Hours && part === 0 && offset === -12) {
      part = 12;
    }
    return padNumber(
        part, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim, negWrap);
  };
}

function getDatePart(name: DateType, date: Date, size: number): number {
  switch (name) {
    case DateType.FullYear:
      return date.getFullYear();
    case DateType.Month:
      return date.getMonth();
    case DateType.Date:
      return date.getDate();
    case DateType.Hours:
      return date.getHours();
    case DateType.Minutes:
      return date.getMinutes();
    case DateType.Seconds:
      return date.getSeconds();
    case DateType.Milliseconds:
      const div = size === 1 ? 100 : (size === 2 ? 10 : 1);
      return Math.round(date.getMilliseconds() / div);
    case DateType.Day:
      return date.getDay();
    default:
      throw new Error(`Unknown DateType value "${name}".`);
  }
}

/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(
    name: TranslationType, width: TranslationWidth, form: FormStyle = FormStyle.Format,
    extended = false): DateFormatter {
  return function(date: Date, locale: string): string {
    return getDateTranslation(date, locale, name, width, form, extended);
  };
}

/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(
    date: Date, locale: string, name: TranslationType, width: TranslationWidth, form: FormStyle,
    extended: boolean) {
  switch (name) {
    case TranslationType.Months:
      return getLocaleMonthNames(locale, form, width)[date.getMonth()];
    case TranslationType.Days:
      return getLocaleDayNames(locale, form, width)[date.getDay()];
    case TranslationType.DayPeriods:
      const currentHours = date.getHours();
      const currentMinutes = date.getMinutes();
      if (extended) {
        const rules = getLocaleExtraDayPeriodRules(locale);
        const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
        let result;
        rules.forEach((rule: Time | [Time, Time], index: number) => {
          if (Array.isArray(rule)) {
            // morning, afternoon, evening, night
            const {hours: hoursFrom, minutes: minutesFrom} = rule[0];
            const {hours: hoursTo, minutes: minutesTo} = rule[1];
            if (currentHours >= hoursFrom && currentMinutes >= minutesFrom &&
                (currentHours < hoursTo ||
                 (currentHours === hoursTo && currentMinutes < minutesTo))) {
              result = dayPeriods[index];
            }
          } else {  // noon or midnight
            const {hours, minutes} = rule;
            if (hours === currentHours && minutes === currentMinutes) {
              result = dayPeriods[index];
            }
          }
        });
        if (result) {
          return result;
        }
      }
      // if no rules for the day periods, we use am/pm by default
      return getLocaleDayPeriods(locale, form, <TranslationWidth>width)[currentHours < 12 ? 0 : 1];
    case TranslationType.Eras:
      return getLocaleEraNames(locale, <TranslationWidth>width)[date.getFullYear() <= 0 ? 0 : 1];
  }
}

/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width: ZoneWidth): DateFormatter {
  return function(date: Date, locale: string, offset: number) {
    const zone = -1 * offset;
    const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
    switch (width) {
      case ZoneWidth.Short:
        return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) +
            padNumber(Math.abs(zone % 60), 2, minusSign);
      case ZoneWidth.ShortGMT:
        return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 1, minusSign);
      case ZoneWidth.Long:
        return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
            padNumber(Math.abs(zone % 60), 2, minusSign);
      case ZoneWidth.Extended:
        if (offset === 0) {
          return 'Z';
        } else {
          return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
              padNumber(Math.abs(zone % 60), 2, minusSign);
        }
      default:
        throw new Error(`Unknown zone width "${width}"`);
    }
  };
}

const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year: number) {
  const firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
  return new Date(
      year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}

function getThursdayThisWeek(datetime: Date) {
  return new Date(
      datetime.getFullYear(), datetime.getMonth(),
      datetime.getDate() + (THURSDAY - datetime.getDay()));
}

function weekGetter(size: number, monthBased = false): DateFormatter {
  return function(date: Date, locale: string) {
    let result;
    if (monthBased) {
      const nbDaysBefore1stDayOfMonth =
          new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
      const today = date.getDate();
      result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
    } else {
      const firstThurs = getFirstThursdayOfYear(date.getFullYear());
      const thisThurs = getThursdayThisWeek(date);
      const diff = thisThurs.getTime() - firstThurs.getTime();
      result = 1 + Math.round(diff / 6.048e8);  // 6.048e8 ms per week
    }

    return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  };
}

type DateFormatter = (date: Date, locale: string, offset?: number) => string;

const DATE_FORMATS: {[format: string]: DateFormatter} = {};

// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: Y, U, Q, D, F, e, c, j, J, C, A, v, V, X, x
function getDateFormatter(format: string): DateFormatter|null {
  if (DATE_FORMATS[format]) {
    return DATE_FORMATS[format];
  }
  let formatter;
  switch (format) {
    // Era name (AD/BC)
    case 'G':
    case 'GG':
    case 'GGG':
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
      break;
    case 'GGGG':
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
      break;
    case 'GGGGG':
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
      break;

    // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'y':
      formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
      break;
    // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yy':
      formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
      break;
    // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yyy':
      formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
      break;
    // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case 'yyyy':
      formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
      break;

    // Month of the year (1-12), numeric
    case 'M':
    case 'L':
      formatter = dateGetter(DateType.Month, 1, 1);
      break;
    case 'MM':
    case 'LL':
      formatter = dateGetter(DateType.Month, 2, 1);
      break;

    // Month of the year (January, ...), string, format
    case 'MMM':
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
      break;
    case 'MMMM':
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
      break;
    case 'MMMMM':
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
      break;

    // Month of the year (January, ...), string, standalone
    case 'LLL':
      formatter =
          dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'LLLL':
      formatter =
          dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'LLLLL':
      formatter =
          dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
      break;

    // Week of the year (1, ... 52)
    case 'w':
      formatter = weekGetter(1);
      break;
    case 'ww':
      formatter = weekGetter(2);
      break;

    // Week of the month (1, ...)
    case 'W':
      formatter = weekGetter(1, true);
      break;

    // Day of the month (1-31)
    case 'd':
      formatter = dateGetter(DateType.Date, 1);
      break;
    case 'dd':
      formatter = dateGetter(DateType.Date, 2);
      break;

    // Day of the Week
    case 'E':
    case 'EE':
    case 'EEE':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
      break;
    case 'EEEE':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
      break;
    case 'EEEEE':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
      break;
    case 'EEEEEE':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
      break;

    // Generic period of the day (am-pm)
    case 'a':
    case 'aa':
    case 'aaa':
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
      break;
    case 'aaaa':
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
      break;
    case 'aaaaa':
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
      break;

    // Extended period of the day (midnight, at night, ...), standalone
    case 'b':
    case 'bb':
    case 'bbb':
      formatter = dateStrGetter(
          TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
      break;
    case 'bbbb':
      formatter = dateStrGetter(
          TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
      break;
    case 'bbbbb':
      formatter = dateStrGetter(
          TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
      break;

    // Extended period of the day (midnight, night, ...), standalone
    case 'B':
    case 'BB':
    case 'BBB':
      formatter = dateStrGetter(
          TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
      break;
    case 'BBBB':
      formatter =
          dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
      break;
    case 'BBBBB':
      formatter = dateStrGetter(
          TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
      break;

    // Hour in AM/PM, (1-12)
    case 'h':
      formatter = dateGetter(DateType.Hours, 1, -12);
      break;
    case 'hh':
      formatter = dateGetter(DateType.Hours, 2, -12);
      break;

    // Hour of the day (0-23)
    case 'H':
      formatter = dateGetter(DateType.Hours, 1);
      break;
    // Hour in day, padded (00-23)
    case 'HH':
      formatter = dateGetter(DateType.Hours, 2);
      break;

    // Minute of the hour (0-59)
    case 'm':
      formatter = dateGetter(DateType.Minutes, 1);
      break;
    case 'mm':
      formatter = dateGetter(DateType.Minutes, 2);
      break;

    // Second of the minute (0-59)
    case 's':
      formatter = dateGetter(DateType.Seconds, 1);
      break;
    case 'ss':
      formatter = dateGetter(DateType.Seconds, 2);
      break;

    // Fractional second padded (0-9)
    case 'S':
      formatter = dateGetter(DateType.Milliseconds, 1);
      break;
    case 'SS':
      formatter = dateGetter(DateType.Milliseconds, 2);
      break;
    // = millisecond
    case 'SSS':
      formatter = dateGetter(DateType.Milliseconds, 3);
      break;


    // Timezone ISO8601 short format (-0430)
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      formatter = timeZoneGetter(ZoneWidth.Short);
      break;
    // Timezone ISO8601 extended format (-04:30)
    case 'ZZZZZ':
      formatter = timeZoneGetter(ZoneWidth.Extended);
      break;

    // Timezone GMT short format (GMT+4)
    case 'O':
    case 'OO':
    case 'OOO':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'z':
    case 'zz':
    case 'zzz':
      formatter = timeZoneGetter(ZoneWidth.ShortGMT);
      break;
    // Timezone GMT long format (GMT+0430)
    case 'OOOO':
    case 'ZZZZ':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'zzzz':
      formatter = timeZoneGetter(ZoneWidth.Long);
      break;
    default:
      return null;
  }
  DATE_FORMATS[format] = formatter;
  return formatter;
}

function timezoneToOffset(timezone: string, fallback: number): number {
  // Support: IE 9-11 only, Edge 13-15+
  // IE/Edge do not "understand" colon (`:`) in timezone
  timezone = timezone.replace(/:/g, '');
  const requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
  return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}

function addDateMinutes(date: Date, minutes: number) {
  date = new Date(date.getTime());
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function convertTimezoneToLocal(date: Date, timezone: string, reverse: boolean): Date {
  const reverseValue = reverse ? -1 : 1;
  const dateTimezoneOffset = date.getTimezoneOffset();
  const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
