/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Context-dependant translation forms for strings.
 * Typically the standalone version is for the nominative form of the word,
 * and the format version is used for the genitive case.
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 *
 * @deprecated locale data getters are deprecated
 *
 * TODO: Make it private once getter are removed
 */
export enum FormStyle {
  Format,
  Standalone,
}

/**
 * String widths available for translations.
 * The specific character widths are locale-specific.
 * Examples are given for the word "Sunday" in English.
 *
 * @publicApi
 *
 * @deprecated locale data getters are deprecated
 *
 * TODO: Make it private once getter are removed
 */
export enum TranslationWidth {
  /** 1 character for `en-US`. For example: 'S' */
  Narrow,
  /** 3 characters for `en-US`. For example: 'Sun' */
  Abbreviated,
  /** Full length for `en-US`. For example: "Sunday" */
  Wide,
  /** 2 characters for `en-US`, For example: "Su" */
  Short,
}

export enum DateType {
  FullYear,
  Month,
  Date,
  Hours,
  Minutes,
  Seconds,
  FractionalSeconds,
  Day,
}

export type DateFormatter = (date: Date, locale: string, offset: number) => string;

export enum ZoneWidth {
  Short,
  ShortGMT,
  Long,
  Extended,
}

export enum TranslationType {
  DayPeriods,
  Days,
  Months,
  Eras,
}
