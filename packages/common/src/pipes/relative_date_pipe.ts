/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, InjectionToken, LOCALE_ID, Optional, Pipe, PipeTransform} from '@angular/core';

import {toDate} from '../i18n/format_date';

import {invalidPipeArgumentError} from './utils';

/**
 * An interface that describes the relative date pipe configuration, which can be provided using the
 * `RELATIVE_DATE_PIPE_DEFAULT_OPTIONS` token.
 *
 * @see {@link RELATIVE_DATE_PIPE_DEFAULT_OPTIONS}
 *
 * @publicApi
 */
export interface RelativeDatePipeConfig {
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

/**
 * DI token that allows to provide default configuration for the `RelativeDatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `style`: configures the length of the output message. Options are `'long'` (default),
 *   `'short'`, or `'narrow'`.
 * - `numeric`: configures whether to always use numeric values. Options are `'always'` (default)
 *   or `'auto'` (e.g., "yesterday" instead of "1 day ago").
 *
 * @see {@link RelativeDatePipeConfig}
 *
 * @usageNotes
 *
 * Override the default style by providing a value using the token:
 * ```ts
 * providers: [
 *   {provide: RELATIVE_DATE_PIPE_DEFAULT_OPTIONS, useValue: {style: 'short', numeric: 'auto'}}
 * ]
 * ```
 *
 * @publicApi
 */
export const RELATIVE_DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken<RelativeDatePipeConfig>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'RELATIVE_DATE_PIPE_DEFAULT_OPTIONS' : '',
);

/**
 * Unit thresholds ordered from largest to smallest. Each entry maps an
 * `Intl.RelativeTimeFormat` unit to its approximate duration in milliseconds.
 *
 * Note: year and month use averaged values (365.25 days/year, 30.44 days/month)
 * which may produce slightly unexpected results at boundaries (e.g., exactly
 * 30 days could resolve to "4 weeks ago" rather than "1 month ago").
 */
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365.25 * 24 * 60 * 60 * 1000],
  ['month', 30.44 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date value as a relative time string (e.g., "5 minutes ago", "in 3 days").
 *
 * Uses the browser's `Intl.RelativeTimeFormat` API to produce locale-aware relative time strings.
 *
 * This is a pure pipe, which means the output is computed once when the input changes.
 * The relative time string will not automatically update as time passes. If you need
 * live-updating relative times, consider using `toSignal()` with an interval-based
 * Observable to periodically refresh the input reference, or create a custom impure pipe.
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @usageNotes
 *
 * ### Usage
 *
 * ```angular-ts
 * @Component({
 *   selector: 'relative-date-example',
 *   template: `
 *     <p>{{ pastDate | relativeDate }}</p>           <!-- "5 minutes ago" -->
 *     <p>{{ futureDate | relativeDate:'short' }}</p> <!-- "in 3 mo." -->
 *     <p>{{ yesterday | relativeDate:'long':'auto' }}</p>  <!-- "yesterday" -->
 *   `
 * })
 * export class RelativeDateExample {
 *   pastDate = Date.now() - 5 * 60 * 1000;
 *   futureDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
 *   yesterday = Date.now() - 24 * 60 * 60 * 1000;
 * }
 * ```
 *
 * @publicApi
 */
@Pipe({
  name: 'relativeDate',
})
export class RelativeDatePipe implements PipeTransform {
  private cachedFormatter: Intl.RelativeTimeFormat | null = null;
  private cachedFormatterKey: string = '';

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(RELATIVE_DATE_PIPE_DEFAULT_OPTIONS)
    @Optional()
    private defaultOptions?: RelativeDatePipeConfig | null,
  ) {}

  /**
   * @param value The date expression: a `Date` object, a number
   * (milliseconds since UTC epoch), or an ISO string (https://www.w3.org/TR/NOTE-datetime).
   * @param style The formatting style: `'long'` (default), `'short'`, or `'narrow'`.
   * @param numeric Whether to always use numeric values: `'always'` (default) or `'auto'`
   * (e.g., "yesterday" instead of "1 day ago").
   * @param locale A locale code for the locale format rules to use.
   * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
   * @returns A relative time string (e.g., "5 minutes ago", "in 2 days").
   */
  transform(
    value: Date | string | number,
    style?: 'long' | 'short' | 'narrow',
    numeric?: 'always' | 'auto',
    locale?: string,
  ): string | null;
  transform(
    value: null | undefined,
    style?: 'long' | 'short' | 'narrow',
    numeric?: 'always' | 'auto',
    locale?: string,
  ): null;
  transform(
    value: Date | string | number | null | undefined,
    style?: 'long' | 'short' | 'narrow',
    numeric?: 'always' | 'auto',
    locale?: string,
  ): string | null;
  transform(
    value: Date | string | number | null | undefined,
    style?: 'long' | 'short' | 'narrow',
    numeric?: 'always' | 'auto',
    locale?: string,
  ): string | null {
    if (value == null || value === '' || value !== value) return null;

    try {
      const date = toDate(value);
      const diffMs = date.getTime() - Date.now();

      const _style = style ?? this.defaultOptions?.style ?? 'long';
      const _numeric = numeric ?? this.defaultOptions?.numeric ?? 'always';
      const _locale = locale || this.locale;

      const formatter = this.getFormatter(_locale, _style, _numeric);

      for (const [unit, threshold] of UNITS) {
        if (Math.abs(diffMs) >= threshold || unit === 'second') {
          return formatter.format(Math.trunc(diffMs / threshold), unit);
        }
      }

      // This point is unreachable because the loop always matches 'second' as the last unit,
      // but TypeScript requires a return statement.
      return formatter.format(0, 'second');
    } catch (error) {
      throw invalidPipeArgumentError(RelativeDatePipe, (error as Error).message);
    }
  }

  private getFormatter(
    locale: string,
    style: 'long' | 'short' | 'narrow',
    numeric: 'always' | 'auto',
  ): Intl.RelativeTimeFormat {
    const key = `${locale}:${style}:${numeric}`;
    if (this.cachedFormatterKey !== key) {
      this.cachedFormatter = new Intl.RelativeTimeFormat(locale, {style, numeric});
      this.cachedFormatterKey = key;
    }
    return this.cachedFormatter!;
  }
}
