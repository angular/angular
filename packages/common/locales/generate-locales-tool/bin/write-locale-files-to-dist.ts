/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {join} from 'path';

import {CldrData} from '../cldr-data';
import {generateBaseCurrencies} from '../locale-base-currencies';
import {generateLocaleExtra} from '../locale-extra-file';
import {generateLocale} from '../locale-file';
import {generateLocaleGlobalFile} from '../locale-global-file';

import {BASE_LOCALE} from './base-locale';

/**
 * Generates locale files for each available CLDR locale and writes it to the
 * specified directory.
 */
function main(outputDir: string|undefined) {
  if (outputDir === undefined) {
    throw Error('No output directory specified.');
  }

  const cldrData = new CldrData();
  const baseLocaleData = cldrData.getLocaleData(BASE_LOCALE)!;
  const baseCurrencies = generateBaseCurrencies(baseLocaleData);
  const extraLocaleDir = join(outputDir, 'extra');
  const globalLocaleDir = join(outputDir, 'global');

  console.info(`Writing locales to: ${outputDir}`);

  // Generate locale files for all locales we have data for.
  cldrData.availableLocales.forEach((localeData) => {
    const locale = localeData.locale;
    const localeFile = generateLocale(locale, localeData, baseCurrencies);
    const localeExtraFile = generateLocaleExtra(locale, localeData);
    const localeGlobalFile = generateLocaleGlobalFile(locale, localeData, baseCurrencies);

    writeFileSync(join(outputDir, `${locale}.ts`), localeFile);
    writeFileSync(join(extraLocaleDir, `${locale}.ts`), localeExtraFile);
    writeFileSync(join(globalLocaleDir, `${locale}.js`), localeGlobalFile);
  });
}

main(process.argv[2]);
