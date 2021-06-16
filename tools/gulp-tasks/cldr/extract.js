/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const path = require('path');
const stringify = require('./util').stringify;
// used to extract plural rules
const cldr = require('cldr');
// used to extract all other cldr data
const cldrJs = require('cldrjs');
// used to call to clang-format
const shelljs = require('shelljs');

const COMMON_PACKAGE = 'packages/common';
const CORE_PACKAGE = 'packages/core';
const I18N_FOLDER = `${COMMON_PACKAGE}/src/i18n`;
const I18N_CORE_FOLDER = `${CORE_PACKAGE}/src/i18n`;
const I18N_DATA_FOLDER = `${COMMON_PACKAGE}/locales`;
const I18N_DATA_EXTRA_FOLDER = `${I18N_DATA_FOLDER}/extra`;
const I18N_GLOBAL_FOLDER = `${I18N_DATA_FOLDER}/global`;
const RELATIVE_I18N_FOLDER = path.resolve(__dirname, `../../../${I18N_FOLDER}`);
const RELATIVE_I18N_CORE_FOLDER = path.resolve(__dirname, `../../../${I18N_CORE_FOLDER}`);
const RELATIVE_I18N_DATA_FOLDER = path.resolve(__dirname, `../../../${I18N_DATA_FOLDER}`);
const RELATIVE_I18N_DATA_EXTRA_FOLDER =
    path.resolve(__dirname, `../../../${I18N_DATA_EXTRA_FOLDER}`);
const RELATIVE_I18N_GLOBAL_FOLDER = path.resolve(__dirname, `../../../${I18N_GLOBAL_FOLDER}`);
const DEFAULT_RULE = 'function anonymous(n) {\nreturn"other"\n}';
const EMPTY_RULE = 'function anonymous(n) {\n\n}';
const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const HEADER = `/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js
`;

// tslint:disable:no-console
module.exports = (gulp, done) => {
  const cldrData = require('./cldr-data');
  const LOCALES = cldrData.availableLocales;

  console.log(`Loading CLDR data...`);
  cldrJs.load(cldrData.all().concat(cldrData('scriptMetadata')));

  console.log(`Writing locale files`);
  if (!fs.existsSync(RELATIVE_I18N_FOLDER)) {
    fs.mkdirSync(RELATIVE_I18N_FOLDER);
  }
  if (!fs.existsSync(RELATIVE_I18N_DATA_FOLDER)) {
    fs.mkdirSync(RELATIVE_I18N_DATA_FOLDER);
  }
  if (!fs.existsSync(RELATIVE_I18N_DATA_EXTRA_FOLDER)) {
    fs.mkdirSync(RELATIVE_I18N_DATA_EXTRA_FOLDER);
  }
  if (!fs.existsSync(RELATIVE_I18N_GLOBAL_FOLDER)) {
    fs.mkdirSync(RELATIVE_I18N_GLOBAL_FOLDER);
  }

  console.log(`Writing file ${I18N_FOLDER}/currencies.ts`);
  fs.writeFileSync(`${RELATIVE_I18N_FOLDER}/currencies.ts`, generateCurrenciesFile());

  const baseCurrencies = generateBaseCurrencies(new cldrJs('en'));
  // additional "en" file that will be included in common
  console.log(`Writing file ${I18N_CORE_FOLDER}/locale_en.ts`);
  const localeEnFile = generateLocale('en', new cldrJs('en'), baseCurrencies);
  fs.writeFileSync(`${RELATIVE_I18N_CORE_FOLDER}/locale_en.ts`, localeEnFile);

  LOCALES.forEach((locale, index) => {
    const localeData = new cldrJs(locale);

    console.log(`${index + 1}/${LOCALES.length}`);
    console.log(`\t${I18N_DATA_FOLDER}/${locale}.ts`);
    fs.writeFileSync(
        `${RELATIVE_I18N_DATA_FOLDER}/${locale}.ts`,
        locale === 'en' ? localeEnFile : generateLocale(locale, localeData, baseCurrencies));
    console.log(`\t${I18N_DATA_EXTRA_FOLDER}/${locale}.ts`);
    fs.writeFileSync(
        `${RELATIVE_I18N_DATA_EXTRA_FOLDER}/${locale}.ts`, generateLocaleExtra(locale, localeData));
    console.log(`\t${I18N_GLOBAL_FOLDER}/${locale}.js`);
    fs.writeFileSync(
        `${RELATIVE_I18N_GLOBAL_FOLDER}/${locale}.js`,
        generateGlobalLocale(
            locale, locale === 'en' ? new cldrJs('en') : localeData, baseCurrencies));
  });
  console.log(`${LOCALES.length} locale files generated.`);

  console.log(`All i18n cldr files have been generated, formatting files..."`);
  shelljs.exec(
      `yarn clang-format -i ${I18N_DATA_FOLDER}/**/*.ts ${I18N_DATA_FOLDER}/*.ts ${
          I18N_FOLDER}/currencies.ts ${I18N_CORE_FOLDER}/locale_en.ts ${I18N_GLOBAL_FOLDER}/*.js`,
      {silent: true});
  done();
};

/**
 * Generate contents for the basic locale data file
 */
function generateLocale(locale, localeData, baseCurrencies) {
  return `${HEADER}
const u = undefined;

${getPluralFunction(locale)}

export default ${generateBasicLocaleString(locale, localeData, baseCurrencies)};
`;
}

/**
 * Generate the contents for the extra data file
 */
function generateLocaleExtra(locale, localeData) {
  return `${HEADER}
const u = undefined;

export default ${generateDayPeriodsSupplementalString(locale, localeData)};
`;
}

/**
 * Generated the contents for the global locale file
 */
function generateGlobalLocale(locale, localeData, baseCurrencies) {
  const basicLocaleData = generateBasicLocaleString(locale, localeData, baseCurrencies);
  const extraLocaleData = generateDayPeriodsSupplementalString(locale, localeData);
  const data = basicLocaleData.replace(/\]$/, `, ${extraLocaleData}]`);
  return `${HEADER}
(function(global) {
  global.ng = global.ng || {};
  global.ng.common = global.ng.common || {};
  global.ng.common.locales = global.ng.common.locales || {};
  const u = undefined;
  ${getPluralFunction(locale, false)}
  global.ng.common.locales['${normalizeLocale(locale)}'] = ${data};
})(typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global || typeof window !== 'undefined' && window);
  `;
}

/**
 * Collect up the basic locale data [ localeId, dateTime, number, currency, pluralCase ].
 */
function generateBasicLocaleString(locale, localeData, baseCurrencies) {
  let data = stringify(
                 [
                   locale,
                   ...getDateTimeTranslations(localeData),
                   ...getDateTimeSettings(localeData),
                   ...getNumberSettings(localeData),
                   ...getCurrencySettings(locale, localeData),
                   generateLocaleCurrencies(localeData, baseCurrencies),
                   getDirectionality(localeData),
                 ],
                 true)
                 // We remove "undefined" added by spreading arrays when there is no value
                 .replace(/undefined/g, 'u');

  // adding plural function after, because we don't want it as a string
  data = data.replace(/\]$/, ', plural]');
  return data;
}

/**
 * Collect up the day period rules, and extended day period data.
 */
function generateDayPeriodsSupplementalString(locale, localeData) {
  const dayPeriods = getDayPeriodsNoAmPm(localeData);
  const dayPeriodRules = getDayPeriodRules(localeData);

  let dayPeriodsSupplemental = [];
  if (Object.keys(dayPeriods.format.narrow).length) {
    const keys = Object.keys(dayPeriods.format.narrow);

    if (keys.length !== Object.keys(dayPeriodRules).length) {
      throw new Error(`Error: locale ${locale} has not the correct number of day period rules`);
    }

    const dayPeriodsFormat = removeDuplicates([
      objectValues(dayPeriods.format.narrow), objectValues(dayPeriods.format.abbreviated),
      objectValues(dayPeriods.format.wide)
    ]);

    const dayPeriodsStandalone = removeDuplicates([
      objectValues(dayPeriods['stand-alone'].narrow),
      objectValues(dayPeriods['stand-alone'].abbreviated),
      objectValues(dayPeriods['stand-alone'].wide)
    ]);

    const rules = keys.map(key => dayPeriodRules[key]);
    dayPeriodsSupplemental = [...removeDuplicates([dayPeriodsFormat, dayPeriodsStandalone]), rules];
  }
  return stringify(dayPeriodsSupplemental).replace(/undefined/g, 'u');
}

/**
 * Generate a list of currencies to be used as a based for other currencies
 * e.g.: {'ARS': [, '$'], 'AUD': ['A$', '$'], ...}
 */
function generateBaseCurrencies(localeData, addDigits) {
  const currenciesData = localeData.main('numbers/currencies');
  const fractions = new cldrJs('en').get(`supplemental/currencyData/fractions`);
  const currencies = {};
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
    if (addDigits && fractions[key] && fractions[key]['_digits']) {
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
      currencies[key] = symbolsArray;
    }
  });
  return currencies;
}

/**
 * To minimize the file even more, we only output the differences compared to the base currency
 */
function generateLocaleCurrencies(localeData, baseCurrencies) {
  const currenciesData = localeData.main('numbers/currencies');
  const currencies = {};
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

    // if locale data are different, set the value
    if ((baseCurrencies[code] || []).toString() !== symbolsArray.toString()) {
      currencies[code] = symbolsArray;
    }
  });
  return currencies;
}

/**
 * Generate a file that contains the list of currencies and their symbols
 */
function generateCurrenciesFile() {
  const baseCurrencies = generateBaseCurrencies(new cldrJs('en'), true);

  return `${HEADER}
export type CurrenciesSymbols = [string] | [string | undefined, string];

/** @internal */
export const CURRENCIES_EN: {[code: string]: CurrenciesSymbols | [string | undefined, string | undefined, number]} = ${
      stringify(baseCurrencies, true)};
`;
}

/**
 * Returns data for the chosen day periods
 * @returns {
 *   format: {narrow / abbreviated / wide: [...]},
 *   stand-alone: {narrow / abbreviated / wide: [...]}
 * }
 */
function getDayPeriods(localeData, dayPeriodsList) {
  const dayPeriods = localeData.main(`dates/calendars/gregorian/dayPeriods`);
  const result = {};
  // cleaning up unused keys
  Object.keys(dayPeriods).forEach(key1 => {  // format / stand-alone
    result[key1] = {};
    Object.keys(dayPeriods[key1]).forEach(key2 => {  // narrow / abbreviated / wide
      result[key1][key2] = {};
      Object.keys(dayPeriods[key1][key2]).forEach(key3 => {
        if (dayPeriodsList.indexOf(key3) !== -1) {
          result[key1][key2][key3] = dayPeriods[key1][key2][key3];
        }
      });
    });
  });

  return result;
}

/**
 * Returns the basic day periods (am/pm)
 */
function getDayPeriodsAmPm(localeData) {
  return getDayPeriods(localeData, ['am', 'pm']);
}

/**
 * Returns the extra day periods (without am/pm)
 */
function getDayPeriodsNoAmPm(localeData) {
  return getDayPeriods(localeData, [
    'noon', 'midnight', 'morning1', 'morning2', 'afternoon1', 'afternoon2', 'evening1', 'evening2',
    'night1', 'night2'
  ]);
}

/**
 * Returns date-related translations for a locale
 * @returns [ dayPeriodsFormat, dayPeriodsStandalone, daysFormat, dayStandalone, monthsFormat,
 * monthsStandalone, eras ]
 * each value: [ narrow, abbreviated, wide, short? ]
 */
function getDateTimeTranslations(localeData) {
  const dayNames = localeData.main(`dates/calendars/gregorian/days`);
  const monthNames = localeData.main(`dates/calendars/gregorian/months`);
  const erasNames = localeData.main(`dates/calendars/gregorian/eras`);
  const dayPeriods = getDayPeriodsAmPm(localeData);

  const dayPeriodsFormat = removeDuplicates([
    objectValues(dayPeriods.format.narrow), objectValues(dayPeriods.format.abbreviated),
    objectValues(dayPeriods.format.wide)
  ]);

  const dayPeriodsStandalone = removeDuplicates([
    objectValues(dayPeriods['stand-alone'].narrow),
    objectValues(dayPeriods['stand-alone'].abbreviated),
    objectValues(dayPeriods['stand-alone'].wide)
  ]);

  const daysFormat = removeDuplicates([
    objectValues(dayNames.format.narrow), objectValues(dayNames.format.abbreviated),
    objectValues(dayNames.format.wide), objectValues(dayNames.format.short)
  ]);

  const daysStandalone = removeDuplicates([
    objectValues(dayNames['stand-alone'].narrow), objectValues(dayNames['stand-alone'].abbreviated),
    objectValues(dayNames['stand-alone'].wide), objectValues(dayNames['stand-alone'].short)
  ]);

  const monthsFormat = removeDuplicates([
    objectValues(monthNames.format.narrow), objectValues(monthNames.format.abbreviated),
    objectValues(monthNames.format.wide)
  ]);

  const monthsStandalone = removeDuplicates([
    objectValues(monthNames['stand-alone'].narrow),
    objectValues(monthNames['stand-alone'].abbreviated),
    objectValues(monthNames['stand-alone'].wide)
  ]);

  const eras = removeDuplicates([
    [erasNames.eraNarrow['0'], erasNames.eraNarrow['1']],
    [erasNames.eraAbbr['0'], erasNames.eraAbbr['1']],
    [erasNames.eraNames['0'], erasNames.eraNames['1']]
  ]);

  const dateTimeTranslations = [
    ...removeDuplicates([dayPeriodsFormat, dayPeriodsStandalone]),
    ...removeDuplicates([daysFormat, daysStandalone]),
    ...removeDuplicates([monthsFormat, monthsStandalone]), eras
  ];

  return dateTimeTranslations;
}

/**
 * Returns date, time and dateTime formats for a locale
 * @returns [dateFormats, timeFormats, dateTimeFormats]
 * each format: [ short, medium, long, full ]
 */
function getDateTimeFormats(localeData) {
  function getFormats(data) {
    return removeDuplicates([
      data.short._value || data.short, data.medium._value || data.medium,
      data.long._value || data.long, data.full._value || data.full
    ]);
  }

  const dateFormats = localeData.main('dates/calendars/gregorian/dateFormats');
  const timeFormats = localeData.main('dates/calendars/gregorian/timeFormats');
  const dateTimeFormats = localeData.main('dates/calendars/gregorian/dateTimeFormats');

  return [getFormats(dateFormats), getFormats(timeFormats), getFormats(dateTimeFormats)];
}

/**
 * Returns day period rules for a locale
 * @returns string[]
 */
function getDayPeriodRules(localeData) {
  const dayPeriodRules =
      localeData.get(`supplemental/dayPeriodRuleSet/${localeData.attributes.language}`);
  const rules = {};
  if (dayPeriodRules) {
    Object.keys(dayPeriodRules).forEach(key => {
      if (dayPeriodRules[key]._at) {
        rules[key] = dayPeriodRules[key]._at;
      } else {
        rules[key] = [dayPeriodRules[key]._from, dayPeriodRules[key]._before];
      }
    });
  }

  return rules;
}

/**
 * Returns the first day of the week, based on US week days
 * @returns number
 */
function getFirstDayOfWeek(localeData) {
  return WEEK_DAYS.indexOf(localeData.supplemental.weekData.firstDay());
}

/**
 * Returns week-end range for a locale, based on US week days
 * @returns [number, number]
 */
function getWeekendRange(localeData) {
  const startDay =
      localeData.get(`supplemental/weekData/weekendStart/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendStart/001');
  const endDay =
      localeData.get(`supplemental/weekData/weekendEnd/${localeData.attributes.territory}`) ||
      localeData.get('supplemental/weekData/weekendEnd/001');
  return [WEEK_DAYS.indexOf(startDay), WEEK_DAYS.indexOf(endDay)];
}

/**
 * Returns dateTime data for a locale
 * @returns [ firstDayOfWeek, weekendRange, formats ]
 */
function getDateTimeSettings(localeData) {
  return [
    getFirstDayOfWeek(localeData), getWeekendRange(localeData), ...getDateTimeFormats(localeData)
  ];
}

/**
 * Returns the number symbols and formats for a locale
 * @returns [ symbols, formats ]
 * symbols: [ decimal, group, list, percentSign, plusSign, minusSign, exponential,
 * superscriptingExponent, perMille, infinity, nan, timeSeparator, currencyDecimal?, currencyGroup?
 * ]
 * formats: [ currency, decimal, percent, scientific ]
 */
function getNumberSettings(localeData) {
  const decimalFormat = localeData.main('numbers/decimalFormats-numberSystem-latn/standard');
  const percentFormat = localeData.main('numbers/percentFormats-numberSystem-latn/standard');
  const scientificFormat = localeData.main('numbers/scientificFormats-numberSystem-latn/standard');
  const currencyFormat = localeData.main('numbers/currencyFormats-numberSystem-latn/standard');
  const symbols = localeData.main('numbers/symbols-numberSystem-latn');
  const symbolValues = [
    symbols.decimal,
    symbols.group,
    symbols.list,
    symbols.percentSign,
    symbols.plusSign,
    symbols.minusSign,
    symbols.exponential,
    symbols.superscriptingExponent,
    symbols.perMille,
    symbols.infinity,
    symbols.nan,
    symbols.timeSeparator,
  ];

  if (symbols.currencyDecimal || symbols.currencyGroup) {
    symbolValues.push(symbols.currencyDecimal);
  }

  if (symbols.currencyGroup) {
    symbolValues.push(symbols.currencyGroup);
  }

  return [symbolValues, [decimalFormat, percentFormat, currencyFormat, scientificFormat]];
}

/**
 * Returns the currency code, symbol and name for a locale
 * @returns [ code, symbol, name ]
 */
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
      });
    });

    if (!currentCurrency) {
      throw new Error(`Unable to find currency for locale "${locale}"`);
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

/**
 * Returns the writing direction for a locale
 * @returns 'rtl' | 'ltr'
 */
function getDirectionality(localeData) {
  const rtl = localeData.get('scriptMetadata/{script}/rtl');
  return rtl === 'YES' ? 'rtl' : 'ltr';
}

/**
 * Transforms a string into a regexp
 */
function toRegExp(s) {
  return new RegExp(s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1'), 'g');
}

/**
 * Returns the plural function for a locale
 * todo(ocombe): replace "cldr" extractPluralRuleFunction with our own extraction using "CldrJS"
 * because the 2 libs can become out of sync if they use different versions of the cldr database
 */
function getPluralFunction(locale, withTypes = true) {
  let fn = cldr.extractPluralRuleFunction(locale).toString();

  if (fn === EMPTY_RULE) {
    fn = DEFAULT_RULE;
  }

  const numberType = withTypes ? ': number' : '';
  fn = fn.replace(/function anonymous\(n[^}]+{/g, `function plural(n${numberType})${numberType} {`)
           .replace(toRegExp('var'), 'let')
           .replace(toRegExp('if(typeof n==="string")n=parseInt(n,10);'), '')
           .replace(toRegExp('\n}'), ';\n}');

  // The replacement values must match the `Plural` enum from common.
  // We do not use the enum directly to avoid depending on that package.
  return fn.replace(toRegExp('"zero"'), ' 0')
      .replace(toRegExp('"one"'), ' 1')
      .replace(toRegExp('"two"'), ' 2')
      .replace(toRegExp('"few"'), ' 3')
      .replace(toRegExp('"many"'), ' 4')
      .replace(toRegExp('"other"'), ' 5');
}

/**
 * Return an array of values from an object
 */
function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

/**
 * To create smaller locale files, we remove duplicated data.
 * To be make this work we need to store similar data in arrays, if some value in an array
 * is undefined, we can take the previous defined value instead, because it means that it has
 * been deduplicated.
 * e.g.: [x, y, undefined, z, undefined, undefined]
 * The first undefined is equivalent to y, the second and third are equivalent to z
 * Note that the first value in an array is always defined.
 *
 * Also since we need to know which data is assumed similar, it is important that we store those
 * similar data in arrays to mark the delimitation between values that have different meanings
 * (e.g. months and days).
 *
 * For further size improvements, "undefined" values will be replaced by a constant in the arrays
 * as the last step of the file generation (in generateLocale and generateLocaleExtra).
 * e.g.: [x, y, undefined, z, undefined, undefined] will be [x, y, u, z, u, u]
 */
function removeDuplicates(data) {
  const dedup = [data[0]];
  for (let i = 1; i < data.length; i++) {
    if (stringify(data[i]) !== stringify(data[i - 1])) {
      dedup.push(data[i]);
    } else {
      dedup.push(undefined);
    }
  }
  return dedup;
}

/**
 * In Angular the locale is referenced by a "normalized" form.
 */
function normalizeLocale(locale) {
  return locale.toLowerCase().replace(/_/g, '-');
}

module.exports.I18N_FOLDER = I18N_FOLDER;
module.exports.I18N_DATA_FOLDER = I18N_DATA_FOLDER;
module.exports.RELATIVE_I18N_DATA_FOLDER = RELATIVE_I18N_DATA_FOLDER;
module.exports.HEADER = HEADER;
