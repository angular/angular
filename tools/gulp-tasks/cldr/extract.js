/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
// used to extract plural rules
const cldr = require('cldr');
// used to extract all other cldr data
const cldrJs = require('cldrjs');
const cldrData = require('./cldr-data');

const DEFAULT_RULE = `function anonymous(n\n/**/) {\nreturn"other"\n}`;
const EMPTY_RULE = `function anonymous(n\n/**/) {\n\n}`;
const LOCALES = cldrData.availableLocales;
const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

module.exports = (gulp, done) => {
  const dataFolder = path.resolve(__dirname, `../../../packages/common/src/i18n/data/`);
  console.log(`Loading CLDR data...`);
  cldrJs.load(cldrData.all());
  console.log(`Writing locale files`);
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }
  LOCALES.forEach((locale, index) => {
    console.log(`${index+1}/${LOCALES.length} - packages/common/src/i18n/data/locale_${locale}.ts`);
    fs.writeFileSync(
        path.resolve(__dirname, `../../../packages/common/src/i18n/data/locale_${locale}.ts`),
        generateLocale(locale), {encoding: 'utf8'});
  });
  console.log(`${LOCALES.length} locale files generated.`);

  console.log(`Writing file packages/common/src/i18n/available_locales.ts`);
  fs.writeFileSync(
      path.resolve(__dirname, `../../../packages/common/src/i18n/available_locales.ts`),
      generateAvailableLocales(), {encoding: 'utf8'});

  console.log(`Writing file packages/common/src/i18n/currencies.ts`);
  fs.writeFileSync(
      path.resolve(__dirname, `../../../packages/common/src/i18n/currencies.ts`),
      generateCurrencies(), {encoding: 'utf8'});

  console.log(`Writing file packages/common/src/i18n/index.ts`);
  fs.writeFileSync(
      path.resolve(__dirname, `../../../packages/common/src/i18n/index.ts`), generateIndex(),
      {encoding: 'utf8'});

  console.log(`All i18n cldr files have been generated, formatting files..."`);
  const format = require('gulp-clang-format');
  const clangFormat = require('clang-format');
  return gulp
      .src(
          [
            'packages/common/src/i18n/data/*.{js,ts}',
            'packages/common/src/i18n/available_locales.ts',
            'packages/common/src/i18n/currencies.ts',
            'packages/common/src/i18n/index.ts'
          ],
          {base: '.'})
      .pipe(format.format('file', clangFormat))
      .pipe(gulp.dest('.'));
};

function generateLocale(locale) {
  const localeData = new cldrJs(locale);

  return `/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This is generated code DO NOT MODIFY 
// see angular/tools/gulp-tasks/cldr/extract.js 

import {NgLocale, Plural} from '@angular/core';

/** @experimental */
${getPluralFunction(locale)}

/** @experimental */
export const NgLocale${toPascalCase(locale)}: NgLocale = {
  localeId: '${locale}',
  dateTimeTranslations: ${getDateTimeTranslations(localeData)},
  dateTimeSettings: ${getDateTimeSettings(localeData)},
  numberSettings: ${getNumberSettings(localeData)},
  currencySettings: ${getCurrencySettings(locale, localeData)},
  getPluralCase: getPluralCase
};
`;
}

function toPascalCase(str) {
  str = str.replace(/-+([a-z0-9A-Z])/g, (...m) => m[1].toUpperCase());
  return str.charAt(0).toUpperCase() + str.substr(1);
}

function getDateTimeTranslations(localeData) {
  const dayPeriods = localeData.main(`dates/calendars/gregorian/dayPeriods`);
  const dayNames = localeData.main(`dates/calendars/gregorian/days`);
  const monthNames = localeData.main(`dates/calendars/gregorian/months`);
  const eras = localeData.main(`dates/calendars/gregorian/eras`);

  const dayPeriodsList = [
    'am', 'pm', 'noon', 'midnight', 'morning1', 'morning2', 'afternoon1', 'afternoon2', 'evening1',
    'evening2', 'night1', 'night2'
  ];
  Object.keys(dayPeriods).forEach(key1 => {          // format / stand-alone
    Object.keys(dayPeriods[key1]).forEach(key2 => {  // narrow / abbreviated / wide
      Object.keys(dayPeriods[key1][key2]).forEach(key3 => {
        if (dayPeriodsList.indexOf(key3) === -1) {
          delete dayPeriods[key1][key2][key3];
        }
      });
    });
  });

  const dateTimeTranslations = {
    dayPeriods: {format: dayPeriods.format, standalone: dayPeriods['stand-alone']},
    days: {
      format: {
        narrow: objectValues(dayNames.format.narrow),
        short: objectValues(dayNames.format.short),
        abbreviated: objectValues(dayNames.format.abbreviated),
        wide: objectValues(dayNames.format.wide)
      },
      standalone: {
        narrow: objectValues(dayNames['stand-alone'].narrow),
        short: objectValues(dayNames['stand-alone'].short),
        abbreviated: objectValues(dayNames['stand-alone'].abbreviated),
        wide: objectValues(dayNames['stand-alone'].wide)
      }
    },
    months: {
      format: {
        narrow: objectValues(monthNames.format.narrow),
        abbreviated: objectValues(monthNames.format.abbreviated),
        wide: objectValues(monthNames.format.wide)
      },
      standalone: {
        narrow: objectValues(monthNames['stand-alone'].narrow),
        abbreviated: objectValues(monthNames['stand-alone'].abbreviated),
        wide: objectValues(monthNames['stand-alone'].wide)
      }
    },
    eras: {
      abbreviated: [eras.eraAbbr['0'], eras.eraAbbr['1']],
      narrow: [eras.eraNarrow['0'], eras.eraNarrow['1']],
      wide: [eras.eraNames['0'], eras.eraNames['1']]
    }
  };

  return stringify(dateTimeTranslations);
}

function getDateTimeFormats(localeData) {
  function getFormats(data) {
    return {
      full: data.full._value || data.full, long: data.long._value || data.long,
          medium: data.medium._value || data.medium, short: data.short._value || data.short
    }
  }

  const dateFormats = localeData.main('dates/calendars/gregorian/dateFormats');
  const timeFormats = localeData.main('dates/calendars/gregorian/timeFormats');
  const dateTimeFormats = localeData.main('dates/calendars/gregorian/dateTimeFormats');

  return {
    date: getFormats(dateFormats),
    time: getFormats(timeFormats),
    dateTime: getFormats(dateTimeFormats)
  };
}

function getDayPeriodRules(localeData) {
  const dayPeriodRules =
      localeData.get(`supplemental/dayPeriodRuleSet/${localeData.attributes.language}`);
  let rules;
  if (dayPeriodRules) {
    rules = {};
    Object.keys(dayPeriodRules).forEach(key => {
      if (dayPeriodRules[key]._at) {
        rules[key] = dayPeriodRules[key]._at;
      } else {
        rules[key] = { from: dayPeriodRules[key]._from, to: dayPeriodRules[key]._before }
      }
    })
  }

  return rules;
}

function getFirstDayOfWeek(localeData) {
  return WEEK_DAYS.indexOf(localeData.supplemental.weekData.firstDay());
}

function getWeekendRange(localeData) {
  const startDay =
      localeData.get(`supplemental/weekData/weekendStart/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendStart/001');
  const endDay =
      localeData.get(`supplemental/weekData/weekendEnd/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendEnd/001');
  return [WEEK_DAYS.indexOf(startDay), WEEK_DAYS.indexOf(endDay)];
}

function getDateTimeSettings(localeData) {
  const settings = {
    firstDayOfWeek: getFirstDayOfWeek(localeData),
    weekendRange: getWeekendRange(localeData),
    formats: getDateTimeFormats(localeData)
  };

  const dayPeriodRules = getDayPeriodRules(localeData);
  if (dayPeriodRules) {
    settings.dayPeriodRules = dayPeriodRules;
  }

  return stringify(settings);
}

function getNumberSettings(localeData) {
  const decimalFormat = localeData.main('numbers/decimalFormats-numberSystem-latn/standard');
  const percentFormat = localeData.main('numbers/percentFormats-numberSystem-latn/standard');
  const scientificFormat = localeData.main('numbers/scientificFormats-numberSystem-latn/standard');
  const currencyFormat = localeData.main('numbers/currencyFormats-numberSystem-latn/standard');
  const symbols = localeData.main('numbers/symbols-numberSystem-latn');
  const symbolValues = {
    decimal: symbols.decimal,
    group: symbols.group,
    list: symbols.list,
    percentSign: symbols.percentSign,
    plusSign: symbols.plusSign,
    minusSign: symbols.minusSign,
    exponential: symbols.exponential,
    superscriptingExponent: symbols.superscriptingExponent,
    perMille: symbols.perMille,
    infinity: symbols.infinity,
    nan: symbols.nan,
    timeSeparator: symbols.timeSeparator,
  };

  if (symbols.currencyGroup) {
    symbolValues.currencyGroup = symbols.currencyGroup;
  }

  return stringify({
    symbols: symbolValues,
    formats: {
      currency: currencyFormat,
      decimal: decimalFormat,
      percent: percentFormat,
      scientific: scientificFormat
    }
  });
}

function getCurrencySettings(locale, localeData) {
  const currencyInfo = localeData.main(`numbers/currencies`);
  let currentCurrency = '';

  // find the currency currently used in this country
  const currencies =
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
      })
    });

    if (!currentCurrency) {
      throw new Error(`Unable to find currency for locale "${locale}"`);
    }
  }

  const currencySettings = {};

  if (currentCurrency) {
    currencySettings.symbol = currencyInfo[currentCurrency].symbol;
    currencySettings.name = currencyInfo[currentCurrency].displayName;
  }

  return stringify(currencySettings);
}

function toRegExp(s) {
  return new RegExp(s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1'), 'g');
}

function normalizePluralRule(fn) {
  if (fn === EMPTY_RULE) {
    fn = DEFAULT_RULE;
  }

  return fn
      .replace(
          toRegExp('function anonymous(n\n/**/) {\n'),
          'export function getPluralCase(n: number): Plural {\n  ')
      .replace(toRegExp('var'), 'let')
      .replace(toRegExp('if(typeof n==="string")n=parseInt(n,10);'), '')
      .replace(toRegExp('"zero"'), ' Plural.Zero')
      .replace(toRegExp('"one"'), ' Plural.One')
      .replace(toRegExp('"two"'), ' Plural.Two')
      .replace(toRegExp('"few"'), ' Plural.Few')
      .replace(toRegExp('"many"'), ' Plural.Many')
      .replace(toRegExp('"other"'), ' Plural.Other')
      .replace(toRegExp('\n}'), ';\n}');
}

// todo(ocombe): replace "cldr" extractPluralRuleFunction with our own extraction using "CldrJS"
// because the 2 libs can become out of sync if they use different versions of the cldr database
function getPluralFunction(locale) {
  return normalizePluralRule(cldr.extractPluralRuleFunction(locale).toString());
}

function generateAvailableLocales() {
  return `/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This is generated code DO NOT MODIFY 
// see angular/tools/gulp-tasks/cldr/extract.js 

/** @experimental */
export const AVAILABLE_LOCALES = ${JSON.stringify(LOCALES)};
`;
}

function generateCurrencies() {
  const currencies = new cldrJs('en').main('numbers/currencies');
  const currencyStr = Object.keys(currencies).reduce((sum, key) => {
    let symbols = {symbol: currencies[key].symbol || key};
    if(currencies[key]['symbol-alt-narrow'] &&
      currencies[key]['symbol-alt-narrow'] !== currencies[key].symbol) {
      symbols.symbolNarrow = currencies[key]['symbol-alt-narrow'];
    }
    return sum + `  '${key}': ${stringify(symbols)},\n`;
  }, '');

  return `/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
 
// This is generated code DO NOT MODIFY 
// see angular/tools/gulp-tasks/cldr/extract.js 

/** @experimental */
export const CURRENCIES: {[code: string]: {[key: string]: string}} = {
${currencyStr}};
`;
}

function generateIndex() {
  return `/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This is generated code DO NOT MODIFY 
// see angular/tools/gulp-tasks/cldr/extract.js 

${LOCALES.map(locale => 
    `export {NgLocale${ toPascalCase(locale) }} from './data/locale_${locale}';`).join('\n')}
`;
}

function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

// Like JSON.stringify, but without double quotes around keys, and already formatted for readability
function stringify(obj) {
  return util.inspect(obj, {depth: null, maxArrayLength: null})
}
