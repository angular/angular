/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform, Type} from '@angular/core';
import {NUMBER_FORMAT_REGEXP, parseIntAutoRadix} from '../../i18n/format_number';
import {NumberFormatStyle} from '../../i18n/locale_data_api';
import {invalidPipeArgumentError} from '../invalid_pipe_argument_error';
import {NumberFormatter} from './intl';

function formatNumber(
    pipe: Type<any>, locale: string, value: number | string, style: NumberFormatStyle,
    digits?: string | null, currency: string | null = null,
    currencyAsSymbol: boolean = false): string|null {
  if (value == null) return null;

  // Convert strings to numbers
  value = typeof value === 'string' && !isNaN(+value - parseFloat(value)) ? +value : value;
  if (typeof value !== 'number') {
    throw invalidPipeArgumentError(pipe, value);
  }

  let minInt: number|undefined;
  let minFraction: number|undefined;
  let maxFraction: number|undefined;
  if (style !== NumberFormatStyle.Currency) {
    // rely on Intl default for currency
    minInt = 1;
    minFraction = 0;
    maxFraction = 3;
  }

  if (digits) {
    const parts = digits.match(NUMBER_FORMAT_REGEXP);
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
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='DeprecatedNumberPipe'}
 *
 * @ngModule CommonModule
 * @publicApi
 */
@Pipe({name: 'number'})
export class DeprecatedDecimalPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits?: string): string|null {
    return formatNumber(
        DeprecatedDecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
  }
}

/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Formats a number as percentage according to locale rules.
 *
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='DeprecatedPercentPipe'}
 *
 * @publicApi
 */
@Pipe({name: 'percent'})
export class DeprecatedPercentPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits?: string): string|null {
    return formatNumber(
        DeprecatedPercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
  }
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
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
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='DeprecatedCurrencyPipe'}
 *
 * @publicApi
 */
@Pipe({name: 'currency'})
export class DeprecatedCurrencyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(
      value: any, currencyCode: string = 'USD', symbolDisplay: boolean = false,
      digits?: string): string|null {
    return formatNumber(
        DeprecatedCurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits,
        currencyCode, symbolDisplay);
  }
}
