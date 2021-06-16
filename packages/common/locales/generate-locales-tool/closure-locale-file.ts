/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrData} from './cldr-data';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocale} from './locale-file';

/**
 * List of locales used by Closure. These locales will be incorporated in the generated
 * closure locale file. See:
 * https://github.com/google/closure-library/blob/master/closure/goog/i18n/datetimepatterns.js#L2450
 */
const GOOG_LOCALES = [
  'af',    'am',    'ar',    'ar-DZ', 'az',    'be',    'bg',    'bn',     'br',    'bs',
  'ca',    'chr',   'cs',    'cy',    'da',    'de',    'de-AT', 'de-CH',  'el',    'en-AU',
  'en-CA', 'en-GB', 'en-IE', 'en-IN', 'en-SG', 'en-ZA', 'es',    'es-419', 'es-MX', 'es-US',
  'et',    'eu',    'fa',    'fi',    'fr',    'fr-CA', 'ga',    'gl',     'gsw',   'gu',
  'haw',   'hi',    'hr',    'hu',    'hy',    'in',    'is',    'it',     'iw',    'ja',
  'ka',    'kk',    'km',    'kn',    'ko',    'ky',    'ln',    'lo',     'lt',    'lv',
  'mk',    'ml',    'mn',    'mo',    'mr',    'ms',    'mt',    'my',     'ne',    'nl',
  'no',    'or',    'pa',    'pl',    'pt',    'pt-PT', 'ro',    'ru',     'sh',    'si',
  'sk',    'sl',    'sq',    'sr',    'sv',    'sw',    'ta',    'te',     'th',    'tl',
  'tr',    'uk',    'ur',    'uz',    'vi',    'zh',    'zh-CN', 'zh-HK',  'zh-TW', 'zu'
];

export function generateClosureLocaleFile(
    cldrData: CldrData, baseCurrencies: BaseCurrencies): string {
  // locale id aliases to support deprecated locale ids used by closure
  // it maps deprecated ids --> new ids
  // manually extracted from ./cldr-data/supplemental/aliases.json
  // TODO: Consider extracting directly from the CLDR data instead.
  const aliases = {
    'in': 'id',
    'iw': 'he',
    'mo': 'ro-MD',
    'no': 'nb',
    'nb': 'no-NO',
    'sh': 'sr-Latn',
    'tl': 'fil',
    'pt': 'pt-BR',
    'zh-CN': 'zh-Hans-CN',
    'zh-Hans-CN': 'zh-Hans',
    'zh-HK': 'zh-Hant-HK',
    'zh-TW': 'zh-Hant-TW',
    'zh-Hant-TW': 'zh-Hant',
  };

  return generateAllLocalesFile(cldrData, GOOG_LOCALES, aliases, baseCurrencies);
}

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
function generateAllLocalesFile(
    cldrData: CldrData, locales: string[], aliases: {[name: string]: string},
    baseCurrencies: BaseCurrencies) {
  const existingLocalesAliases: {[locale: string]: Set<string>} = {};
  const existingLocalesData: {[locale: string]: string} = {};

  // for each locale, get the data and the list of equivalent locales
  locales.forEach(locale => {
    const eqLocales = new Set<string>();
    eqLocales.add(locale);
    if (locale.match(/-/)) {
      eqLocales.add(locale.replace(/-/g, '_'));
    }

    // check for aliases
    const alias = aliases[locale];
    if (alias) {
      eqLocales.add(alias);

      if (alias.match(/-/)) {
        eqLocales.add(alias.replace(/-/g, '_'));
      }

      // to avoid duplicated "case" we regroup all locales in the same "case"
      // the simplest way to do that is to have alias aliases
      // e.g. 'no' --> 'nb', 'nb' --> 'no-NO'
      // which means that we'll have 'no', 'nb' and 'no-NO' in the same "case"
      const aliasKeys = Object.keys(aliases);
      for (let i = 0; i < aliasKeys.length; i++) {
        const aliasValue = aliases[alias];
        if (aliasKeys.indexOf(alias) !== -1 && !eqLocales.has(aliasValue)) {
          eqLocales.add(aliasValue);

          if (aliasValue.match(/-/)) {
            eqLocales.add(aliasValue.replace(/-/g, '_'));
          }
        }
      }
    }

    const localeNameForData = aliases[locale] ?? locale;
    const localeData = cldrData.getLocaleData(localeNameForData);
    const localeName = formatLocale(locale);
    existingLocalesData[locale] =
        generateLocale(localeNameForData, localeData, baseCurrencies)
            .replace(`${fileHeader}\n`, '')
            .replace('export default ', `export const locale_${localeName} = `)
            .replace('function plural', `function plural_${localeName}`)
            .replace(/,\s+plural/, `, plural_${localeName}`)
            .replace(/\s*const u = undefined;\s*/, '');

    existingLocalesAliases[locale] = eqLocales;
  });

  function generateCases(locale: string) {
    let str = '';
    let locales: string[] = [];
    const eqLocales = existingLocalesAliases[locale];
    eqLocales.forEach(l => {
      str += `case '${l}':\n`;
      locales.push(`'${l}'`);
    });
    let localesStr = '[' + locales.join(',') + ']';

    str += `  l = locale_${formatLocale(locale)};
    locales = ${localesStr};
    break;\n`;
    return str;
  }

  return `${fileHeader}

import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;

${locales.map(locale => `${existingLocalesData[locale]}`).join('\n')}

let l: any;
let locales: string[] = [];

switch (goog.LOCALE) {
${locales.map(locale => generateCases(locale)).join('')}}

if(l) {
  locales.forEach(locale => registerLocaleData(l, locale));
}
`;
}

function formatLocale(locale: string): string {
  return locale.replace(/-/g, '_');
}
