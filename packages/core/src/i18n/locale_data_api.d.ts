/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
export declare function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void;
/**
 * Finds the locale data for a given locale.
 *
 * @param locale The locale code.
 * @returns The locale data.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
export declare function findLocaleData(locale: string): any;
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 */
export declare function getLocaleCurrencyCode(locale: string): string | null;
/**
 * Retrieves the plural function used by ICU expressions to determine the plural case to use
 * for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The plural function for the locale.
 * @see {@link NgPlural}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
export declare function getLocalePluralCase(locale: string): (value: number) => number;
/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`
 * or from the global `ng.common.locale`.
 */
export declare function getLocaleData(normalizedLocale: string): any;
/**
 * Helper function to remove all the locale data from `LOCALE_DATA`.
 */
export declare function unregisterAllLocaleData(): void;
/**
 * Index of each type of locale data from the locale data array
 */
export declare enum LocaleDataIndex {
    LocaleId = 0,
    DayPeriodsFormat = 1,
    DayPeriodsStandalone = 2,
    DaysFormat = 3,
    DaysStandalone = 4,
    MonthsFormat = 5,
    MonthsStandalone = 6,
    Eras = 7,
    FirstDayOfWeek = 8,
    WeekendRange = 9,
    DateFormat = 10,
    TimeFormat = 11,
    DateTimeFormat = 12,
    NumberSymbols = 13,
    NumberFormats = 14,
    CurrencyCode = 15,
    CurrencySymbol = 16,
    CurrencyName = 17,
    Currencies = 18,
    Directionality = 19,
    PluralCase = 20,
    ExtraData = 21
}
/**
 * Index of each type of locale data from the extra locale data array
 */
export declare const enum ExtraLocaleDataIndex {
    ExtraDayPeriodFormats = 0,
    ExtraDayPeriodStandalone = 1,
    ExtraDayPeriodsRules = 2
}
/**
 * Index of each value in currency data (used to describe CURRENCIES_EN in currencies.ts)
 */
export declare const enum CurrencyIndex {
    Symbol = 0,
    SymbolNarrow = 1,
    NbOfDigits = 2
}
