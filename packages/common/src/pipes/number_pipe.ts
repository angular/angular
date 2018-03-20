/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatCurrency, formatNumber, formatPercent} from '../i18n/format_number';
import {getCurrencySymbol} from '../i18n/locale_data_api';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @whatItDoes Uses the function {@link formatNumber} to format a number according to locale rules.
 * @howToUse `number_expression | number[:digitInfo[:locale]]`
 * @description
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the locale.
 *
 * Where:
 * - `value` is a number
 * - `digitInfo` is a `string` which has a following format: <br>
 *     <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
 *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
 *   - `minFractionDigits` is the minimum number of digits after the decimal point. Defaults to `0`.
 *   - `maxFractionDigits` is the maximum number of digits after the decimal point. Defaults to `3`.
 * - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default).
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

  transform(value: any, digitsInfo?: string, locale?: string): string|null {
    if (isEmpty(value)) return null;

    locale = locale || this._locale;

    try {
      const num = strToNumber(value);
      return formatNumber(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(DecimalPipe, error.message);
    }
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Uses the function {@link formatPercent} to format a number as a percentage according
 * to locale rules.
 * @howToUse `number_expression | percent[:digitInfo[:locale]]`
 * @description
 *
 * Formats a number as percentage.
 *
 * Where:
 * - `value` is a number.
 * - `digitInfo` See {@link DecimalPipe} for more details.
 * - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default).
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='PercentPipe'}
 *
 * @stable
 */
@Pipe({name: 'percent'})
export class PercentPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digitsInfo?: string, locale?: string): string|null {
    if (isEmpty(value)) return null;

    locale = locale || this._locale;

    try {
      const num = strToNumber(value);
      return formatPercent(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(PercentPipe, error.message);
    }
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Uses the functions {@link getCurrencySymbol} and {@link formatCurrency} to format a
 * number as currency using locale rules.
 * @howToUse `number_expression | currency[:currencyCode[:display[:digitInfo[:locale]]]]`
 * @description
 *
 * Use `currency` to format a number as currency.
 *
 * Where:
 * - `value` is a number.
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `display` indicates whether to show the currency symbol, the code or a custom value:
 *   - `code`: use code (e.g. `USD`).
 *   - `symbol`(default): use symbol (e.g. `$`).
 *   - `symbol-narrow`: some countries have two symbols for their currency, one regular and one
 *   narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
 *   - `string`: use this value instead of a code or a symbol.
 *   - boolean (deprecated from v5): `true` for symbol and false for `code`.
 *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
 * - `digitInfo` See {@link DecimalPipe} for more details.
 * - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default).
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='CurrencyPipe'}
 *
 * @stable
 */
@Pipe({name: 'currency'})
export class CurrencyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(
      value: any, currencyCode?: string,
      display: 'code'|'symbol'|'symbol-narrow'|string|boolean = 'symbol', digitsInfo?: string,
      locale?: string): string|null {
    if (isEmpty(value)) return null;

    locale = locale || this._locale;

    if (typeof display === 'boolean') {
      if (<any>console && <any>console.warn) {
        console.warn(
            `Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
      }
      display = display ? 'symbol' : 'code';
    }

    let currency: string = currencyCode || 'USD';
    if (display !== 'code') {
      if (display === 'symbol' || display === 'symbol-narrow') {
        currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
      } else {
        currency = display;
      }
    }

    try {
      const num = strToNumber(value);
      return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(CurrencyPipe, error.message);
    }
  }
}

function isEmpty(value: any): boolean {
  return value == null || value === '' || value !== value;
}

/**
 * Transforms a string into a number (if needed)
 */
function strToNumber(value: number | string): number {
  // Convert strings to numbers
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value);
  }
  if (typeof value !== 'number') {
    throw new Error(`${value} is not a number`);
  }
  return value;
}
