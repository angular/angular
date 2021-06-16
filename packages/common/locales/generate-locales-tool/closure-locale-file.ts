/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrStatic} from 'cldrjs';

import {CldrData} from './cldr-data';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocale} from './locale-file';

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
export function generateClosureLocaleFile(cldrData: CldrData, baseCurrencies: BaseCurrencies) {
  const locales = cldrData.availableLocales;

  function generateLocaleConstant(localeData: CldrStatic): string {
    const locale = localeData.locale;
    const localeNameFormattedForJs = formatLocale(locale);
    return generateLocale(locale, localeData, baseCurrencies)
        .replace(`${fileHeader}\n`, '')
        .replace('export default ', `export const locale_${localeNameFormattedForJs} = `)
        .replace('function plural', `function plural_${localeNameFormattedForJs}`)
        .replace(/,\s+plural/, `, plural_${localeNameFormattedForJs}`)
        .replace(/\s*const u = undefined;\s*/, '');
  }

  function generateCase(localeName: string) {
    return `case '${localeName}':\n` +
        `l = locale_${formatLocale(localeName)};\n` +
        `break;\n`;
  }

  return `${fileHeader}

import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;

${locales.map(locale => `${generateLocaleConstant(locale)}`).join('\n')}

let l: any;

switch (goog.LOCALE) {
${locales.map(localeData => generateCase(localeData.locale)).join('')}}

if (l) {
  registerLocaleData(l);
}
`;
}

function formatLocale(locale: string): string {
  return locale.replace(/-/g, '_');
}
