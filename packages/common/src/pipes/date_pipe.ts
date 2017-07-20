/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_DATA, LOCALE_ID, NgLocale, Optional, Pipe, PipeTransform} from '@angular/core';

import {findNgLocale} from '../i18n/localization';

import {invalidPipeArgumentError} from './invalid_pipe_argument_error';
import {isNumeric} from './number_pipe';

const ZERO_CHAR = '0';
const DATE_FORMATS_SPLIT =
    /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
const ISO8601_DATE_REGEX =
    /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a date according to locale rules.
 * @howToUse `date_expression | date[:format[:timezone[:locale]]]`
 * @description
 *
 * Where:
 * - `expression` is a date object or a number (milliseconds since UTC epoch) or an ISO string
 * (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. The format can be predefined as
 *   shown below (all examples are given for `en-US`) or custom as shown in the table.
 *   - `'short'`: equivalent to `'M/d/yy, h:mm a'` (e.g. `9/3/2010, 12:05 PM`)
 *   - `'medium'`: equivalent to `'MMM d, y, h:mm:ss a'` (e.g. `Sep 3, 2010, 12:05:08 PM`)
 *   - `'long'`: equivalent to `'MMMM d, y, h:mm:ss a z'` (e.g. `Sep 3, 2010, 12:05:08 PM PDT`)
 *   - `'full'`: equivalent to `'EEEE, MMMM d, y, h:mm:ss a zzzz'` (e.g. `Sep 3, 2010, 12:05:08 PM
 * Pacific Daylight Time`)
 *   - `'shortDate'`: equivalent to `'M/d/yy'` (e.g. `9/3/2010`)
 *   - `'mediumDate'`: equivalent to `'MMM d, y'` (e.g. `Sep 3, 2010`)
 *   - `'longDate'`: equivalent to `'MMMM d, y'` (e.g. `September 3, 2010`)
 *   - `'fullDate'`: equivalent to `'EEEE, MMMM d, y'` (e.g. `Friday, September 3, 2010`)
 *   - `'shortTime'`: equivalent to `'h:mm a'` (e.g. `12:05 PM`)
 *   - `'mediumTime'`: equivalent to `'h:mm:ss a'` (e.g. `12:05:08 PM`)
 *   - `'longTime'`: equivalent to `'h:mm:ss a z'` (e.g. `12:05:08 PM PDT`)
 *   - `'fullTime'`: equivalent to `'h:mm:ss a zzzz'` (e.g. `12:05:08 PM Pacific Daylight Time`)
 *  - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *  abbreviations, but for general use, use a time zone offset, for example,
 *  `'+0430'` (4 hours, 30 minutes east of the Greenwich meridian)
 *  If not specified, the timezone of the browser will be used.
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
 *
 *
 *  | Field Type | Format | Description | Example Value |
 *  |------------|-------------|---------------|--------|
 *  | Era | G..GGG | Abbreviated | AD |
 *  | | GGGG | Wide | Anno Domini |
 *  | | GGGGG | Narrow | A |
 *  | Year | y |  Numeric: minimum digits | 2, 20, 201, 2017, 20173 |
 *  | | yy |  Numeric: 2 digits + zero padded | 02, 20, 01, 17, 73 |
 *  | | yyy |  Numeric: 3 digits + zero padded | 002, 020, 201, 2017, 20173 |
 *  | | yyyy |  Numeric: 4 digits or more + zero padded | 0002, 0020, 0201, 2017, 20173 |
 *  | Month | M |  Numeric: 1 digit | 9, 12 |
 *  | | MM |  Numeric: 2 digits + zero padded | 09, 12 |
 *  | | MMM | Abbreviated | Sep |
 *  | | MMMM | Wide | September |
 *  | | MMMMM | Narrow | S |
 *  | Month standalone | L |  Numeric: 1 digit | 9, 12 |
 *  | | LL |  Numeric: 2 digits + zero padded | 09, 12 |
 *  | | LLL | Abbreviated | Sep |
 *  | | LLLL | Wide | September |
 *  | | LLLLL | Narrow | S |
 *  | Week of year | w |  Numeric: minimum digits | 1... 53 |
 *  | | ww | Numeric: 2 digits + zero padded | 01... 53 |
 *  | Week of month | W |  Numeric: 1 digit | 1... 5 |
 *  | Day of month | d |  Numeric: minimum digits | 1 |
 *  | | dd |  Numeric: 2 digits + zero padded | 1 |
 *  | Week day | E..EEE | Abbreviated | Tue |
 *  | | EEEE | Wide | Tuesday |
 *  | | EEEEE | Narrow | T |
 *  | | EEEEEE | Short | Tu |
 *  | Period | a..aaa | Abbreviated | am/pm or AM/PM |
 *  | | aaaa | Wide | ante meridiem/post meridiem |
 *  | | aaaaa | Narrow | a/p |
 *  | Period | B..BBB | Abbreviated | mid. |
 *  | | BBBB | Wide | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  | | BBBBB | Narrow | md |
 *  | Period standalone | b..bbb | Abbreviated | mid. |
 *  | | bbbb | Wide | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  | | bbbbb | Narrow | md |
 *  | Hour 1-12 | h |  Numeric: minimum digits | 1, 12 |
 *  | | hh |  Numeric: 2 digits + zero padded | 01, 12 |
 *  | Hour 0-23 | H |  Numeric: minimum digits | 0, 23 |
 *  | | HH |  Numeric: 2 digits + zero padded | 00, 23 |
 *  | Minute | m |  Numeric: minimum digits | 8, 59 |
 *  | | mm |  Numeric: 2 digits + zero padded | 08, 59 |
 *  | Second | s |  Numeric: minimum digits | 0... 59 |
 *  | | ss |  Numeric: 2 digits + zero padded | 00... 59 |
 *  | Fractional seconds | S |  Numeric: 1 digit | 0... 9 |
 *  | | SS |  Numeric: 2 digits + zero padded | 00... 99 |
 *  | | SSS |  Numeric: 3 digits + zero padded (= milliseconds) | 000... 999 |
 *  | Zone | z..zzz | Short specific non location format (fallback to O) | PDT |
 *  | | zzzz | Long specific non location format (fallback to OOOO) | Pacific Daylight Time |
 *  | | Z..ZZZ | ISO8601 basic format | -0800 |
 *  | | ZZZZ | Long localized GMT format | GMT-8:00 |
 *  | | ZZZZZ | ISO8601 extended format + Z indicator for offset 0 (= XXXXX) | -08:00 |
 *  | | O..OOO | Short localized GMT format | GMT-8 |
 *  | | OOOO | Long localized GMT format | GMT-08:00 |
 *
 *
 * Timezone of the formatted text will be the local system timezone of the end-user's machine,
 * unless specified manually using the third parameter.
 *
 * When the expression is a ISO string without time (e.g. 2016-09-19) the time zone offset is not
 * applied and the formatted text will have the same day, month and year of the expression.
 *
 * WARNINGS:
 * - this pipe is marked as pure hence it will not be re-evaluated when the input is mutated.
 *   Instead users should treat the date as an immutable object and change the reference when the
 *   pipe needs to re-run (this is to avoid reformatting the date on every change detection run
 *   which would be an expensive operation).
 *
 * ### Examples
 *
 * Assuming `dateObj` is (year: 2015, month: 6, day: 15, hour: 21, minute: 43, second: 11)
 * in the _local_ time and locale is 'en-US':
 *
 * ```
 *     {{ dateObj | date }}               // output is 'Jun 15, 2015'
 *     {{ dateObj | date:'medium' }}      // output is 'Jun 15, 2015, 9:43:11 PM'
 *     {{ dateObj | date:'shortTime' }}   // output is '9:43 PM'
 *     {{ dateObj | date:'mm:ss' }}       // output is '43:11'
 * ```
 *
 * {@example common/pipes/ts/date_pipe.ts region='DatePipe'}
 *
 * @stable
 */
@Pipe({name: 'date', pure: true})
export class DatePipe implements PipeTransform {
  constructor(
      @Inject(LOCALE_ID) private locale: string,
      @Optional() @Inject(LOCALE_DATA) private localeData: NgLocale[]) {}

  transform(value: any, pattern: string = 'mediumDate', timezone?: string, locale?: string): string
      |null {
    let date: Date;
    const localeDatum = findNgLocale(locale || this.locale, this.localeData);
    const specialPatterns: {[key: string]: string} = {
      'short': formatDateTime(localeDatum.dateTimeSettings.formats.dateTime.short, [localeDatum.dateTimeSettings.formats.time.short, localeDatum.dateTimeSettings.formats.date.short]),
      'medium': formatDateTime(localeDatum.dateTimeSettings.formats.dateTime.medium, [localeDatum.dateTimeSettings.formats.time.medium, localeDatum.dateTimeSettings.formats.date.medium]),
      'long': formatDateTime(localeDatum.dateTimeSettings.formats.dateTime.long, [localeDatum.dateTimeSettings.formats.time.long, localeDatum.dateTimeSettings.formats.date.long]),
      'full': formatDateTime(localeDatum.dateTimeSettings.formats.dateTime.full, [localeDatum.dateTimeSettings.formats.time.full, localeDatum.dateTimeSettings.formats.date.full]),
      'shortDate': localeDatum.dateTimeSettings.formats.date.short,
      'mediumDate': localeDatum.dateTimeSettings.formats.date.medium,
      'longDate': localeDatum.dateTimeSettings.formats.date.long,
      'fullDate': localeDatum.dateTimeSettings.formats.date.full,
      'shortTime': localeDatum.dateTimeSettings.formats.time.short,
      'mediumTime': localeDatum.dateTimeSettings.formats.time.medium,
      'longTime': localeDatum.dateTimeSettings.formats.time.long,
      'fullTime': localeDatum.dateTimeSettings.formats.time.full
    };

    pattern = specialPatterns[pattern] || pattern;

    if (isBlank(value) || value !== value) return null;

    if (typeof value === 'string') {
      value = value.trim();
    }

    if (isDate(value)) {
      date = value;
    } else if (isNumeric(value)) {
      date = new Date(parseFloat(value));
    } else if (typeof value === 'string' && /^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
      /**
      * For ISO Strings without time the day, month and year must be extracted from the ISO String
      * before Date creation to avoid time offset and errors in the new Date.
      * If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
      * date, some browsers (e.g. IE 9) will throw an invalid Date error
      * If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
      * is applied
      * Note: ISO months are 0 for January, 1 for February, ...
      */
      const [y, m, d] = value.split('-').map((val: string) => parseInt(val, 10));
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(value);
    }

    if (!isDate(date)) {
      let match: RegExpMatchArray|null;
      if ((typeof value === 'string') && (match = value.match(ISO8601_DATE_REGEX))) {
        date = isoStringToDate(match);
      } else {
        throw invalidPipeArgumentError(DatePipe, value);
      }
    }

    let match;
    let parts: string[] = [];
    let text = '';
    let format: any = pattern;
    while (format) {
      match = DATE_FORMATS_SPLIT.exec(format);
      if (match) {
        parts = parts.concat(match.slice(1));
        format = parts.pop();
      } else {
        parts.push(format);
        format = null;
      }
    }

    let dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
      dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
      date = convertTimezoneToLocal(date, timezone, true);
    }
    parts.forEach(value => {
      const dateFormatter: DateFormatter = DATE_FORMATS[value];
      text += dateFormatter ?
          dateFormatter(date, localeDatum, dateTimezoneOffset) :
          value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });

    return text;
  }
}

function formatDateTime(str: string, opt_values: string[]) {
  if (opt_values) {
    str = str.replace(/\{([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ? opt_values[key] : match;
    });
  }
  return str;
}

function isBlank(obj: any): boolean {
  return obj == null || obj === '';
}

function isDate(obj: any): obj is Date {
  return obj instanceof Date && !isNaN(obj.valueOf());
}

function isoStringToDate(match: RegExpMatchArray): Date {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;

  if (match[9]) {
    tzHour = toInt(match[9] + match[10]);
    tzMin = toInt(match[9] + match[11]);
  }
  dateSetter.call(date, toInt(match[1]), toInt(match[2]) - 1, toInt(match[3]));
  const h = toInt(match[4] || '0') - tzHour;
  const m = toInt(match[5] || '0') - tzMin;
  const s = toInt(match[6] || '0');
  const ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}

function toInt(str: string): number {
  return parseInt(str, 10);
}

function padNumber(num: number, digits: number, trim?: boolean, negWrap?: boolean): string {
  let neg = '';
  if (num < 0 || (negWrap && num <= 0)) {
    if (negWrap) {
      num = -num + 1;
    } else {
      num = -num;
      neg = '-';
    }
  }
  let strNum = '' + num;
  while (strNum.length < digits) strNum = ZERO_CHAR + strNum;
  if (trim) {
    strNum = strNum.substr(strNum.length - digits);
  }
  return neg + strNum;
}

type DateType =
    'FullYear' | 'Month' | 'Date' | 'Hours' | 'Minutes' | 'Seconds' | 'Milliseconds' | 'Day';

function dateGetter(
    name: DateType, size: number, offset: number = 0, trim = false,
    negWrap = false): DateFormatter {
  return function(date: Date, ngLocale: NgLocale): string {
    let value = 0;
    switch (name) {
      case 'FullYear':
        value = date.getFullYear();
        break;
      case 'Month':
        value = date.getMonth();
        break;
      case 'Date':
        value = date.getDate();
        break;
      case 'Hours':
        value = date.getHours();
        break;
      case 'Minutes':
        value = date.getMinutes();
        break;
      case 'Seconds':
        value = date.getSeconds();
        break;
      case 'Milliseconds':
        const div = size === 1 ? 100 : (size === 2 ? 10 : 1);
        value = Math.round(date.getMilliseconds() / div);
        break;
      case 'Day':
        value = date.getDay();
        break;
    }
    if (offset > 0 || value > -offset) {
      value += offset;
    }
    if (value === 0 && offset === -12) {
      value = 12;
    }
    return padNumber(value, size, trim, negWrap);
  };
}

type DateWidth = 'narrow' | 'short' | 'abbreviated' | 'wide';

function extractTime(time: string) {
  const [h, m] = time.split(':');
  return { hours: parseInt(h, 10), minutes: parseInt(m, 10), }
}

function dateStrGetter(
    name: 'dayPeriods' | 'days' | 'months' | 'eras', width: DateWidth,
    context: 'format' | 'standalone' = 'format', extended = false): DateFormatter {
  return function(date: Date, ngLocale: NgLocale): string {
    let data: any;
    let key: string|number = '';
    switch (name) {
      case 'months':
        data = ngLocale.dateTimeTranslations.months;
        key = date.getMonth();
        break;
      case 'days':
        data = ngLocale.dateTimeTranslations.days;
        key = date.getDay();
        break;
      case 'dayPeriods':
        data = ngLocale.dateTimeTranslations.dayPeriods;
        const currentHours = date.getHours();
        const currentMinutes = date.getMinutes();
        const rules: any = ngLocale.dateTimeSettings.dayPeriodRules;
        // if no rules for the day periods, we use am/pm by default
        key = date.getHours() < 12 ? 'am' : 'pm';
        if (extended && rules) {
          Object.keys(rules).forEach((ruleKey: string) => {
            if (typeof rules[ruleKey] === 'string') {  // noon or midnight
              const {hours, minutes} = extractTime(rules[ruleKey]);
              if (hours === currentHours && minutes === currentMinutes) {
                key = ruleKey;
              }
            } else if (rules[ruleKey].from && rules[ruleKey].to) {
              // morning, afternoon, evening, night
              const {hours: hoursFrom, minutes: minutesFrom} = extractTime(rules[ruleKey].from);
              const {hours: hoursTo, minutes: minutesTo} = extractTime(rules[ruleKey].to);
              if (currentHours >= hoursFrom && currentMinutes >= minutesFrom &&
                  (currentHours < hoursTo ||
                   (currentHours === hoursTo && currentMinutes < minutesTo))) {
                key = ruleKey;
              }
            }
          });
        }
        break;
      case 'eras':
        data = ngLocale.dateTimeTranslations.eras;
        key = date.getFullYear() <= 0 ? 0 : 1;
    }

    if (name !== 'eras') {
      if (context === 'standalone') {
        data = data.standalone;
      } else {
        data = data.format;
      }
    }

    switch (width) {
      case 'narrow':
        data = data.narrow;
        break;
      case 'short':
        if (name !== 'days') {
          throw new Error(`No short width data for ${name}`);
        }
        data = data.short;
        break;
      case 'abbreviated':
        data = data.abbreviated;
        break;
      case 'wide':
        data = data.wide;
        break;
    }

    if (typeof data === 'undefined' || typeof key === 'undefined') {
      throw new Error(`Unable to find locale data for ${name}`);
    }

    return data[key];
  };
}

export type ZoneWidth = 'short' | 'long' | 'extended';

function timeZoneGetter(width: ZoneWidth): DateFormatter {
  return function(date: Date, ngLocale: NgLocale, offset: number) {
    const zone = -1 * offset;
    let value = '';
    switch (width) {
      case 'short':
        value = ((zone >= 0) ? '+' : '') +
            padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) +
            padNumber(Math.abs(zone % 60), 2);
        break;
      case 'long':
        value = 'GMT' + ((zone >= 0) ? '+' : '') +
            padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + ':' +
            padNumber(Math.abs(zone % 60), 2);
        break;
      case 'extended':
        if (offset === 0) {
          value = 'Z';
        } else {
          // todo(ocombe): support optional seconds field, if there really is a use case
          value = ((zone >= 0) ? '+' : '') +
              padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + ':' +
              padNumber(Math.abs(zone % 60), 2);
        }
        break;
    }

    return value;
  }
}

function timeZoneFallbackGetter(width: ZoneWidth): DateFormatter {
  return function(date: Date, ngLocale: NgLocale, offset: number) {
    const zone = -1 * offset;
    let value = 'GMT';
    switch (width) {
      case 'short':
        value +=
            ((zone >= 0) ? '+' : '') + padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 1);
        break;
      case 'long':
        value += ((zone >= 0) ? '+' : '') +
            padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + ':' +
            padNumber(Math.abs(zone % 60), 2);
        break;
    }

    return value;
  }
}

function getFirstThursdayOfYear(year: number) {
  // 0 = index of January
  const dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
  // 4 = index of Thursday (+1 to account for 1st = 5)
  // 11 = index of *next* Thursday (+1 account for 1st = 12)
  return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
}

function getThursdayThisWeek(datetime: Date) {
  return new Date(
      datetime.getFullYear(), datetime.getMonth(),
      // 4 = index of Thursday
      datetime.getDate() + (4 - datetime.getDay()));
}

function weekGetter(size: number, monthBased = false): DateFormatter {
  return function(date: Date, ngLocale: NgLocale) {
    let result;
    if (monthBased) {
      const nbDaysBefore1stDayOfMonth =
          new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
      const today = date.getDate();
      result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
    } else {
      const firstThurs = getFirstThursdayOfYear(date.getFullYear());
      const thisThurs = getThursdayThisWeek(date);
      const diff = +thisThurs - +firstThurs;
      result = 1 + Math.round(diff / 6.048e8);  // 6.048e8 ms per week
    }

    return padNumber(result, size);
  };
}

type DateFormatter = (date: Date, format: NgLocale, offset?: number) => string;
// Following CLDR formats
// http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations http://cldr.unicode.org/translation/date-time
const DATE_FORMATS: {[format: string]: DateFormatter} = {
  // Era name abbreviated (AD)
  G: dateStrGetter('eras', 'abbreviated'),
  // equivalent to G
  GG: dateStrGetter('eras', 'abbreviated'),
  // equivalent to G
  GGG: dateStrGetter('eras', 'abbreviated'),
  // Era name wide (Anno Domini)
  GGGG: dateStrGetter('eras', 'wide'),
  // Era name narrow (A)
  GGGGG: dateStrGetter('eras', 'narrow'),

  // 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
  y: dateGetter('FullYear', 1, 0, false, true),
  // 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
  yy: dateGetter('FullYear', 2, 0, true, true),
  // 3 digit representation of year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
  yyy: dateGetter('FullYear', 3, 0, false, true),
  // 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
  yyyy: dateGetter('FullYear', 4, 0, false, true),

  // todo Y, U

  // todo Q

  // Month in year (1-12), numeric
  M: dateGetter('Month', 1, 1),
  // Month in year, padded (01-12)
  MM: dateGetter('Month', 2, 1),
  // Month in year abbreviated (Jan-Dec)
  MMM: dateStrGetter('months', 'abbreviated'),
  // Month in year wide (January-December)
  MMMM: dateStrGetter('months', 'wide'),
  // Month in year narrow (J-D)
  MMMMM: dateStrGetter('months', 'narrow'),

  // equivalent to M
  L: dateGetter('Month', 1, 1),
  // equivalent to MM
  LL: dateGetter('Month', 2, 1),
  // Standalone month in year abbreviated (Jan-Dec)
  LLL: dateStrGetter('months', 'abbreviated', 'standalone'),
  // Standalone month in year wide (January-December)
  LLLL: dateStrGetter('months', 'wide', 'standalone'),
  // Standalone month in year narrow (J-D)
  LLLLL: dateStrGetter('months', 'narrow', 'standalone'),

  w: weekGetter(1),
  ww: weekGetter(2),

  W: weekGetter(1, true),

  // Day in month (1-31)
  d: dateGetter('Date', 1),
  // Day in month, padded (01-31)
  dd: dateGetter('Date', 2),

  // todo D, F

  // Day in Week abbreviated (Sun-Sat)
  E: dateStrGetter('days', 'abbreviated'),
  // equivalent to E
  EE: dateStrGetter('days', 'abbreviated'),
  // equivalent to E
  EEE: dateStrGetter('days', 'abbreviated'),
  // Day in Week wide (Sunday-Saturday)
  EEEE: dateStrGetter('days', 'wide'),
  // Day in Week narrow (S-S)
  EEEEE: dateStrGetter('days', 'narrow'),
  // Day in Week narrow (Su-Sa)
  EEEEEE: dateStrGetter('days', 'short'),

  // todo e, c

  // Period of the day abbreviated (am-pm)
  a: dateStrGetter('dayPeriods', 'abbreviated'),
  // equivalent to a
  aa: dateStrGetter('dayPeriods', 'abbreviated'),
  // equivalent to a
  aaa: dateStrGetter('dayPeriods', 'abbreviated'),
  // Period of the day wide (am-pm)
  aaaa: dateStrGetter('dayPeriods', 'wide'),
  // Period of the day narrow (a-p)
  aaaaa: dateStrGetter('dayPeriods', 'narrow'),

  // Standalone period of the day abbreviated (mid., at night, ...)
  b: dateStrGetter('dayPeriods', 'abbreviated', 'standalone', true),
  // equivalent to b
  bb: dateStrGetter('dayPeriods', 'abbreviated', 'standalone', true),
  // equivalent to b
  bbb: dateStrGetter('dayPeriods', 'abbreviated', 'standalone', true),
  // Standalone period of the day wide (midnight, at night, ...)
  bbbb: dateStrGetter('dayPeriods', 'wide', 'standalone', true),
  // Standalone period of the day narrow (mi, at night, ...)
  bbbbb: dateStrGetter('dayPeriods', 'narrow', 'standalone', true),

  // Period of the day abbreviated (mid., ...)
  B: dateStrGetter('dayPeriods', 'abbreviated', 'format', true),
  // // equivalent to b
  BB: dateStrGetter('dayPeriods', 'abbreviated', 'format', true),
  // // equivalent to b
  BBB: dateStrGetter('dayPeriods', 'abbreviated', 'format', true),
  // Period of the day wide (midnight, noon, morning, afternoon, evening, night)
  BBBB: dateStrGetter('dayPeriods', 'wide', 'format', true),
  // Period of the day narrow (mi, ...)
  BBBBB: dateStrGetter('dayPeriods', 'narrow', 'format', true),

  // Hour in AM/PM, (1-12)
  h: dateGetter('Hours', 1, -12),
  // Hour in AM/PM, padded (01-12)
  hh: dateGetter('Hours', 2, -12),

  // Hour in day (0-23)
  H: dateGetter('Hours', 1),
  // Hour in day, padded (00-23)
  HH: dateGetter('Hours', 2),

  // todo j, J, C

  // Minute in hour (0-59)
  m: dateGetter('Minutes', 1),
  // Minute in hour, padded (00-59)
  mm: dateGetter('Minutes', 2),

  // Second in minute (0-59)
  s: dateGetter('Seconds', 1),
  // Second in minute, padded (00-59)
  ss: dateGetter('Seconds', 2),

  // Fractional second padded (0-9)
  S: dateGetter('Milliseconds', 1),
  // Fractional second padded (00-99)
  SS: dateGetter('Milliseconds', 2),
  // Fractional second padded (000-999 = millisecond)
  SSS: dateGetter('Milliseconds', 3),

  // todo A

  // should be location, but fallback to O instead because we don't have the data
  z: timeZoneFallbackGetter('short'),
  // equivalent to z
  zz: timeZoneFallbackGetter('short'),
  // equivalent to z
  zzz: timeZoneFallbackGetter('short'),
  // should be location, but fallback to OOOO instead because we don't have the data
  zzzz: timeZoneFallbackGetter('long'),

  // Timezone ISO8601 short format (-0430)
  Z: timeZoneGetter('short'),
  // equivalent to Z
  ZZ: timeZoneGetter('short'),
  // equivalent to Z
  ZZZ: timeZoneGetter('short'),
  // equivalent to OOOO
  ZZZZ: timeZoneGetter('long'),
  // Timezone ISO8601 extended format (-04:30)
  ZZZZZ: timeZoneGetter('extended'),

  // Timezone GMT short format (GMT+4)
  O: timeZoneFallbackGetter('short'),
  // equivalent to O
  OO: timeZoneFallbackGetter('short'),
  // equivalent to O
  OOO: timeZoneFallbackGetter('short'),
  // Timezone GMT long format (GMT+0430)
  OOOO: timeZoneFallbackGetter('long'),

  // todo v, V, X, x
};

const ALL_COLONS = /:/g;
function timezoneToOffset(timezone: string, fallback: number): number {
  // Support: IE 9-11 only, Edge 13-15+
  // IE/Edge do not "understand" colon (`:`) in timezone
  timezone = timezone.replace(ALL_COLONS, '');
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
