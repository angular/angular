/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const path = require('path');
const yargs = require('yargs').argv;
const {I18N_FOLDER, I18N_DATA_FOLDER, RELATIVE_I18N_DATA_FOLDER, HEADER} = require('./extract');
const OUTPUT_NAME = `closure-locale.ts`;

module.exports = (gulp, done) => {
  let GOOG_LOCALES;
  if (yargs.locales) {
    GOOG_LOCALES = yargs.locales.split(',');
  } else {
    if (!fs.existsSync(path.join(__dirname, 'cldr-data'))) {
      throw new Error(`You must run "gulp cldr:download" before you can extract the data`);
    }
    const cldrData = require('./cldr-data');
    GOOG_LOCALES = cldrData.availableLocales;
  }

  console.log(`Writing file ${I18N_DATA_FOLDER}/${OUTPUT_NAME}`);
  fs.writeFileSync(
      `${RELATIVE_I18N_DATA_FOLDER}/${OUTPUT_NAME}`, generateAllLocalesFile(GOOG_LOCALES));

  console.log(`Formatting ${I18N_DATA_FOLDER}/${OUTPUT_NAME}..."`);
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp.src([`${I18N_DATA_FOLDER}/${OUTPUT_NAME}`], {base: '.'})
      .pipe(format.format('file', clangFormat))
      .pipe(gulp.dest('.'));
};

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
function generateAllLocalesFile(LOCALES) {
  function generateCases(locale) {
    let str = '';
    if (locale.match(/-/)) {
      str = `case '${locale.replace('-', '_')}':\n`
    }
    // clang-format off
    str += `case '${locale}':
  l = ${toCamelCase(locale)};
  break;
`;
    // clang-format on
    return str;
  }
  // clang-format off
  return `${HEADER}
import {registerLocaleData} from '../src/i18n/locale_data';
${LOCALES.map(locale => `import ${toCamelCase(locale)} from './${locale}';\n`).join('')}

let l: any;

switch (goog.LOCALE) {
${LOCALES.map(locale => generateCases(locale)).join('')}
  default:
    l = en;
}

registerLocaleData(l);
`;
  // clang-format on
}

/**
 * Transform a string to camelCase
 */
function toCamelCase(str) {
  return str.replace(/-+([a-z0-9A-Z])/g, (...m) => m[1].toUpperCase());
}

module.exports.I18N_FOLDER = I18N_FOLDER;
module.exports.I18N_DATA_FOLDER = I18N_DATA_FOLDER;
