/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatNumber} from '../i18n/format_number';
import {NumberFormatStyle, findCurrencySymbol, getLocaleCurrencyName, getLocaleCurrencySymbol} from '../i18n/locale_data_api';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number according to locale rules.
 * @howToUse `number_expression | number[:digitInfo[:locale]]`
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
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
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

  transform(value: any, digits?: string, locale?: string): string|null {
    if (isEmpty(value)) return null;

    locale = locale || this._locale;

    const {str, error} = formatNumber(value, locale, NumberFormatStyle.Decimal, digits);

    if (error) {
      throw invalidPipeArgumentError(DecimalPipe, error);
    }

    return str;
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number as a percentage according to locale rules.
 * @howToUse `number_expression | percent[:digitInfo[:locale]]`
 *
 * @description
 *
 * Formats a number as percentage.
 *
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
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

  transform(value: any, digits?: string, locale?: string): string|null {
    if (isEmpty(value)) return null;

    locale = locale || this._locale;

    const {str, error} = formatNumber(value, locale, NumberFormatStyle.Percent, digits);

    if (error) {
      throw invalidPipeArgumentError(PercentPipe, error);
    }

    return str;
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number as currency using locale rules.
 * @howToUse `number_expression | currency[:currencyCode[:display[:digitInfo[:locale]]]]`
 * @description
 *
 * Use `currency` to format a number as currency.
 *
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `display` indicates whether to show the currency symbol or the code.
 *   - `code`(default): use code (e.g. `USD`).
 *   - `symbol`: use symbol (e.g. `$`).
 *   - `symbol-narrow`: some countries have two symbols for their currency, one regular and one
 *   - boolean (deprecated from v5): `true` for symbol and false for `code`
 *   narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
 *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
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
      display: 'code'|'symbol'|'symbol-narrow'|boolean = 'symbol', digits?: string,
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

    let currency = currencyCode || 'USD';
    if (display !== 'code') {
      currency = findCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow');
    }

    const {str, error} = formatNumber(value, locale, NumberFormatStyle.Currency, digits, currency);

    if (error) {
      throw invalidPipeArgumentError(CurrencyPipe, error);
    }

    return str;
  }
}

function isEmpty(value: any): boolean {
  return value == null || value === '' || value !== value;
}
