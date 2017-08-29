/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatDate} from '../i18n/format_date';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

export const ISO8601_DATE_REGEX =
    /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11

// clang-format off
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
 *   - `'short'`: equivalent to `'M/d/yy, h:mm a'` (e.g. `6/15/15, 9:03 AM`)
 *   - `'medium'`: equivalent to `'MMM d, y, h:mm:ss a'` (e.g. `Jun 15, 2015, 9:03:01 AM`)
 *   - `'long'`: equivalent to `'MMMM d, y, h:mm:ss a z'` (e.g. `June 15, 2015 at 9:03:01 AM GMT+1`)
 *   - `'full'`: equivalent to `'EEEE, MMMM d, y, h:mm:ss a zzzz'` (e.g. `Monday, June 15, 2015 at
 * 9:03:01 AM GMT+01:00`)
 *   - `'shortDate'`: equivalent to `'M/d/yy'` (e.g. `6/15/15`)
 *   - `'mediumDate'`: equivalent to `'MMM d, y'` (e.g. `Jun 15, 2015`)
 *   - `'longDate'`: equivalent to `'MMMM d, y'` (e.g. `June 15, 2015`)
 *   - `'fullDate'`: equivalent to `'EEEE, MMMM d, y'` (e.g. `Monday, June 15, 2015`)
 *   - `'shortTime'`: equivalent to `'h:mm a'` (e.g. `9:03 AM`)
 *   - `'mediumTime'`: equivalent to `'h:mm:ss a'` (e.g. `9:03:01 AM`)
 *   - `'longTime'`: equivalent to `'h:mm:ss a z'` (e.g. `9:03:01 AM GMT+1`)
 *   - `'fullTime'`: equivalent to `'h:mm:ss a zzzz'` (e.g. `9:03:01 AM GMT+01:00`)
 *  - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *  abbreviations, but for general use, use a time zone offset, for example,
 *  `'+0430'` (4 hours, 30 minutes east of the Greenwich meridian)
 *  If not specified, the local system timezone of the end-user's browser will be used.
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
 *
 *
 *  | Field Type         | Format      | Description                                                   | Example Value                                              |
 *  |--------------------|-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                    | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                    | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year               | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                    | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                    | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                    | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month              | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                    | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                    | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                    | MMMM        | Wide                                                          | September                                                  |
 *  |                    | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone   | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                    | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                    | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                    | LLLL        | Wide                                                          | September                                                  |
 *  |                    | LLLLL       | Narrow                                                        | S                                                          |
 *  | Week of year       | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                    | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month      | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month       | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                    | dd          | Numeric: 2 digits + zero padded                               | 1                                                          |
 *  | Week day           | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                    | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                    | EEEEE       | Narrow                                                        | T                                                          |
 *  |                    | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Period             | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                    | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                    | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*            | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                    | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                    | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone* | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                    | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                    | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12          | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                    | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23          | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                    | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute             | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                    | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second             | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                    | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                    | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                    | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone               | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                    | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                    | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                    | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                    | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                    | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                    | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
 *
 *
 * When the expression is a ISO string without time (e.g. 2016-09-19) the time zone offset is not
 * applied and the formatted text will have the same day, month and year of the expression.
 *
 * WARNINGS:
 * - this pipe has only access to en-US locale data by default. If you want to localize the dates
 *   in another language, you will have to import data for other locales.
 *   See the {@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale
 *   data.
 * - Fields suffixed with * are only available in the extra dataset.
 *   See the {@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import extra locale
 *   data.
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
 * {@example common/pipes/ts/date_pipe.ts region='DatePipe'}
 *
 * @stable
 */
// clang-format on
@Pipe({name: 'date', pure: true})
export class DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any, format = 'mediumDate', timezone?: string, locale?: string): string|null {
    if (value == null || value === '' || value !== value) return null;

    if (typeof value === 'string') {
      value = value.trim();
    }

    let date: Date;
    if (isDate(value)) {
      date = value;
    } else if (!isNaN(value - parseFloat(value))) {
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
      const [y, m, d] = value.split('-').map((val: string) => +val);
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

    return formatDate(date, format, locale || this.locale, timezone);
  }
}

/** @internal */
export function isoStringToDate(match: RegExpMatchArray): Date {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;

  if (match[9]) {
    tzHour = +(match[9] + match[10]);
    tzMin = +(match[9] + match[11]);
  }
  dateSetter.call(date, +(match[1]), +(match[2]) - 1, +(match[3]));
  const h = +(match[4] || '0') - tzHour;
  const m = +(match[5] || '0') - tzMin;
  const s = +(match[6] || '0');
  const ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}

function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.valueOf());
}
