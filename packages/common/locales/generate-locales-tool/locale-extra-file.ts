/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {removeDuplicates} from './array-deduplication';
import {CldrLocaleData} from './cldr-data';
import {getDayPeriodRules, getDayPeriodsNoAmPm} from './day-periods';
import {fileHeader} from './file-header';
import {stringify} from './object-stringify';

/**
 * Generate the contents for the extra data file
 */
export function generateLocaleExtra(locale: string, localeData: CldrLocaleData) {
  return `${fileHeader}
const u = undefined;

export default ${generateDayPeriodsSupplementalString(locale, localeData)};
`;
}


/**
 * Collect up the day period rules, and extended day period data.
 */
export function generateDayPeriodsSupplementalString(locale: string, localeData: CldrLocaleData) {
  const dayPeriods = getDayPeriodsNoAmPm(localeData);
  const dayPeriodRules = getDayPeriodRules(localeData);

  let dayPeriodsSupplemental: any[] = [];
  if (Object.keys(dayPeriods.format.narrow).length) {
    const keys = Object.keys(dayPeriods.format.narrow);

    if (keys.length !== Object.keys(dayPeriodRules).length) {
      throw new Error(`Error: locale ${locale} has not the correct number of day period rules`);
    }

    const dayPeriodsFormat = removeDuplicates([
      Object.values(dayPeriods.format.narrow), Object.values(dayPeriods.format.abbreviated),
      Object.values(dayPeriods.format.wide)
    ]);

    const dayPeriodsStandalone = removeDuplicates([
      Object.values(dayPeriods['stand-alone'].narrow),
      Object.values(dayPeriods['stand-alone'].abbreviated),
      Object.values(dayPeriods['stand-alone'].wide)
    ]);

    const rules = keys.map(key => dayPeriodRules[key]);
    dayPeriodsSupplemental = [...removeDuplicates([dayPeriodsFormat, dayPeriodsStandalone]), rules];
  }
  return stringify(dayPeriodsSupplemental).replace(/undefined/g, 'u');
}
