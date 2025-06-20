/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  DateFormatter,
  FormStyle,
  TranslationType,
  TranslationWidth,
} from '../format_date_interface';

const FULL = 'full';
const MEDIUM = 'medium';

const LONG = 'long';
const SHORT = 'short';
const NARROW = 'narrow';
const NUMERIC = 'numeric';

/**
 * short: 6/15/15, 9:03 AM
 * medium: Jun 15, 2015, 9:03:01 AM
 * long: June 15, 2015 at 9:03:01 AM UTC
 * full: Monday, June 15, 2015 at 9:03:01 AM Coordinated Universal Time
 */
export function getIntlNamedDate(
  date: Date,
  locale: string,
  format: string,
  timeZone?: string,
): string {
  let formatObj: Intl.DateTimeFormatOptions | undefined;
  switch (format) {
    // Date
    case 'shortDate':
      formatObj = {dateStyle: SHORT};
      break;
    case 'mediumDate':
      formatObj = {dateStyle: MEDIUM};
      break;
    case 'longDate':
      formatObj = {dateStyle: LONG};
      break;
    case 'fullDate':
      formatObj = {dateStyle: FULL};
      break;

    // Time
    case 'shortTime':
      formatObj = {timeStyle: SHORT};
      break;
    case 'mediumTime':
      formatObj = {timeStyle: MEDIUM};
      break;
    case 'longTime':
      formatObj = {timeStyle: LONG};
      break;
    case 'fullTime':
      formatObj = {timeStyle: FULL};
      break;

    // Date-Time
    case SHORT:
    case MEDIUM:
    case LONG:
    case FULL:
      formatObj = {dateStyle: format, timeStyle: format};
      break;
  }

  if (formatObj) {
    // Intl doesn't support empty string for timeZone
    timeZone = timeZone === '' ? undefined : timeZone;
    return Intl.DateTimeFormat(locale, {...formatObj, timeZone}).format(date);
  }
  return '';
}

export function intlDateStrGetter(
  name: TranslationType,
  width: TranslationWidth,
  form: FormStyle = FormStyle.Format,
  extended = false,
): DateFormatter {
  return function (date: Date, locale: string): string {
    let params: IntlDateParameters;
    switch (name) {
      case TranslationType.Months:
        params = getMonth(width, form === FormStyle.Standalone);
        break;
      case TranslationType.Days:
        params = getWeekDay(width, form === FormStyle.Standalone);
        break;
      case TranslationType.DayPeriods:
        params = getDayPeriod(width, extended);
        break;
      case TranslationType.Eras:
        params = getEra(width);
        break;
      default:
        // TODO: create a runtime error
        throw new Error(`unexpected translation type ${name}`);
    }
    const formatDefinition = Intl.DateTimeFormat(locale, params.options);
    if (params.extract) {
      return extractIntlPart(formatDefinition.formatToParts(date), params.extract);
    } else {
      return formatDefinition.format(date);
    }
  };
}

interface IntlDateParameters {
  options: Intl.DateTimeFormatOptions;
  extract?: Intl.DateTimeFormatPartTypes;
}

function toFormat(width: TranslationWidth): 'long' | 'short' | 'narrow' {
  return width === TranslationWidth.Narrow
    ? NARROW
    : width === TranslationWidth.Short || width === TranslationWidth.Abbreviated
      ? SHORT
      : LONG;
}

/**
 * January, Jan, J, O1, 1
 */
function getMonth(width: TranslationWidth, standalone: boolean): IntlDateParameters {
  const format = toFormat(width);
  return standalone
    ? {options: {month: format, day: NUMERIC}, extract: 'month'}
    : {options: {month: format}};
}

/**
 * Monday, Mon, M.
 */
function getWeekDay(width: TranslationWidth, standalone: boolean): IntlDateParameters {
  const format = toFormat(width);
  return standalone
    ? {options: {weekday: format}}
    : {options: {weekday: format, month: LONG, day: NUMERIC}, extract: 'weekday'};
}

/**
 * AM, PM, noon, at night ...
 */
function getDayPeriod(width: TranslationWidth, extended: boolean): IntlDateParameters {
  const format = toFormat(width);
  return extended
    ? {options: {dayPeriod: format}}
    : {options: {hour: NUMERIC, hourCycle: 'h12'}, extract: 'dayPeriod'};
}

/**
 * AD, BC
 */
function getEra(width: TranslationWidth): IntlDateParameters {
  const format = toFormat(width);
  return {options: {era: format}, extract: 'era'};
}

function extractIntlPart(
  parts: Intl.DateTimeFormatPart[],
  extract: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === extract)!.value;
}

export function intlPadNumber(
  num: number,
  digits: number,
  locale = 'en',
  trim?: boolean,
  negWrap?: boolean,
): string {
  // negWrap is only use for wrapping negative years
  if (negWrap && num <= 0) {
    num = -num;
    // Years are always positive, there is no year 0, -1 is 2 BC.
    num++;
  }

  // triming the leading digits
  num = trim && digits > 1 ? num % Math.pow(10, digits) : num;

  return Intl.NumberFormat(locale, {
    minimumIntegerDigits: digits,
    useGrouping: false,
  }).format(num);
}

export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}
