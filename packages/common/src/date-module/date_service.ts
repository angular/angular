/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform, Injector, Injectable} from '@angular/core';
import {DateFormatter} from '../pipes/intl';
import {invalidPipeArgumentError} from '../pipes/invalid_pipe_argument_error';
import {isNumeric} from '../pipes/number_pipe';

const ISO8601_DATE_REGEX =
    /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11

@Injectable()
export class DateService {
  /** @internal */
  static _ALIASES: {[key: string]: string} = {
    'medium': 'yMMMdjms',
    'short': 'yMdjm',
    'fullDate': 'yMMMMEEEEd',
    'longDate': 'yMMMMd',
    'mediumDate': 'yMMMd',
    'shortDate': 'yMd',
    'mediumTime': 'jms',
    'shortTime': 'jm'
  };

  constructor(@Inject(LOCALE_ID) private _locale: string) {

  }

  transform(value: any, pattern: string = 'mediumDate'): string|null {
    let date: Date;

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
        throw invalidPipeArgumentError(DateService, value);
      }
    }

    return DateFormatter.format(date, this._locale, DateService._ALIASES[pattern] || pattern);
  }
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
