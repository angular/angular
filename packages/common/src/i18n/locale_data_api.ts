/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import localeEn from './locale_en';
import {LOCALE_DATA, LocaleDataIndex, ExtraLocaleDataIndex, CurrencyIndex} from './locale_data';
import {CURRENCIES_EN, CurrenciesSymbols} from './currencies';

/**
 * The different format styles that can be used to represent numbers.
 * Used by the function {@link getLocaleNumberFormat}.
 *
 * @publicApi
 */
export enum NumberFormatStyle {
  Decimal,
  Percent,
  Currency,
  Scientific
}

/** @publicApi */
export enum Plural {
  Zero = 0,
  One = 1,
  Two = 2,
  Few = 3,
  Many = 4,
  Other = 5,
}

/**
 * Some languages use two different forms of strings (standalone and format) depending on the
 * context.
 * Typically the standalone version is the nominative form of the word, and the format version is in
 * the genitive.
 * See [the CLDR website](http://cldr.unicode.org/translation/date-time) for more information.
 *
 * @publicApi
 */
export enum FormStyle {
  Format,
  Standalone
}

/**
 * Multiple widths are available for translations: narrow (1 character), abbreviated (3 characters),
 * wide (full length), and short (2 characters, only for days).
 *
 * For example the day `Sunday` will be:
 * - Narrow: `S`
 * - Short: `Su`
 * - Abbreviated: `Sun`
 * - Wide: `Sunday`
 *
 * @publicApi
 */
export enum TranslationWidth {
  Narrow,
  Abbreviated,
  Wide,
  Short
}

/**
 * Multiple widths are available for formats: short (minimal amount of data), medium (small amount
 * of data), long (complete amount of data), full (complete amount of data and extra information).
 *
 * For example the date-time formats for the english locale will be:
 *  - `'short'`: `'M/d/yy, h:mm a'` (e.g. `6/15/15, 9:03 AM`)
 *  - `'medium'`: `'MMM d, y, h:mm:ss a'` (e.g. `Jun 15, 2015, 9:03:01 AM`)
 *  - `'long'`: `'MMMM d, y, h:mm:ss a z'` (e.g. `June 15, 2015 at 9:03:01 AM GMT+1`)
 *  - `'full'`: `'EEEE, MMMM d, y, h:mm:ss a zzzz'` (e.g. `Monday, June 15, 2015 at
 * 9:03:01 AM GMT+01:00`)
 *
 * @publicApi
 */
export enum FormatWidth {
  Short,
  Medium,
  Long,
  Full
}

/**
 * Number symbol that can be used to replace placeholders in number patterns.
 * The placeholders are based on english values:
 *
 * | Name                   | Example for en-US | Meaning                                     |
 * |------------------------|-------------------|---------------------------------------------|
 * | decimal                | 2,345`.`67        | decimal separator                           |
 * | group                  | 2`,`345.67        | grouping separator, typically for thousands |
 * | plusSign               | `+`23             | the plus sign used with numbers             |
 * | minusSign              | `-`23             | the minus sign used with numbers            |
 * | percentSign            | 23.4`%`           | the percent sign (out of 100)               |
 * | perMille               | 234`‰`            | the permille sign (out of 1000)             |
 * | exponential            | 1.2`E`3           | used in computers for 1.2×10³.              |
 * | superscriptingExponent | 1.2`×`103         | human-readable format of exponential        |
 * | infinity               | `∞`               | used in +∞ and -∞.                          |
 * | nan                    | `NaN`             | "not a number".                             |
 * | timeSeparator          | 10`:`52           | symbol used between time units              |
 * | currencyDecimal        | $2,345`.`67       | decimal separator, fallback to "decimal"    |
 * | currencyGroup          | $2`,`345.67       | grouping separator, fallback to "group"     |
 *
 * @publicApi
 */
export enum NumberSymbol {
  Decimal,
  Group,
  List,
  PercentSign,
  PlusSign,
  MinusSign,
  Exponential,
  SuperscriptingExponent,
  PerMille,
  Infinity,
  NaN,
  TimeSeparator,
  CurrencyDecimal,
  CurrencyGroup
}

/**
 * The value for each day of the week, based on the en-US locale
 *
 * @publicApi
 */
export enum WeekDay {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday
}

/**
 * The locale id for the chosen locale (e.g `en-GB`).
 *
 * @publicApi
 */
export function getLocaleId(locale: string): string {
  return findLocaleData(locale)[LocaleDataIndex.LocaleId];
}

/**
 * Periods of the day (e.g. `[AM, PM]` for en-US).
 *
 * @publicApi
 */
export function getLocaleDayPeriods(
    locale: string, formStyle: FormStyle, width: TranslationWidth): [string, string] {
  const data = findLocaleData(locale);
  const amPmData = <[
    string, string
  ][][]>[data[LocaleDataIndex.DayPeriodsFormat], data[LocaleDataIndex.DayPeriodsStandalone]];
  const amPm = getLastDefinedValue(amPmData, formStyle);
  return getLastDefinedValue(amPm, width);
}

/**
 * Days of the week for the Gregorian calendar (e.g. `[Sunday, Monday, ... Saturday]` for en-US).
 *
 * @publicApi
 */
export function getLocaleDayNames(
    locale: string, formStyle: FormStyle, width: TranslationWidth): string[] {
  const data = findLocaleData(locale);
  const daysData =
      <string[][][]>[data[LocaleDataIndex.DaysFormat], data[LocaleDataIndex.DaysStandalone]];
  const days = getLastDefinedValue(daysData, formStyle);
  return getLastDefinedValue(days, width);
}

/**
 * Months of the year for the Gregorian calendar (e.g. `[January, February, ...]` for en-US).
 *
 * @publicApi
 */
export function getLocaleMonthNames(
    locale: string, formStyle: FormStyle, width: TranslationWidth): string[] {
  const data = findLocaleData(locale);
  const monthsData =
      <string[][][]>[data[LocaleDataIndex.MonthsFormat], data[LocaleDataIndex.MonthsStandalone]];
  const months = getLastDefinedValue(monthsData, formStyle);
  return getLastDefinedValue(months, width);
}

/**
 * Eras for the Gregorian calendar (e.g. AD/BC).
 *
 * @publicApi
 */
export function getLocaleEraNames(locale: string, width: TranslationWidth): [string, string] {
  const data = findLocaleData(locale);
  const erasData = <[string, string][]>data[LocaleDataIndex.Eras];
  return getLastDefinedValue(erasData, width);
}

/**
 * First day of the week for this locale, based on english days (Sunday = 0, Monday = 1, ...).
 * For example in french the value would be 1 because the first day of the week is Monday.
 *
 * @publicApi
 */
export function getLocaleFirstDayOfWeek(locale: string): WeekDay {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.FirstDayOfWeek];
}

/**
 * Range of days in the week that represent the week-end for this locale, based on english days
 * (Sunday = 0, Monday = 1, ...).
 * For example in english the value would be [6,0] for Saturday to Sunday.
 *
 * @publicApi
 */
export function getLocaleWeekEndRange(locale: string): [WeekDay, WeekDay] {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.WeekendRange];
}

/**
 * Date format that depends on the locale.
 *
 * There are four basic date formats:
 * - `full` should contain long-weekday (EEEE), year (y), long-month (MMMM), day (d).
 *
 *  For example, English uses `EEEE, MMMM d, y`, corresponding to a date like
 *  "Tuesday, September 14, 1999".
 *
 * - `long` should contain year, long-month, day.
 *
 *  For example, `MMMM d, y`, corresponding to a date like "September 14, 1999".
 *
 * - `medium` should contain year, abbreviated-month (MMM), day.
 *
 *  For example, `MMM d, y`, corresponding to a date like "Sep 14, 1999".
 *  For languages that do not use abbreviated months, use the numeric month (MM/M). For example,
 *  `y/MM/dd`, corresponding to a date like "1999/09/14".
 *
 * - `short` should contain year, numeric-month (MM/M), and day.
 *
 *  For example, `M/d/yy`, corresponding to a date like "9/14/99".
 *
 * @publicApi
 */
export function getLocaleDateFormat(locale: string, width: FormatWidth): string {
  const data = findLocaleData(locale);
  return getLastDefinedValue(data[LocaleDataIndex.DateFormat], width);
}

/**
 * Time format that depends on the locale.
 *
 * The standard formats include four basic time formats:
 * - `full` should contain hour (h/H), minute (mm), second (ss), and zone (zzzz).
 * - `long` should contain hour, minute, second, and zone (z)
 * - `medium` should contain hour, minute, second.
 * - `short` should contain hour, minute.
 *
 * Note: The patterns depend on whether the main country using your language uses 12-hour time or
 * not:
 * - For 12-hour time, use a pattern like `hh:mm a` using h to mean a 12-hour clock cycle running
 * 1 through 12 (midnight plus 1 minute is 12:01), or using K to mean a 12-hour clock cycle
 * running 0 through 11 (midnight plus 1 minute is 0:01).
 * - For 24-hour time, use a pattern like `HH:mm` using H to mean a 24-hour clock cycle running 0
 * through 23 (midnight plus 1 minute is 0:01), or using k to mean a 24-hour clock cycle running
 * 1 through 24 (midnight plus 1 minute is 24:01).
 *
 * @publicApi
 */
export function getLocaleTimeFormat(locale: string, width: FormatWidth): string {
  const data = findLocaleData(locale);
  return getLastDefinedValue(data[LocaleDataIndex.TimeFormat], width);
}

/**
 * Date-time format that depends on the locale.
 *
 * The date-time pattern shows how to combine separate patterns for date (represented by {1})
 * and time (represented by {0}) into a single pattern. It usually doesn't need to be changed.
 * What you want to pay attention to are:
 * - possibly removing a space for languages that don't use it, such as many East Asian languages
 * - possibly adding a comma, other punctuation, or a combining word
 *
 * For example:
 * - English uses `{1} 'at' {0}` or `{1}, {0}` (depending on date style), while Japanese uses
 *  `{1}{0}`.
 * - An English formatted date-time using the combining pattern `{1}, {0}` could be
 *  `Dec 10, 2010, 3:59:49 PM`. Notice the comma and space between the date portion and the time
 *  portion.
 *
 * There are four formats (`full`, `long`, `medium`, `short`); the determination of which to use
 * is normally based on the date style. For example, if the date has a full month and weekday
 * name, the full combining pattern will be used to combine that with a time. If the date has
 * numeric month, the short version of the combining pattern will be used to combine that with a
 * time. English uses `{1} 'at' {0}` for full and long styles, and `{1}, {0}` for medium and short
 * styles.
 *
 * @publicApi
 */
export function getLocaleDateTimeFormat(locale: string, width: FormatWidth): string {
  const data = findLocaleData(locale);
  const dateTimeFormatData = <string[]>data[LocaleDataIndex.DateTimeFormat];
  return getLastDefinedValue(dateTimeFormatData, width);
}

/**
 * Number symbol that can be used to replace placeholders in number formats.
 * See {@link NumberSymbol} for more information.
 *
 * @publicApi
 */
export function getLocaleNumberSymbol(locale: string, symbol: NumberSymbol): string {
  const data = findLocaleData(locale);
  const res = data[LocaleDataIndex.NumberSymbols][symbol];
  if (typeof res === 'undefined') {
    if (symbol === NumberSymbol.CurrencyDecimal) {
      return data[LocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
    } else if (symbol === NumberSymbol.CurrencyGroup) {
      return data[LocaleDataIndex.NumberSymbols][NumberSymbol.Group];
    }
  }
  return res;
}

/**
 * Number format that depends on the locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,67". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders;
 * they stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders; for example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the Number Symbols for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | This will be replaced by a currency symbol, such as $ or USD. |
 * | % | This marks a percent format. The % symbol may change position, but must be retained. |
 * | E | This marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * You can find more information
 * [on the CLDR website](http://cldr.unicode.org/translation/number-patterns)
 *
 * @publicApi
 */
export function getLocaleNumberFormat(locale: string, type: NumberFormatStyle): string {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.NumberFormats][type];
}

/**
 * The symbol used to represent the currency for the main country using this locale (e.g. $ for
 * the locale en-US).
 * The symbol will be `null` if the main country cannot be determined.
 *
 * @publicApi
 */
export function getLocaleCurrencySymbol(locale: string): string|null {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.CurrencySymbol] || null;
}

/**
 * The name of the currency for the main country using this locale (e.g. USD for the locale
 * en-US).
 * The name will be `null` if the main country cannot be determined.
 *
 * @publicApi
 */
export function getLocaleCurrencyName(locale: string): string|null {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.CurrencyName] || null;
}

/**
 * Returns the currency values for the locale
 */
function getLocaleCurrencies(locale: string): {[code: string]: CurrenciesSymbols} {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.Currencies];
}

/**
 * The locale plural function used by ICU expressions to determine the plural case to use.
 * See {@link NgPlural} for more information.
 *
 * @publicApi
 */
export function getLocalePluralCase(locale: string): (value: number) => Plural {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}

function checkFullData(data: any) {
  if (!data[LocaleDataIndex.ExtraData]) {
    throw new Error(
        `Missing extra locale data for the locale "${data[LocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
  }
}

/**
 * Rules used to determine which day period to use (See `dayPeriods` below).
 * The rules can either be an array or a single value. If it's an array, consider it as "from"
 * and "to". If it's a single value then it means that the period is only valid at this exact
 * value.
 * There is always the same number of rules as the number of day periods, which means that the
 * first rule is applied to the first day period and so on.
 * You should fallback to AM/PM when there are no rules available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriodRules(locale: string): (Time | [Time, Time])[] {
  const data = findLocaleData(locale);
  checkFullData(data);
  const rules = data[LocaleDataIndex.ExtraData][ExtraLocaleDataIndex.ExtraDayPeriodsRules] || [];
  return rules.map((rule: string | [string, string]) => {
    if (typeof rule === 'string') {
      return extractTime(rule);
    }
    return [extractTime(rule[0]), extractTime(rule[1])];
  });
}

/**
 * Day Periods indicate roughly how the day is broken up in different languages (e.g. morning,
 * noon, afternoon, midnight, ...).
 * You should use the function {@link getLocaleExtraDayPeriodRules} to determine which period to
 * use.
 * You should fallback to AM/PM when there are no day periods available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriods(
    locale: string, formStyle: FormStyle, width: TranslationWidth): string[] {
  const data = findLocaleData(locale);
  checkFullData(data);
  const dayPeriodsData = <string[][][]>[
    data[LocaleDataIndex.ExtraData][ExtraLocaleDataIndex.ExtraDayPeriodFormats],
    data[LocaleDataIndex.ExtraData][ExtraLocaleDataIndex.ExtraDayPeriodStandalone]
  ];
  const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
  return getLastDefinedValue(dayPeriods, width) || [];
}

/**
 * Returns the first value that is defined in an array, going backwards.
 *
 * To avoid repeating the same data (e.g. when "format" and "standalone" are the same) we only
 * add the first one to the locale data arrays, the other ones are only defined when different.
 * We use this function to retrieve the first defined value.
 *
 * @publicApi
 */
function getLastDefinedValue<T>(data: T[], index: number): T {
  for (let i = index; i > -1; i--) {
    if (typeof data[i] !== 'undefined') {
      return data[i];
    }
  }
  throw new Error('Locale data API: locale data undefined');
}

/**
 * A representation of the time with hours and minutes
 *
 * @publicApi
 */
export type Time = {
  hours: number,
  minutes: number
};

/**
 * Extract the hours and minutes from a string like "15:45"
 */
function extractTime(time: string): Time {
  const [h, m] = time.split(':');
  return {hours: +h, minutes: +m};
}

/**
 * Finds the locale data for a locale id
 *
 * @publicApi
 */
export function findLocaleData(locale: string): any {
  const normalizedLocale = locale.toLowerCase().replace(/_/g, '-');

  let match = LOCALE_DATA[normalizedLocale];
  if (match) {
    return match;
  }

  // let's try to find a parent locale
  const parentLocale = normalizedLocale.split('-')[0];
  match = LOCALE_DATA[parentLocale];

  if (match) {
    return match;
  }

  if (parentLocale === 'en') {
    return localeEn;
  }

  throw new Error(`Missing locale data for the locale "${locale}".`);
}

/**
 * Returns the currency symbol for a given currency code, or the code if no symbol available
 * (e.g.: format narrow = $, format wide = US$, code = USD)
 * If no locale is provided, it uses the locale "en" by default
 *
 * @publicApi
 */
export function getCurrencySymbol(code: string, format: 'wide' | 'narrow', locale = 'en'): string {
  const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
  const symbolNarrow = currency[CurrencyIndex.SymbolNarrow];

  if (format === 'narrow' && typeof symbolNarrow === 'string') {
    return symbolNarrow;
  }

  return currency[CurrencyIndex.Symbol] || code;
}

// Most currencies have cents, that's why the default is 2
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;

/**
 * Returns the number of decimal digits for the given currency.
 * Its value depends upon the presence of cents in that particular currency.
 *
 * @publicApi
 */
export function getNumberOfCurrencyDigits(code: string): number {
  let digits;
  const currency = CURRENCIES_EN[code];
  if (currency) {
    digits = currency[CurrencyIndex.NbOfDigits];
  }
  return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
