/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_DATA, LOCALE_ID, NgLocale, Optional, Pipe, PipeTransform, Type} from '@angular/core';

import {CURRENCIES} from '../i18n/currencies';
import {findNgLocale} from '../i18n/localization';

import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';

// todo (ocombe): add pipe "scientific" to format number
export enum NumberFormatStyle {
  Decimal,
  Percent,
  Currency,
  Scientific
}

function formatNumber(
    pipe: Type<any>, value: number | string, style: NumberFormatStyle, format: string,
    localeDatum: NgLocale, digitsInfo?: string | null, currency: string | null = null): string|
    null {
  if (value == null) return null;
  let number: number;

  // Convert strings to numbers
  number = typeof value === 'string' && isNumeric(value) ? +value : value as number;
  if (typeof number !== 'number') {
    throw invalidPipeArgumentError(pipe, number);
  }

  if (style === NumberFormatStyle.Percent) {
    number = number * 100;
  }

  const numStr = Math.abs(number) + '';
  const pattern = parseNumberFormat(format, localeDatum.numberSettings.symbols.minusSign);
  let formattedText = '';
  let isZero = false;

  if (!isFinite(number)) {
    formattedText = localeDatum.numberSettings.symbols.infinity;
  } else {
    const parsedNumber = parseNumber(numStr);

    let minInt = pattern.minInt;
    let minFraction = pattern.minFrac;
    let maxFraction = pattern.maxFrac;

    if (digitsInfo) {
      const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new Error(`${digitsInfo} is not a valid digit info for number pipes`);
      }
      if (parts[1] != null) {  // min integer digits
        minInt = parseIntAutoRadix(parts[1]);
      }
      if (parts[3] != null) {  // min fraction digits
        minFraction = parseIntAutoRadix(parts[3]);
      }
      if (parts[5] != null) {  // max fraction digits
        maxFraction = parseIntAutoRadix(parts[5]);
      } else if (parts[3] != null) {
        maxFraction = parseIntAutoRadix(parts[3]);
      }
    }

    roundNumber(parsedNumber, minFraction, maxFraction);

    let digits = parsedNumber.digits;
    let integerLen = parsedNumber.integerLen;
    const exponent = parsedNumber.exponent;
    let decimals = [];
    isZero = digits.reduce(function(isZero, d) { return isZero && !d; }, true);

    // pad zeros for small numbers
    while (integerLen < minInt) {
      digits.unshift(0);
      integerLen++;
    }

    // pad zeros for small numbers
    while (integerLen < 0) {
      digits.unshift(0);
      integerLen++;
    }

    // extract decimals digits
    if (integerLen > 0) {
      decimals = digits.splice(integerLen, digits.length);
    } else {
      decimals = digits;
      digits = [0];
    }

    // format the integer digits with grouping separators
    const groups = [];
    if (digits.length >= pattern.lgSize) {
      groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
    }

    while (digits.length > pattern.gSize) {
      groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
    }

    if (digits.length) {
      groups.unshift(digits.join(''));
    }

    formattedText = groups.join(
        currency && localeDatum.numberSettings.symbols.currencyGroup ?
            localeDatum.numberSettings.symbols.currencyGroup :
            localeDatum.numberSettings.symbols.group);

    // append the decimal digits
    if (decimals.length) {
      formattedText += localeDatum.numberSettings.symbols.decimal + decimals.join('');
    }

    if (exponent) {
      formattedText += localeDatum.numberSettings.symbols.exponential + '+' + exponent;
    }
  }

  if (number < 0 && !isZero) {
    formattedText = pattern.negPre + formattedText + pattern.negSuf;
  } else {
    formattedText = pattern.posPre + formattedText + pattern.posSuf;
  }

  if (style === NumberFormatStyle.Currency && currency !== null) {
    return formattedText.replace(new RegExp(CURRENCY_CHAR, 'g'), currency);
  }

  if (style === NumberFormatStyle.Percent) {
    return formattedText.replace(
        new RegExp(PERCENT_CHAR, 'g'), localeDatum.numberSettings.symbols.percentSign);
  }

  return formattedText;
}

interface ParsedNumberFormat {
  minInt: number;
  // the minimum number of digits required in the fraction part of the number
  minFrac: number;
  // the maximum number of digits required in the fraction part of the number
  maxFrac: number;
  // the string to go in front of a positive number
  posPre: string;
  // the string to go after a positive number
  posSuf: string;
  // the string to go in front of a negative number (e.g. `-` or `(`))
  negPre: string;
  // the string to go after a negative number (e.g. `)`)
  negSuf: string;
  // number of digits in each group of separated digits
  gSize: number;
  // number of digits in the last group of digits before the decimal separator
  lgSize: number;
}

function parseNumberFormat(format: string, minusSign = '-'): ParsedNumberFormat {
  const p = {
    minInt: 1,
    minFrac: 0,
    maxFrac: 0,
    posPre: '',
    posSuf: '',
    negPre: '',
    negSuf: '',
    gSize: 0,
    lgSize: 0
  };

  const patternParts = format.split(PATTERN_SEP), positive = patternParts[0],
        negative = patternParts[1];

  const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ?
      positive.split(DECIMAL_SEP) :
      [
        positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
        positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
      ],
        integer = positiveParts[0], fraction = positiveParts[1] || '';

  p.posPre = integer.substr(0, integer.indexOf(DIGIT_CHAR));

  for (let i = 0; i < fraction.length; i++) {
    const ch = fraction.charAt(i);
    if (ch === ZERO_CHAR) {
      p.minFrac = p.maxFrac = i + 1;
    } else if (ch === DIGIT_CHAR) {
      p.maxFrac = i + 1;
    } else {
      p.posSuf += ch;
    }
  }

  const groups = integer.split(GROUP_SEP);
  p.gSize = groups[1] ? groups[1].length : 0;
  p.lgSize = (groups[2] || groups[1]) ? (groups[2] || groups[1]).length : 0;

  if (negative) {
    const trunkLen = positive.length - p.posPre.length - p.posSuf.length,
          pos = negative.indexOf(DIGIT_CHAR);

    p.negPre = negative.substr(0, pos).replace(/'/g, '');
    p.negSuf = negative.substr(pos + trunkLen).replace(/'/g, '');
  } else {
    p.negPre = minusSign + p.posPre;
    p.negSuf = p.posSuf;
  }

  return p;
}

interface ParsedNumber {
  digits: number[];
  exponent: number;
  integerLen: number;
}

/**
 * Parse a number (as a string) into three components that can be used
 * for formatting the number.
 *
 * (Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/)
 *
 * @param  {string} numStr The number to parse
 * @return {ParsedNumber} An object describing this number, containing the following keys:
 *  - digits : an array of digits containing leading zeros as necessary
 *  - integerLen : the number of the digits in `d` that are to the left of the decimal point
 *  - exponent : the exponent for numbers that would need more than `MAX_DIGITS` digits in `d`
 *
 */
function parseNumber(numStr: string): ParsedNumber {
  let exponent = 0, digits, integerLen;
  let i, j, zeros;

  // Decimal point?
  if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
    numStr = numStr.replace(DECIMAL_SEP, '');
  }

  // Exponential form?
  if ((i = numStr.search(/e/i)) > 0) {
    // Work out the exponent.
    if (integerLen < 0) integerLen = i;
    integerLen += +numStr.slice(i + 1);
    numStr = numStr.substring(0, i);
  } else if (integerLen < 0) {
    // There was no decimal point or exponent so it is an integer.
    integerLen = numStr.length;
  }

  // Count the number of leading zeros.
  for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) { /* empty */
  }

  if (i === (zeros = numStr.length)) {
    // The digits are all zero.
    digits = [0];
    integerLen = 1;
  } else {
    // Count the number of trailing zeros
    zeros--;
    while (numStr.charAt(zeros) === ZERO_CHAR) zeros--;

    // Trailing zeros are insignificant so ignore them
    integerLen -= i;
    digits = [];
    // Convert string to array of digits without leading/trailing zeros.
    for (j = 0; i <= zeros; i++, j++) {
      digits[j] = +numStr.charAt(i);
    }
  }

  // If the number overflows the maximum allowed digits then use an exponent.
  if (integerLen > MAX_DIGITS) {
    digits = digits.splice(0, MAX_DIGITS - 1);
    exponent = integerLen - 1;
    integerLen = 1;
  }

  return {digits, exponent, integerLen};
}

/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 */
function roundNumber(parsedNumber: ParsedNumber, minFrac: number, maxFrac: number) {
  let digits = parsedNumber.digits;
  let fractionLen = digits.length - parsedNumber.integerLen;

  const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);

  // The index of the digit to where rounding is to occur
  let roundAt = fractionSize + parsedNumber.integerLen;
  let digit = digits[roundAt];

  if (roundAt > 0) {
    // Drop fractional digits beyond `roundAt`
    digits.splice(Math.max(parsedNumber.integerLen, roundAt));

    // Set non-fractional digits beyond `roundAt` to 0
    for (let j = roundAt; j < digits.length; j++) {
      digits[j] = 0;
    }
  } else {
    // We rounded to zero so reset the parsedNumber
    fractionLen = Math.max(0, fractionLen);
    parsedNumber.integerLen = 1;
    digits.length = Math.max(1, roundAt = fractionSize + 1);
    digits[0] = 0;
    for (let i = 1; i < roundAt; i++) digits[i] = 0;
  }

  if (digit >= 5) {
    if (roundAt - 1 < 0) {
      for (let k = 0; k > roundAt; k--) {
        digits.unshift(0);
        parsedNumber.integerLen++;
      }
      digits.unshift(1);
      parsedNumber.integerLen++;
    } else {
      digits[roundAt - 1]++;
    }
  }

  // Pad out with zeros to get the required fraction length
  for (; fractionLen < Math.max(0, fractionSize); fractionLen++) digits.push(0);


  // Do any carrying, e.g. a digit was rounded up to 10
  const carry = digits.reduceRight(function(carry, d, i, digits) {
    d = d + carry;
    digits[i] = d % 10;
    return Math.floor(d / 10);
  }, 0);
  if (carry) {
    digits.unshift(carry);
    parsedNumber.integerLen++;
  }
}

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
  constructor(
      @Inject(LOCALE_ID) private locale: string,
      @Optional() @Inject(LOCALE_DATA) private localeData: NgLocale[]) {}

  transform(value: any, digits?: string, locale?: string): string|null {
    const localeDatum = findNgLocale(locale || this.locale, this.localeData);
    return formatNumber(
        DecimalPipe, value, NumberFormatStyle.Decimal, localeDatum.numberSettings.formats.decimal,
        localeDatum, digits);
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
 * {@example common/pipes/ts/number_pipe.ts region='PercentPipe'}
 *
 * @stable
 */
@Pipe({name: 'percent'})
export class PercentPipe implements PipeTransform {
  constructor(
      @Inject(LOCALE_ID) private locale: string,
      @Optional() @Inject(LOCALE_DATA) private localeData: NgLocale[]) {}

  transform(value: any, digits?: string, locale?: string): string|null {
    const localeDatum = findNgLocale(locale || this.locale, this.localeData);
    return formatNumber(
        PercentPipe, value, NumberFormatStyle.Percent, localeDatum.numberSettings.formats.percent,
        localeDatum, digits);
  }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number as currency using locale rules.
 * @howToUse `number_expression | currency[:currencyCode[:symbolDisplay[:digitInfo[:locale]]]]`
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
 *   narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
 *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *  - `locale` is a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default)
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='CurrencyPipe'}
 *
 * @stable
 */
@Pipe({name: 'currency'})
export class CurrencyPipe implements PipeTransform {
  constructor(
      @Inject(LOCALE_ID) private locale: string,
      @Optional() @Inject(LOCALE_DATA) private localeData: NgLocale[]) {}

  transform(
      value: any, currencyCode?: string, symbolDisplay: 'code'|'symbol'|'symbol-narrow' = 'code',
      digits?: string, locale?: string): string|null {
    const localeDatum = findNgLocale(locale || this.locale, this.localeData);

    if (typeof symbolDisplay === 'boolean') {
      if (<any>console && <any>console.warn) {
        console.warn(
            `Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
      }
      symbolDisplay = symbolDisplay ? 'symbol' : 'code';
    }

    let currency: string;
    if (currencyCode) {
      if (symbolDisplay === 'symbol') {
        currency = CURRENCIES[currencyCode]['symbol'] || currencyCode;
      } else if (symbolDisplay === 'symbol-narrow') {
        currency = CURRENCIES[currencyCode]['symbolNarrow'] || CURRENCIES[currencyCode]['symbol'] ||
            currencyCode;
      } else {
        currency = currencyCode;
      }
    } else {
      currency =
          localeDatum.currencySettings[symbolDisplay === 'code' ? 'name' : 'symbol'] || 'USD';
    }

    return formatNumber(
        CurrencyPipe, value, NumberFormatStyle.Currency,
        localeDatum.numberSettings.formats.currency, localeDatum, digits, currency);
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
