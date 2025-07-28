/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {writeFileSync} from 'fs';
import {CldrData} from '../cldr-data';
import {generateBaseCurrenciesFile} from '../locale-base-currencies';

import {BASE_LOCALE} from './base-locale';

/** Generates the base currencies file and prints it to the stdout. */
function main() {
  const cldrData = new CldrData();
  const baseLocaleData = cldrData.getLocaleData(BASE_LOCALE)!;

  writeFileSync('base_currencies_generated.ts', generateBaseCurrenciesFile(baseLocaleData), {
    encoding: 'utf-8',
  });
}

main();
