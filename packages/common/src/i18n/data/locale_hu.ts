/**
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
export function getPluralCase(n: number): Plural {
  if (n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleHu: NgLocale = {
  localeId: 'hu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'reggel',
          afternoon1: 'délután',
          evening1: 'este',
          night1: 'éjszaka',
          night2: 'éjszaka'
        },
        narrow: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'reggel',
          afternoon1: 'délután',
          evening1: 'délután',
          night1: 'éjszaka',
          night2: 'éjszaka'
        },
        wide: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'reggel',
          afternoon1: 'délután',
          evening1: 'este',
          night1: 'éjszaka',
          night2: 'éjszaka'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'délelőtt',
          afternoon1: 'délután',
          evening1: 'este',
          night1: 'éjjel',
          night2: 'hajnal'
        },
        narrow: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'délelőtt',
          afternoon1: 'délután',
          evening1: 'este',
          night1: 'éjjel',
          night2: 'hajnal'
        },
        wide: {
          midnight: 'éjfél',
          am: 'de.',
          noon: 'dél',
          pm: 'du.',
          morning1: 'reggel',
          morning2: 'délelőtt',
          afternoon1: 'délután',
          evening1: 'este',
          night1: 'éjjel',
          night2: 'hajnal'
        }
      }
    },
    days: {
      format: {
        narrow: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
        short: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        abbreviated: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        wide: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']
      },
      standalone: {
        narrow: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
        short: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        abbreviated: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        wide: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'A', 'Sz', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.',
          'nov.', 'dec.'
        ],
        wide: [
          'január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus',
          'szeptember', 'október', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'A', 'Sz', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.',
          'nov.', 'dec.'
        ],
        wide: [
          'január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus',
          'szeptember', 'október', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['i. e.', 'i. sz.'],
      narrow: ['ie.', 'isz.'],
      wide: ['időszámításunk előtt', 'időszámításunk szerint']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date:
          {full: 'y. MMMM d., EEEE', long: 'y. MMMM d.', medium: 'y. MMM d.', short: 'y. MM. dd.'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '09:00'},
      morning2: {from: '09:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'},
      night2: {from: '04:00', to: '06:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Ft', name: 'magyar forint'},
  getPluralCase: getPluralCase
};
