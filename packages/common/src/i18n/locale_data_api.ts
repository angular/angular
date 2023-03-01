/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵCurrencyIndex, ɵExtraLocaleDataIndex, ɵfindLocaleData, ɵgetLocaleCurrencyCode, ɵgetLocalePluralCase, ɵLocaleDataIndex} from '@angular/core';

import {CURRENCIES_EN, CurrenciesSymbols} from './currencies';


/**
 * Format styles that can be used to represent numbers.
 * @see `getLocaleNumberFormat()`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export enum NumberFormatStyle {
  Decimal,
  Percent,
  Currency,
  Scientific
}

/**
 * Plurality cases used for translating plurals to different languages.
 *
 * @see `NgPlural`
 * @see `NgPluralCase`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export enum Plural {
  Zero = 0,
  One = 1,
  Two = 2,
  Few = 3,
  Many = 4,
  Other = 5,
}

/**
 * Context-dependant translation forms for strings.
 * Typically the standalone version is for the nominative form of the word,
 * and the format version is used for the genitive case.
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export enum FormStyle {
  Format,
  Standalone
}

/**
 * String widths available for translations.
 * The specific character widths are locale-specific.
 * Examples are given for the word "Sunday" in English.
 *
 * @publicApi
 */
export enum TranslationWidth {
  /** 1 character for `en-US`. For example: 'S' */
  Narrow,
  /** 3 characters for `en-US`. For example: 'Sun' */
  Abbreviated,
  /** Full length for `en-US`. For example: "Sunday" */
  Wide,
  /** 2 characters for `en-US`, For example: "Su" */
  Short
}

/**
 * String widths available for date-time formats.
 * The specific character widths are locale-specific.
 * Examples are given for `en-US`.
 *
 * @see `getLocaleDateFormat()`
 * @see `getLocaleTimeFormat()`
 * @see `getLocaleDateTimeFormat()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 * @publicApi
 */
export enum FormatWidth {
  /**
   * For `en-US`, 'M/d/yy, h:mm a'`
   * (Example: `6/15/15, 9:03 AM`)
   */
  Short,
  /**
   * For `en-US`, `'MMM d, y, h:mm:ss a'`
   * (Example: `Jun 15, 2015, 9:03:01 AM`)
   */
  Medium,
  /**
   * For `en-US`, `'MMMM d, y, h:mm:ss a z'`
   * (Example: `June 15, 2015 at 9:03:01 AM GMT+1`)
   */
  Long,
  /**
   * For `en-US`, `'EEEE, MMMM d, y, h:mm:ss a zzzz'`
   * (Example: `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
   */
  Full
}

/**
 * Symbols that can be used to replace placeholders in number patterns.
 * Examples are based on `en-US` values.
 *
 * @see `getLocaleNumberSymbol()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export enum NumberSymbol {
  /**
   * Decimal separator.
   * For `en-US`, the dot character.
   * Example: 2,345`.`67
   */
  Decimal,
  /**
   * Grouping separator, typically for thousands.
   * For `en-US`, the comma character.
   * Example: 2`,`345.67
   */
  Group,
  /**
   * List-item separator.
   * Example: "one, two, and three"
   */
  List,
  /**
   * Sign for percentage (out of 100).
   * Example: 23.4%
   */
  PercentSign,
  /**
   * Sign for positive numbers.
   * Example: +23
   */
  PlusSign,
  /**
   * Sign for negative numbers.
   * Example: -23
   */
  MinusSign,
  /**
   * Computer notation for exponential value (n times a power of 10).
   * Example: 1.2E3
   */
  Exponential,
  /**
   * Human-readable format of exponential.
   * Example: 1.2x103
   */
  SuperscriptingExponent,
  /**
   * Sign for permille (out of 1000).
   * Example: 23.4‰
   */
  PerMille,
  /**
   * Infinity, can be used with plus and minus.
   * Example: ∞, +∞, -∞
   */
  Infinity,
  /**
   * Not a number.
   * Example: NaN
   */
  NaN,
  /**
   * Symbol used between time units.
   * Example: 10:52
   */
  TimeSeparator,
  /**
   * Decimal separator for currency values (fallback to `Decimal`).
   * Example: $2,345.67
   */
  CurrencyDecimal,
  /**
   * Group separator for currency values (fallback to `Group`).
   * Example: $2,345.67
   */
  CurrencyGroup
}

/**
 * The value for each day of the week, based on the `en-US` locale
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
 * Retrieves the locale ID from the currently loaded locale.
 * The loaded locale could be, for example, a global one rather than a regional one.
 * @param locale A locale code, such as `fr-FR`.
 * @returns The locale code. For example, `fr`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleId(locale: string): string {
  return ɵfindLocaleData(locale)[ɵLocaleDataIndex.LocaleId];
}

/**
 * Retrieves day period strings for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized period strings. For example, `[AM, PM]` for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDayPeriods(
    locale: string, formStyle: FormStyle, width: TranslationWidth): Readonly<[string, string]> {
  const data = ɵfindLocaleData(locale);
  const amPmData = <[string, string][][]>[
    data[ɵLocaleDataIndex.DayPeriodsFormat], data[ɵLocaleDataIndex.DayPeriodsStandalone]
  ];
  const amPm = getLastDefinedValue(amPmData, formStyle);
  return getLastDefinedValue(amPm, width);
}

/**
 * Retrieves days of the week for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,`[Sunday, Monday, ... Saturday]` for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDayNames(
    locale: string, formStyle: FormStyle, width: TranslationWidth): ReadonlyArray<string> {
  const data = ɵfindLocaleData(locale);
  const daysData =
      <string[][][]>[data[ɵLocaleDataIndex.DaysFormat], data[ɵLocaleDataIndex.DaysStandalone]];
  const days = getLastDefinedValue(daysData, formStyle);
  return getLastDefinedValue(days, width);
}

/**
 * Retrieves months of the year for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,  `[January, February, ...]` for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleMonthNames(
    locale: string, formStyle: FormStyle, width: TranslationWidth): ReadonlyArray<string> {
  const data = ɵfindLocaleData(locale);
  const monthsData =
      <string[][][]>[data[ɵLocaleDataIndex.MonthsFormat], data[ɵLocaleDataIndex.MonthsStandalone]];
  const months = getLastDefinedValue(monthsData, formStyle);
  return getLastDefinedValue(months, width);
}

/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @param locale A locale code for the locale format rules to use.
 * @param width The required character width.

 * @returns An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleEraNames(
    locale: string, width: TranslationWidth): Readonly<[string, string]> {
  const data = ɵfindLocaleData(locale);
  const erasData = <[string, string][]>data[ɵLocaleDataIndex.Eras];
  return getLastDefinedValue(erasData, width);
}

/**
 * Retrieves the first day of the week for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleFirstDayOfWeek(locale: string): WeekDay {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.FirstDayOfWeek];
}

/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The range of day values, `[startDay, endDay]`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleWeekEndRange(locale: string): [WeekDay, WeekDay] {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.WeekendRange];
}

/**
 * Retrieves a localized date-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDateFormat(locale: string, width: FormatWidth): string {
  const data = ɵfindLocaleData(locale);
  return getLastDefinedValue(data[ɵLocaleDataIndex.DateFormat], width);
}

/**
 * Retrieves a localized time-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)

 * @publicApi
 */
export function getLocaleTimeFormat(locale: string, width: FormatWidth): string {
  const data = ɵfindLocaleData(locale);
  return getLastDefinedValue(data[ɵLocaleDataIndex.TimeFormat], width);
}

/**
 * Retrieves a localized date-time formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDateTimeFormat(locale: string, width: FormatWidth): string {
  const data = ɵfindLocaleData(locale);
  const dateTimeFormatData = <string[]>data[ɵLocaleDataIndex.DateTimeFormat];
  return getLastDefinedValue(dateTimeFormatData, width);
}

/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @param locale The locale code.
 * @param symbol The symbol to localize.
 * @returns The character for the localized symbol.
 * @see `NumberSymbol`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleNumberSymbol(locale: string, symbol: NumberSymbol): string {
  const data = ɵfindLocaleData(locale);
  const res = data[ɵLocaleDataIndex.NumberSymbols][symbol];
  if (typeof res === 'undefined') {
    if (symbol === NumberSymbol.CurrencyDecimal) {
      return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
    } else if (symbol === NumberSymbol.CurrencyGroup) {
      return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Group];
    }
  }
  return res;
}

/**
 * Retrieves a number format for a given locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,678". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders
 * that stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders. For example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the appropriate `NumberSymbol` for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | Replaced by a currency symbol, such as $ or USD. |
 * | % | Marks a percent format. The % symbol may change position, but must be retained. |
 * | E | Marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * @param locale A locale code for the locale format rules to use.
 * @param type The type of numeric value to be formatted (such as `Decimal` or `Currency`.)
 * @returns The localized format string.
 * @see `NumberFormatStyle`
 * @see [CLDR website](http://cldr.unicode.org/translation/number-patterns)
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleNumberFormat(locale: string, type: NumberFormatStyle): string {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.NumberFormats][type];
}

/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The localized symbol character,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleCurrencySymbol(locale: string): string|null {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.CurrencySymbol] || null;
}

/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency name,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleCurrencyName(locale: string): string|null {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.CurrencyName] || null;
}

/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 * @publicApi
 */
export function getLocaleCurrencyCode(locale: string): string|null {
  return ɵgetLocaleCurrencyCode(locale);
}

/**
 * Retrieves the currency values for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency values.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 */
function getLocaleCurrencies(locale: string): {[code: string]: CurrenciesSymbols} {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.Currencies];
}

/**
 * @alias core/ɵgetLocalePluralCase
 * @publicApi
 */
export const getLocalePluralCase: (locale: string) => ((value: number) => Plural) =
    ɵgetLocalePluralCase;

function checkFullData(data: any) {
  if (!data[ɵLocaleDataIndex.ExtraData]) {
    throw new Error(`Missing extra locale data for the locale "${
        data[ɵLocaleDataIndex
                 .LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
  }
}

/**
 * Retrieves locale-specific rules used to determine which day period to use
 * when more than one period is defined for a locale.
 *
 * There is a rule for each defined day period. The
 * first rule is applied to the first day period and so on.
 * Fall back to AM/PM when no rules are available.
 *
 * A rule can specify a period as time range, or as a single time value.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n-common-format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see `getLocaleExtraDayPeriods()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriodRules(locale: string): (Time|[Time, Time])[] {
  const data = ɵfindLocaleData(locale);
  checkFullData(data);
  const rules = data[ɵLocaleDataIndex.ExtraData][ɵExtraLocaleDataIndex.ExtraDayPeriodsRules] || [];
  return rules.map((rule: string|[string, string]) => {
    if (typeof rule === 'string') {
      return extractTime(rule);
    }
    return [extractTime(rule[0]), extractTime(rule[1])];
  });
}

/**
 * Retrieves locale-specific day periods, which indicate roughly how a day is broken up
 * in different languages.
 * For example, for `en-US`, periods are morning, noon, afternoon, evening, and midnight.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n-common-format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see `getLocaleExtraDayPeriodRules()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriods(
    locale: string, formStyle: FormStyle, width: TranslationWidth): string[] {
  const data = ɵfindLocaleData(locale);
  checkFullData(data);
  const dayPeriodsData = <string[][][]>[
    data[ɵLocaleDataIndex.ExtraData][ɵExtraLocaleDataIndex.ExtraDayPeriodFormats],
    data[ɵLocaleDataIndex.ExtraData][ɵExtraLocaleDataIndex.ExtraDayPeriodStandalone]
  ];
  const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
  return getLastDefinedValue(dayPeriods, width) || [];
}

/**
 * Retrieves the writing direction of a specified locale
 * @param locale A locale code for the locale format rules to use.
 * @publicApi
 * @returns 'rtl' or 'ltr'
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 */
export function getLocaleDirection(locale: string): 'ltr'|'rtl' {
  const data = ɵfindLocaleData(locale);
  return data[ɵLocaleDataIndex.Directionality];
}

/**
 * Retrieves the first value that is defined in an array, going backwards from an index position.
 *
 * To avoid repeating the same data (as when the "format" and "standalone" forms are the same)
 * add the first value to the locale data arrays, and add other values only if they are different.
 *
 * @param data The data array to retrieve from.
 * @param index A 0-based index into the array to start from.
 * @returns The value immediately before the given index position.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
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
 * Represents a time value with hours and minutes.
 *
 * @publicApi
 */
export type Time = {
  hours: number,
  minutes: number
};

/**
 * Extracts the hours and minutes from a string like "15:45"
 */
function extractTime(time: string): Time {
  const [h, m] = time.split(':');
  return {hours: +h, minutes: +m};
}



/**
 * Retrieves the currency symbol for a given currency code.
 *
 * For example, for the default `en-US` locale, the code `USD` can
 * be represented by the narrow symbol `$` or the wide symbol `US$`.
 *
 * @param code The currency code.
 * @param format The format, `wide` or `narrow`.
 * @param locale A locale code for the locale format rules to use.
 *
 * @returns The symbol, or the currency code if no symbol is available.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getCurrencySymbol(code: string, format: 'wide'|'narrow', locale = 'en'): string {
  const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
  const symbolNarrow = currency[ɵCurrencyIndex.SymbolNarrow];

  if (format === 'narrow' && typeof symbolNarrow === 'string') {
    return symbolNarrow;
  }

  return currency[ɵCurrencyIndex.Symbol] || code;
}

// Most currencies have cents, that's why the default is 2
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;

/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @param code The currency code.
 * @returns The number of decimal digits, typically 0 or 2.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
 */
export function getNumberOfCurrencyDigits(code: string): number {
  let digits;
  const currency = CURRENCIES_EN[code];
  if (currency) {
    digits = currency[ɵCurrencyIndex.NbOfDigits];
  }
  return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
