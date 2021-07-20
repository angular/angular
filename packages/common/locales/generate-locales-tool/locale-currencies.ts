/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrLocaleData} from './cldr-data';
import {BaseCurrencies} from './locale-base-currencies';

/**
 * To minimize the file even more, we only output the differences compared to the base currency
 */
export function generateLocaleCurrencies(
    localeData: CldrLocaleData, baseCurrencies: BaseCurrencies) {
  const currenciesData = localeData.main('numbers/currencies');
  const currencies: any = {};

  Object.keys(currenciesData).forEach(code => {
    let symbolsArray = [];
    const symbol = currenciesData[code].symbol;
    const symbolNarrow = currenciesData[code]['symbol-alt-narrow'];
    if (symbol && symbol !== code) {
      symbolsArray.push(symbol);
    }
    if (symbolNarrow && symbolNarrow !== symbol) {
      if (symbolsArray.length > 0) {
        symbolsArray.push(symbolNarrow);
      } else {
        symbolsArray = [undefined, symbolNarrow];
      }
    }

    const baseCurrencySymbols = baseCurrencies[code] || [];

    // Jf locale data is equal to the one in the base currencies, skip this currency to
    // avoid unnecessary locale data that could be inferred from the base currency.
    if (baseCurrencySymbols && baseCurrencySymbols[0] === symbolsArray[0] &&
        baseCurrencySymbols[1] === symbolsArray[1]) {
      return;
    }

    currencies[code] = symbolsArray;
  });
  return currencies;
}

/**
 * Returns the currency code, symbol and name for a locale
 */
export function getCurrencySettings(localeName: string, localeData: CldrLocaleData) {
  const currencyInfo = localeData.main(`numbers/currencies`);
  let currentCurrency = '';

  // find the currency currently used in this country
  const currencies: any[] =
      localeData.get(`supplemental/currencyData/region/${localeData.attributes.territory}`) ||
      localeData.get(
          `supplemental/currencyData/region/${localeData.attributes.language.toUpperCase()}`);

  if (currencies) {
    currencies.some(currency => {
      const keys = Object.keys(currency);
      return keys.some(key => {
        if (currency[key]._from && !currency[key]._to) {
          return currentCurrency = key;
        }
      });
    });

    if (!currentCurrency) {
      throw new Error(`Unable to find currency for locale "${localeName}"`);
    }
  }

  let currencySettings = [undefined, undefined, undefined];

  if (currentCurrency) {
    currencySettings = [
      currentCurrency, currencyInfo[currentCurrency].symbol,
      currencyInfo[currentCurrency].displayName
    ];
  }

  return currencySettings;
}
