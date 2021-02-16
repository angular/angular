/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormatWidth, FormStyle, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat, NumberSymbol, Time, TranslationWidth} from './locale_data_api';

export const ISO8601_DATE_REGEX =
    /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
const NAMED_FORMATS: {[localeId: string]: {[format: string]: string}} = {};
const DATE_FORMATS_SPLIT =
    /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;

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
  FractionalSeconds,
  Day
}

enum TranslationType {
  DayPeriods,
  Days,
  Months,
  Eras
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * @param value The date to format, as a Date, or a number (milliseconds since UTC epoch)
 * or an [ISO date-time string](https://www.w3.org/TR/NOTE-datetime).
 * @param format The date-time components to include. See `DatePipe` for details.
 * @param locale A locale code for the locale format rules to use.
 * @param timezone The time zone. A time zone offset from GMT (such as `'+0430'`),
 * or a standard UTC/GMT or continental US time zone abbreviation.
 * If not specified, uses host system settings.
 *
 * @returns The formatted date string.
 *
 * @see `DatePipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatDate(
    value: string|number|Date, format: string, locale: string, timezone?: string): string {
  let date = toDate(value);
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

/**
 * Create a new Date object with the given date value, and the time set to midnight.
 *
 * We cannot use `new Date(year, month, date)` because it maps years between 0 and 99 to 1900-1999.
 * See: https://github.com/angular/angular/issues/40377
 *
 * Note that this function returns a Date object whose time is midnight in the current locale's
 * timezone. In the future we might want to change this to be midnight in UTC, but this would be a
 * considerable breaking change.
 */
function createDate(year: number, month: number, date: number): Date {
  // The `newDate` is set to midnight (UTC) on January 1st 1970.
  // - In PST this will be December 31st 1969 at 4pm.
  // - In GMT this will be January 1st 1970 at 1am.
  // Note that they even have different years, dates and months!
  const newDate = new Date(0);

  // `setFullYear()` allows years like 0001 to be set correctly. This function does not
  // change the internal time of the date.
  // Consider calling `setFullYear(2019, 8, 20)` (September 20, 2019).
  // - In PST this will now be September 20, 2019 at 4pm
  // - In GMT this will now be September 20, 2019 at 1am

  newDate.setFullYear(year, month, date);
  // We want the final date to be at local midnight, so we reset the time.
  // - In PST this will now be September 20, 2019 at 12am
  // - In GMT this will now be September 20, 2019 at 12am
  newDate.setHours(0, 0, 0);

  return newDate;
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
  let strNum = String(num);
  while (strNum.length < digits) {
    strNum = '0' + strNum;
  }
  if (trim) {
    strNum = strNum.substr(strNum.length - digits);
  }
  return neg + strNum;
}

function formatFractionalSeconds(milliseconds: number, digits: number): string {
  const strMs = padNumber(milliseconds, 3);
  return strMs.substr(0, digits);
}

/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(
    name: DateType, size: number, offset: number = 0, trim = false,
    negWrap = false): DateFormatter {
  return function(date: Date, locale: string): string {
    let part = getDatePart(name, date);
    if (offset > 0 || part > -offset) {
      part += offset;
    }

    if (name === DateType.Hours) {
      if (part === 0 && offset === -12) {
        part = 12;
      }
    } else if (name === DateType.FractionalSeconds) {
      return formatFractionalSeconds(part, size);
    }

    const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    return padNumber(part, size, localeMinus, trim, negWrap);
  };
}

function getDatePart(part: DateType, date: Date): number {
  switch (part) {
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
    case DateType.FractionalSeconds:
      return date.getMilliseconds();
    case DateType.Day:
      return date.getDay();
    default:
      throw new Error(`Unknown DateType value "${part}".`);
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
        const index = rules.findIndex(rule => {
          if (Array.isArray(rule)) {
            // morning, afternoon, evening, night
            const [from, to] = rule;
            const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
            const beforeTo =
                (currentHours < to.hours ||
                 (currentHours === to.hours && currentMinutes < to.minutes));
            // We must account for normal rules that span a period during the day (e.g. 6am-9am)
            // where `from` is less (earlier) than `to`. But also rules that span midnight (e.g.
            // 10pm - 5am) where `from` is greater (later!) than `to`.
            //
            // In the first case the current time must be BOTH after `from` AND before `to`
            // (e.g. 8am is after 6am AND before 10am).
            //
            // In the second case the current time must be EITHER after `from` OR before `to`
            // (e.g. 4am is before 5am but not after 10pm; and 11pm is not before 5am but it is
            // after 10pm).
            if (from.hours < to.hours) {
              if (afterFrom && beforeTo) {
                return true;
              }
            } else if (afterFrom || beforeTo) {
              return true;
            }
          } else {  // noon or midnight
            if (rule.hours === currentHours && rule.minutes === currentMinutes) {
              return true;
            }
          }
          return false;
        });
        if (index !== -1) {
          return dayPeriods[index];
        }
      }
      // if no rules for the day periods, we use am/pm by default
      return getLocaleDayPeriods(locale, form, <TranslationWidth>width)[currentHours < 12 ? 0 : 1];
    case TranslationType.Eras:
      return getLocaleEraNames(locale, <TranslationWidth>width)[date.getFullYear() <= 0 ? 0 : 1];
    default:
      // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
      // However Closure Compiler does not understand that and reports an error in typed mode.
      // The `throw new Error` below works around the problem, and the unexpected: never variable
      // makes sure tsc still checks this code is unreachable.
      const unexpected: never = name;
      throw new Error(`unexpected translation type ${unexpected}`);
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
  const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
  return createDate(
      year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}

function getThursdayThisWeek(datetime: Date) {
  return createDate(
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
      const thisThurs = getThursdayThisWeek(date);
      // Some days of a year are part of next year according to ISO 8601.
      // Compute the firstThurs from the year of this week's Thursday
      const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
      const diff = thisThurs.getTime() - firstThurs.getTime();
      result = 1 + Math.round(diff / 6.048e8);  // 6.048e8 ms per week
    }

    return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  };
}

/**
 * Returns a date formatter that provides the week-numbering year for the input date.
 */
function weekNumberingYearGetter(size: number, trim = false): DateFormatter {
  return function(date: Date, locale: string) {
    const thisThurs = getThursdayThisWeek(date);
    const weekNumberingYear = thisThurs.getFullYear();
    return padNumber(
        weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
  };
}

type DateFormatter = (date: Date, locale: string, offset: number) => string;

const DATE_FORMATS: {[format: string]: DateFormatter} = {};

// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: U, Q, D, F, e, j, J, C, A, v, V, X, x
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

    // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'Y':
      formatter = weekNumberingYearGetter(1);
      break;
    // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
    // 2010 => 10)
    case 'YY':
      formatter = weekNumberingYearGetter(2, true);
      break;
    // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
    // 2010 => 2010)
    case 'YYY':
      formatter = weekNumberingYearGetter(3);
      break;
    // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case 'YYYY':
      formatter = weekNumberingYearGetter(4);
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

    // Day of the Week StandAlone (1, 1, Mon, Monday, M, Mo)
    case 'c':
    case 'cc':
      formatter = dateGetter(DateType.Day, 1);
      break;
    case 'ccc':
      formatter =
          dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'cccc':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'ccccc':
      formatter =
          dateStrGetter(TranslationType.Days, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    case 'cccccc':
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short, FormStyle.Standalone);
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

    // Fractional second
    case 'S':
      formatter = dateGetter(DateType.FractionalSeconds, 1);
      break;
    case 'SS':
      formatter = dateGetter(DateType.FractionalSeconds, 2);
      break;
    case 'SSS':
      formatter = dateGetter(DateType.FractionalSeconds, 3);
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
  // Support: IE 11 only, Edge 13-15+
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

/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
export function toDate(value: string|number|Date): Date {
  if (isDate(value)) {
    return value;
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return new Date(value);
  }

  if (typeof value === 'string') {
    value = value.trim();

    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
      /* For ISO Strings without time the day, month and year must be extracted from the ISO String
      before Date creation to avoid time offset and errors in the new Date.
      If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
      date, some browsers (e.g. IE 9) will throw an invalid Date error.
      If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
      is applied.
      Note: ISO months are 0 for January, 1 for February, ... */
      const [y, m = 1, d = 1] = value.split('-').map((val: string) => +val);
      return createDate(y, m - 1, d);
    }

    const parsedNb = parseFloat(value);

    // any string that only contains numbers, like "1234" but not like "1234hello"
    if (!isNaN(value as any - parsedNb)) {
      return new Date(parsedNb);
    }

    let match: RegExpMatchArray|null;
    if (match = value.match(ISO8601_DATE_REGEX)) {
      return isoStringToDate(match);
    }
  }

  const date = new Date(value as any);
  if (!isDate(date)) {
    throw new Error(`Unable to convert "${value}" into a date`);
  }
  return date;
}

/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match: RegExpMatchArray): Date {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;

  // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;

  // if there is a timezone defined like "+01:00" or "+0100"
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  // The ECMAScript specification (https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.11)
  // defines that `DateTime` milliseconds should always be rounded down, so that `999.9ms`
  // becomes `999ms`.
  const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}

export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.valueOf());
}
