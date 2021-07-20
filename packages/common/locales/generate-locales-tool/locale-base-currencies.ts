/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrLocaleData} from './cldr-data';
import {fileHeader} from './file-header';
import {stringify} from './object-stringify';

export type BaseCurrencySymbols = [
  string
]|[string | undefined, string]|[string, undefined, number]|[string | undefined, string, number];

export type BaseCurrencies = {
  [code: string]: BaseCurrencySymbols|undefined;
};

/**
 * Generate a file that contains the list of currencies, their symbols and digits.
 */
export function generateBaseCurrenciesFile(baseLocaleData: CldrLocaleData) {
  const baseCurrencies = generateBaseCurrencies(baseLocaleData);

  return `${fileHeader}
export type CurrenciesSymbols = [string] | [string | undefined, string];

/** @internal */
export const CURRENCIES_EN: {[code: string]: CurrenciesSymbols | [string | undefined, string | undefined, number]} = ${
      stringify(baseCurrencies)};
`;
}

/**
 * Generate a list of currencies to be used as a base for other currencies
 * e.g.: {'ARS': [, '$'], 'AUD': ['A$', '$'], ...}
 */
export function generateBaseCurrencies(localeData: CldrLocaleData) {
  const currenciesData = localeData.main('numbers/currencies');
  const fractions = localeData.get(`supplemental/currencyData/fractions`);
  const currencies: BaseCurrencies = {};

  Object.keys(currenciesData).forEach(key => {
    let symbolsArray = [];
    const symbol = currenciesData[key].symbol;
    const symbolNarrow = currenciesData[key]['symbol-alt-narrow'];
    if (symbol && symbol !== key) {
      symbolsArray.push(symbol);
    }
    if (symbolNarrow && symbolNarrow !== symbol) {
      if (symbolsArray.length > 0) {
        symbolsArray.push(symbolNarrow);
      } else {
        symbolsArray = [undefined, symbolNarrow];
      }
    }
    if (fractions[key] && fractions[key]['_digits']) {
      const digits = parseInt(fractions[key]['_digits'], 10);
      if (symbolsArray.length === 2) {
        symbolsArray.push(digits);
      } else if (symbolsArray.length === 1) {
        symbolsArray = [...symbolsArray, undefined, digits];
      } else {
        symbolsArray = [undefined, undefined, digits];
      }
    }
    if (symbolsArray.length > 0) {
      currencies[key] = symbolsArray as BaseCurrencySymbols;
    }
  });
  return currencies;
}
