/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const yargs = require('yargs').argv;
const shelljs = require('shelljs');
const {I18N_DATA_FOLDER, RELATIVE_I18N_DATA_FOLDER, HEADER} = require('./extract');
const OUTPUT_NAME = `closure-locale.ts`;

// tslint:disable:no-console
module.exports = (gulp, done) => {
  // the locales used by closure that will be used to generate the closure-locale file
  // extracted from:
  // https://github.com/google/closure-library/blob/master/closure/goog/i18n/datetimepatterns.js#L2136
  let GOOG_LOCALES = [
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

  // locale id aliases to support deprecated locale ids used by closure
  // it maps deprecated ids --> new ids
  // manually extracted from ./cldr-data/supplemental/aliases.json
  const ALIASES = {
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

  if (yargs.locales) {
    GOOG_LOCALES = yargs.locales.split(',');
  }

  console.log(`Writing file ${I18N_DATA_FOLDER}/${OUTPUT_NAME}`);
  fs.writeFileSync(
      `${RELATIVE_I18N_DATA_FOLDER}/${OUTPUT_NAME}`, generateAllLocalesFile(GOOG_LOCALES, ALIASES));

  console.log(`Formatting ${I18N_DATA_FOLDER}/${OUTPUT_NAME}..."`);
  shelljs.exec(`yarn clang-format -i ${I18N_DATA_FOLDER}/${OUTPUT_NAME}`, {silent: true});
  done();
};

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
function generateAllLocalesFile(LOCALES, ALIASES) {
  const existingLocalesAliases = {};
  const existingLocalesData = {};

  // for each locale, get the data and the list of equivalent locales
  LOCALES.forEach(locale => {
    const eqLocales = new Set();
    eqLocales.add(locale);
    if (locale.match(/-/)) {
      eqLocales.add(locale.replace(/-/g, '_'));
    }

    // check for aliases
    const alias = ALIASES[locale];
    if (alias) {
      eqLocales.add(alias);

      if (alias.match(/-/)) {
        eqLocales.add(alias.replace(/-/g, '_'));
      }

      // to avoid duplicated "case" we regroup all locales in the same "case"
      // the simplest way to do that is to have alias aliases
      // e.g. 'no' --> 'nb', 'nb' --> 'no-NO'
      // which means that we'll have 'no', 'nb' and 'no-NO' in the same "case"
      const aliasKeys = Object.keys(ALIASES);
      for (let i = 0; i < aliasKeys.length; i++) {
        const aliasValue = ALIASES[alias];
        if (aliasKeys.indexOf(alias) !== -1 && !eqLocales.has(aliasValue)) {
          eqLocales.add(aliasValue);

          if (aliasValue.match(/-/)) {
            eqLocales.add(aliasValue.replace(/-/g, '_'));
          }
        }
      }
    }

    for (let l of eqLocales) {
      // find the existing content file
      const path = `${RELATIVE_I18N_DATA_FOLDER}/${l}.ts`;
      if (fs.existsSync(`${RELATIVE_I18N_DATA_FOLDER}/${l}.ts`)) {
        const localeName = formatLocale(locale);
        existingLocalesData[locale] =
            fs.readFileSync(path, 'utf8')
                .replace(`${HEADER}\n`, '')
                .replace('export default ', `export const locale_${localeName} = `)
                .replace('function plural', `function plural_${localeName}`)
                .replace(/,(\n  | )plural/, `, plural_${localeName}`)
                .replace('const u = undefined;\n\n', '');
      }
    }

    existingLocalesAliases[locale] = eqLocales;
  });

  function generateCases(locale) {
    let str = '';
    let locales = [];
    const eqLocales = existingLocalesAliases[locale];
    for (let l of eqLocales) {
      str += `case '${l}':\n`;
      locales.push(`'${l}'`);
    }
    let localesStr = '[' + locales.join(',') + ']';

    str += `  l = locale_${formatLocale(locale)};
    locales = ${localesStr};
    break;\n`;
    return str;
  }

  function formatLocale(locale) {
    return locale.replace(/-/g, '_');
  }
  // clang-format off
  return `${HEADER}
import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;

${LOCALES.map(locale => `${existingLocalesData[locale]}`).join('\n')}

let l: any;
let locales: string[] = [];

switch (goog.LOCALE) {
${LOCALES.map(locale => generateCases(locale)).join('')}}

if(l) {
  locales.forEach(locale => registerLocaleData(l, locale));
}
`;
  // clang-format on
}
