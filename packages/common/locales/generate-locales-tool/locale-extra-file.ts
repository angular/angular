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

  // The JSON data for some locales may include `dayPeriods` for which no rule is defined in
  // `dayPeriodRules`. Ignore `dayPeriods` keys that lack a corresponding rule.
  //
  // As of CLDR v41, `hi-Latn` is the only locale that is affected by this issue and it is currently
  // not clear whether it is a bug on intended behavior. This is being tracked in
  // https://unicode-org.atlassian.net/browse/CLDR-15563.
  //
  // TODO(gkalpak): If this turns out to be a bug and is fixed in CLDR, restore the previous logic
  //                of expecting the exact same keys in `dayPeriods` and `dayPeriodRules`.
  const dayPeriodKeys =
      Object.keys(dayPeriods.format.narrow).filter(key => dayPeriodRules.hasOwnProperty(key));

  let dayPeriodsSupplemental: any[] = [];

  if (dayPeriodKeys.length) {
    if (dayPeriodKeys.length !== Object.keys(dayPeriodRules).length) {
      throw new Error(`Error: locale ${locale} has an incorrect number of day period rules`);
    }

    const dayPeriodsFormat = removeDuplicates([
      getValuesForKeys(dayPeriodKeys, dayPeriods.format.narrow),
      getValuesForKeys(dayPeriodKeys, dayPeriods.format.abbreviated),
      getValuesForKeys(dayPeriodKeys, dayPeriods.format.wide),
    ]);

    const dayPeriodsStandalone = removeDuplicates([
      getValuesForKeys(dayPeriodKeys, dayPeriods['stand-alone'].narrow),
      getValuesForKeys(dayPeriodKeys, dayPeriods['stand-alone'].abbreviated),
      getValuesForKeys(dayPeriodKeys, dayPeriods['stand-alone'].wide),
    ]);

    const rules = getValuesForKeys(dayPeriodKeys, dayPeriodRules);
    dayPeriodsSupplemental = [...removeDuplicates([dayPeriodsFormat, dayPeriodsStandalone]), rules];
  }

  return stringify(dayPeriodsSupplemental).replace(/undefined/g, 'u');
}

function getValuesForKeys<T>(keys: string[], obj: Record<string, T>): T[] {
  return keys.map(key => obj[key]);
}
