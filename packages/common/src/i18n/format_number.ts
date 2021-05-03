/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits, NumberFormatStyle, NumberSymbol} from './locale_data_api';

export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';

/**
 * Transforms a number to a locale string based on a style and a format.
 */
function formatNumberToLocaleString(
    value: number, pattern: ParsedNumberFormat, locale: string, groupSymbol: NumberSymbol,
    decimalSymbol: NumberSymbol, digitsInfo?: string, isPercent = false): string {
  let formattedText = '';
  let isZero = false;

  if (!isFinite(value)) {
    formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
  } else {
    let parsedNumber = parseNumber(value);

    if (isPercent) {
      parsedNumber = toPercent(parsedNumber);
    }

    let minInt = pattern.minInt;
    let minFraction = pattern.minFrac;
    let maxFraction = pattern.maxFrac;

    if (digitsInfo) {
      const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new Error(`${digitsInfo} is not a valid digit info`);
      }
      const minIntPart = parts[1];
      const minFractionPart = parts[3];
      const maxFractionPart = parts[5];
      if (minIntPart != null) {
        minInt = parseIntAutoRadix(minIntPart);
      }
      if (minFractionPart != null) {
        minFraction = parseIntAutoRadix(minFractionPart);
      }
      if (maxFractionPart != null) {
        maxFraction = parseIntAutoRadix(maxFractionPart);
      } else if (minFractionPart != null && minFraction > maxFraction) {
        maxFraction = minFraction;
      }
    }

    roundNumber(parsedNumber, minFraction, maxFraction);

    let digits = parsedNumber.digits;
    let integerLen = parsedNumber.integerLen;
    const exponent = parsedNumber.exponent;
    let decimals = [];
    isZero = digits.every(d => !d);

    // pad zeros for small numbers
    for (; integerLen < minInt; integerLen++) {
      digits.unshift(0);
    }

    // pad zeros for small numbers
    for (; integerLen < 0; integerLen++) {
      digits.unshift(0);
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

    formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));

    // append the decimal digits
    if (decimals.length) {
      formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
    }

    if (exponent) {
      formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
    }
  }

  if (value < 0 && !isZero) {
    formattedText = pattern.negPre + formattedText + pattern.negSuf;
  } else {
    formattedText = pattern.posPre + formattedText + pattern.posSuf;
  }

  return formattedText;
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code, such as `USD` for the US dollar and `EUR` for the euro.
 * Used to determine the number of digits in the decimal part.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatCurrency(
    value: number, locale: string, currency: string, currencyCode?: string,
    digitsInfo?: string): string {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));

  pattern.minFrac = getNumberOfCurrencyDigits(currencyCode!);
  pattern.maxFrac = pattern.minFrac;

  const res = formatNumberToLocaleString(
      value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
  return res
      .replace(CURRENCY_CHAR, currency)
      // if we have 2 time the currency character, the second one is ignored
      .replace(CURRENCY_CHAR, '')
      // If there is a spacing between currency character and the value and
      // the currency character is supressed by passing an empty string, the
      // spacing character would remain as part of the string. Then we
      // should remove it.
      .trim();
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * @publicApi
 *
 */
export function formatPercent(value: number, locale: string, digitsInfo?: string): string {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  const res = formatNumberToLocaleString(
      value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
  return res.replace(
      new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatNumber(value: number, locale: string, digitsInfo?: string): string {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  return formatNumberToLocaleString(
      value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}

interface ParsedNumberFormat {
  minInt: number;
  // the minimum number of digits required in the fraction part of the number
  minFrac: number;
  // the maximum number of digits required in the fraction part of the number
  maxFrac: number;
  // the prefix for a positive number
  posPre: string;
  // the suffix for a positive number
  posSuf: string;
  // the prefix for a negative number (e.g. `-` or `(`))
  negPre: string;
  // the suffix for a negative number (e.g. `)`)
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

  const patternParts = format.split(PATTERN_SEP);
  const positive = patternParts[0];
  const negative = patternParts[1];

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
  // an array of digits containing leading zeros as necessary
  digits: number[];
  // the exponent for numbers that would need more than `MAX_DIGITS` digits in `d`
  exponent: number;
  // the number of the digits in `d` that are to the left of the decimal point
  integerLen: number;
}

// Transforms a parsed number into a percentage by multiplying it by 100
function toPercent(parsedNumber: ParsedNumber): ParsedNumber {
  // if the number is 0, don't do anything
  if (parsedNumber.digits[0] === 0) {
    return parsedNumber;
  }

  // Getting the current number of decimals
  const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
  if (parsedNumber.exponent) {
    parsedNumber.exponent += 2;
  } else {
    if (fractionLen === 0) {
      parsedNumber.digits.push(0, 0);
    } else if (fractionLen === 1) {
      parsedNumber.digits.push(0);
    }
    parsedNumber.integerLen += 2;
  }

  return parsedNumber;
}

/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 */
function parseNumber(num: number): ParsedNumber {
  let numStr = Math.abs(num) + '';
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
      digits[j] = Number(numStr.charAt(i));
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
  if (minFrac > maxFrac) {
    throw new Error(`The minimum number of digits after fraction (${
        minFrac}) is higher than the maximum (${maxFrac}).`);
  }

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

  let dropTrailingZeros = fractionSize !== 0;
  // Minimal length = nb of decimals required + current nb of integers
  // Any number besides that is optional and can be removed if it's a trailing 0
  const minLen = minFrac + parsedNumber.integerLen;
  // Do any carrying, e.g. a digit was rounded up to 10
  const carry = digits.reduceRight(function(carry, d, i, digits) {
    d = d + carry;
    digits[i] = d < 10 ? d : d - 10;  // d % 10
    if (dropTrailingZeros) {
      // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
      if (digits[i] === 0 && i >= minLen) {
        digits.pop();
      } else {
        dropTrailingZeros = false;
      }
    }
    return d >= 10 ? 1 : 0;  // Math.floor(d / 10);
  }, 0);
  if (carry) {
    digits.unshift(carry);
    parsedNumber.integerLen++;
  }
}

export function parseIntAutoRadix(text: string): number {
  const result: number = parseInt(text);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}
