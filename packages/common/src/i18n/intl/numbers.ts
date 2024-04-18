/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalizeLocale, parseDigitInfo} from './helpers';

const CURRENCY = 'currency';
const STANDARD_NOTATION = 'standard';
const SCIENTIFIC_NOTATION = 'scientific';

// JS formats primitive numbers >= 1e21 in scientific notation
// Intl keeps the number as is, so we need to handle this case
// For values >= 1e21 the Intl implementation will return
// a string as scientific notation like the native api does
const scientificNotationLimit = 1e21;

export function formatIntlNumber(num: number, locale: string, digitsInfo?: string): string {
  locale = normalizeLocale(locale);
  const {maximumFractionDigits, minimumIntegerDigits, minimumFractionDigits} =
    parseDigitInfo(digitsInfo);
  return Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumIntegerDigits,
    minimumFractionDigits,
    style: 'decimal',
    notation: num < scientificNotationLimit ? STANDARD_NOTATION : SCIENTIFIC_NOTATION,
  }).format(num);
}

export function formatIntlPercent(num: number, locale: string, digitsInfo?: string): string {
  locale = normalizeLocale(locale);
  const {maximumFractionDigits, minimumIntegerDigits, minimumFractionDigits} =
    parseDigitInfo(digitsInfo);
  return Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumIntegerDigits,
    minimumFractionDigits,
    style: 'percent',
    notation: num < scientificNotationLimit ? STANDARD_NOTATION : SCIENTIFIC_NOTATION,
  }).format(num);
}

export function formatIntlCurrency(
  num: number,
  locale: string,
  displayOrCurrency: string,
  currencyCode?: string,
  digitsInfo?: string,
): string {
  locale = normalizeLocale(locale);

  const {maximumFractionDigits, minimumIntegerDigits, minimumFractionDigits} =
    parseDigitInfo(digitsInfo);

  const isValidIntlDisplay = ['name', 'code', 'symbol', 'narrowSymbol'].includes(displayOrCurrency);
  let currencyDisplay = isValidIntlDisplay
    ? (displayOrCurrency as Intl.NumberFormatOptions['currencyDisplay'])
    : undefined;

  // If the currency is supported by Intl, it will handle the maximum fraction digit automatically
  // It will handle currencies that don't have sub-units (eg JPY, the japanese Yen)
  const isCurrencySupported = Intl.supportedValuesOf(CURRENCY).includes(currencyCode as string);

  const formatter = Intl.NumberFormat(locale, {
    maximumFractionDigits: isCurrencySupported
      ? // If maximumFractionDigits is defined, it will override the default maximum
        maximumFractionDigits
      : // For unsupported currencies, we always show a minimum of 2 fraction digits
        Math.max(maximumFractionDigits ?? 0, 2),
    minimumIntegerDigits,
    minimumFractionDigits,
    style: CURRENCY,
    currencyDisplay,

    // USD is a placeholder, it will be replaced later by the fallback formatting
    currency: isCurrencySupported ? currencyCode : 'USD',
  });

  if (isValidIntlDisplay && isCurrencySupported) {
    return formatter.format(num);
  }

  if (ngDevMode && isValidIntlDisplay && !currencyCode) {
    // TODO: create a runtime error
    throw new Error(
      `Currency formating requires passing a currencyCode when using a display format like: ${displayOrCurrency}`,
    );
  }

  // Fallback formatting where the currency is replaced
  const parts = formatter.formatToParts(num);
  return parts
    .map((part) => {
      if (part.type === CURRENCY) {
        // if isValidDisplay is false, displayOrCurrency is actually a currency label
        // if it's a valid display, we fallback to displayed the currency code
        part.value = isValidIntlDisplay ? currencyCode! : displayOrCurrency;
      }
      return part.value;
    })
    .join('')
    .trim();
}
