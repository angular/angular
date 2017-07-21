/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface DayPeriods {
  am: string;
  pm: string;
  noon?: string;
  midnight?: string;
  morning1?: string;
  morning2?: string;
  afternoon1?: string;
  afternoon2?: string;
  evening1?: string;
  evening2?: string;
  night1?: string;
  night2?: string;
  [key: string]: string|undefined;
}

export interface DayPeriodRules {
  noon?: string;
  midnight?: string;
  morning1?: DayPartFromTo;
  morning2?: DayPartFromTo;
  afternoon1?: DayPartFromTo;
  afternoon2?: DayPartFromTo;
  evening1?: DayPartFromTo;
  evening2?: DayPartFromTo;
  night1?: DayPartFromTo;
  night2?: DayPartFromTo;
}

export interface DayPartFromTo {
  from: string;
  to: string;
}

export interface DayPeriodsWidth {
  abbreviated: DayPeriods;
  narrow: DayPeriods;
  wide: DayPeriods;
  [key: string]: DayPeriods;
}

export interface DaysWidth {
  abbreviated: string[];
  narrow: string[];
  wide: string[];
  short: string[];
  [key: string]: string[];
}

export interface MonthsWidth {
  abbreviated: string[];
  narrow: string[];
  wide: string[];
  [key: string]: string[];
}

export interface ErasWidth {
  abbreviated: [string, string];
  narrow: [string, string];
  wide: [string, string];
  [key: string]: [string, string];
}

// days & months have "format" and "standAlone" styles
// see http://cldr.unicode.org/translation/date-time#TOC-Stand-Alone-vs.-Format-Styles
// Field  format	standAlone
// Month	M     	L
// Day    E	      c
export interface DateTimeTranslations {
  dayPeriods: {format: DayPeriodsWidth, standalone: DayPeriodsWidth};
  days: {format: DaysWidth, standalone: DaysWidth};
  months: {format: MonthsWidth, standalone: MonthsWidth};
  eras: ErasWidth;
}

export interface DateTimeFormat {
  full: string;
  long: string;
  medium: string;
  short: string;
}

export interface DateTimeFormats {
  date: DateTimeFormat;
  time: DateTimeFormat;
  dateTime: DateTimeFormat;
}

export interface DateTimeSettings {
  firstDayOfWeek: number;
  weekendRange: number[];
  formats: DateTimeFormats;
  dayPeriodRules?: DayPeriodRules;
}

export interface NumberFormat {
  currency: string;
  decimal: string;
  percent: string;
  scientific: string;
}

export interface NumberSymbols {
  decimal: string;
  currencyGroup?: string;
  group: string;
  list: string;
  percentSign: string;
  plusSign: string;
  minusSign: string;
  exponential: string;
  superscriptingExponent: string;
  perMille: string;
  infinity: string;
  nan: string;
  timeSeparator: string;
}

export interface NumberSettings {
  symbols: NumberSymbols;
  formats: NumberFormat;
}

export interface CurrencySettings {
  symbol?: string;
  name?: string;
}

/** @experimental */
export interface NgLocale {
  localeId: string;
  dateTimeTranslations: DateTimeTranslations;
  dateTimeSettings: DateTimeSettings;
  numberSettings: NumberSettings;
  currencySettings: CurrencySettings;
  getPluralCase: (value: number) => Plural;
}

/** @experimental */
export enum Plural {
  Zero,
  One,
  Two,
  Few,
  Many,
  Other,
}
