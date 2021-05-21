/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrLocaleData} from './cldr-data';

/**
 * Returns data for the chosen day periods
 */
export function getDayPeriods(localeData: CldrLocaleData, dayPeriodsList: string[]): {
  format: {narrow: string[], abbreviated: string[], wide: string[]},
  'stand-alone': {narrow: string[], abbreviated: string[], wide: string[]}
} {
  const dayPeriods = localeData.main(`dates/calendars/gregorian/dayPeriods`);
  const result: any = {};
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

  return result as any;
}


/**
 * Returns day period rules for a locale
 * @returns string[]
 */
export function getDayPeriodRules(localeData: CldrLocaleData): {[key: string]: []} {
  const dayPeriodRules =
      localeData.get(`supplemental/dayPeriodRuleSet/${localeData.attributes.language}`);
  const rules: any = {};

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
 * Returns the basic day periods (am/pm)
 */
export function getDayPeriodsAmPm(localeData: CldrLocaleData) {
  return getDayPeriods(localeData, ['am', 'pm']);
}

/**
 * Returns the extra day periods (without am/pm)
 */
export function getDayPeriodsNoAmPm(localeData: CldrLocaleData) {
  return getDayPeriods(localeData, [
    'noon', 'midnight', 'morning1', 'morning2', 'afternoon1', 'afternoon2', 'evening1', 'evening2',
    'night1', 'night2'
  ]);
}
