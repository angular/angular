/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CldrData} from '../cldr-data';
import {generateClosureLocaleFile} from '../closure-locale-file';
import {generateBaseCurrencies} from '../locale-base-currencies';

import {BASE_LOCALE} from './base-locale';

/** Generates the Google3 closure-locale file and prints it to the stdout. */
function main() {
  const cldrData = new CldrData();
  const baseLocaleData = cldrData.getLocaleData(BASE_LOCALE)!;
  const baseCurrencies = generateBaseCurrencies(baseLocaleData);

  process.stdout.write(generateClosureLocaleFile(cldrData, baseCurrencies));
}

main();
