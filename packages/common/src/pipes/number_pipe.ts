/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform, Type} from '@angular/core';
import {NumberFormatStyle, NumberFormatter} from './intl';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

const _NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;

function formatNumber(
    pipe: Type<any>, locale: string, value: number | string, style: NumberFormatStyle,
    digits?: string | null, currency: string | null = null,
    currencyAsSymbol: boolean = false): string|null {
  if (value == null) return null;

  // Convert strings to numbers
  value = typeof value === 'string' && isNumeric(value) ? +value : value;
  if (typeof value !== 'number') {
    throw invalidPipeArgumentError(pipe, value);
  }

  let minInt: number|undefined = undefined;
  let minFraction: number|undefined = undefined;
  let maxFraction: number|undefined = undefined;
  if (style !== NumberFormatStyle.Currency) {
    // rely on Intl default for currency
    minInt = 1;
    minFraction = 0;
    maxFraction = 3;
  }

  if (digits) {
    const parts = digits.match(_NUMBER_FORMAT_REGEXP);
    if (parts === null) {
      throw new Error(`${digits} is not a valid digit info for number pipes`);
    }
    if (parts[1] != null) {  // min integer digits
      minInt = parseIntAutoRadix(parts[1]);
    }
    if (parts[3] != null) {  // min fraction digits
      minFraction = parseIntAutoRadix(parts[3]);
    }
    if (parts[5] != null) {  // max fraction digits
      maxFraction = parseIntAutoRadix(parts[5]);
    }
  }

  return NumberFormatter.format(value as number, locale, style, {
    minimumIntegerDigits: minInt,
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
    currency: currency,
    currencyAsSymbol: currencyAsSymbol,
  });
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number according to locale rules.
 * @howToUse `number_expression | number[:digitInfo]`
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * where `expression` is a number:
 *  - `digitInfo` is a `string` which has a following format: <br>
 *     <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>
 *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
 *   - `minFractionDigits` is the minimum number of digits after fraction. Defaults to `0`.
 *   - `maxFractionDigits` is the maximum number of digits after fraction. Defaults to `3`.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See {@linkDocs guide/browser-support} for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='NumberPipe'}
 *
 * @stable
 */
@Pipe({name: 'number'})
export class DecimalPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits?: string): string|null {
    return formatNumber(DecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number as a percentage according to locale rules.
 * @howToUse `number_expression | percent[:digitInfo]`
 *
 * @description
 *
 * Formats a number as percentage.
 *
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See {@linkDocs guide/browser-support} for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='PercentPipe'}
 *
 * @stable
 */
@Pipe({name: 'percent'})
export class PercentPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits?: string): string|null {
    return formatNumber(PercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number as currency using locale rules.
 * @howToUse `number_expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]`
 * @description
 *
 * Use `currency` to format a number as currency.
 *
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `symbolDisplay` is a boolean indicating whether to use the currency symbol or code.
 *   - `true`: use symbol (e.g. `$`).
 *   - `false`(default): use code (e.g. `USD`).
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See {@linkDocs guide/browser-support} for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='CurrencyPipe'}
 *
 * @stable
 */
@Pipe({name: 'currency'})
export class CurrencyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(
      value: any, currencyCode: string = 'USD', symbolDisplay: boolean = false,
      digits?: string): string|null {
    return formatNumber(
        CurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode,
        symbolDisplay);
  }
}

function parseIntAutoRadix(text: string): number {
  const result: number = parseInt(text);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}

export function isNumeric(value: any): boolean {
  return !isNaN(value - parseFloat(value));
}
