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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (v === 0 && i % 10 === 1) return Plural.One;
  if (v === 0 && i % 10 === 2) return Plural.Two;
  if (v === 0 &&
      (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
    return Plural.Few;
  if (!(v === 0)) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleGv: NgLocale = {
  localeId: 'gv',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a.m.', pm: 'p.m.'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      },
      standalone: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a.m.', pm: 'p.m.'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
        abbreviated: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
        wide: ['Jedoonee', 'Jelhein', 'Jemayrt', 'Jercean', 'Jerdein', 'Jeheiney', 'Jesarn']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
        abbreviated: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
        wide: ['Jedoonee', 'Jelhein', 'Jemayrt', 'Jercean', 'Jerdein', 'Jeheiney', 'Jesarn']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'J-guer', 'T-arree', 'Mayrnt', 'Avrril', 'Boaldyn', 'M-souree', 'J-souree', 'Luanistyn',
          'M-fouyir', 'J-fouyir', 'M-Houney', 'M-Nollick'
        ],
        wide: [
          'Jerrey-geuree', 'Toshiaght-arree', 'Mayrnt', 'Averil', 'Boaldyn', 'Mean-souree',
          'Jerrey-souree', 'Luanistyn', 'Mean-fouyir', 'Jerrey-fouyir', 'Mee Houney',
          'Mee ny Nollick'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'J-guer', 'T-arree', 'Mayrnt', 'Avrril', 'Boaldyn', 'M-souree', 'J-souree', 'Luanistyn',
          'M-fouyir', 'J-fouyir', 'M-Houney', 'M-Nollick'
        ],
        wide: [
          'Jerrey-geuree', 'Toshiaght-arree', 'Mayrnt', 'Averil', 'Boaldyn', 'Mean-souree',
          'Jerrey-souree', 'Luanistyn', 'Mean-fouyir', 'Jerrey-fouyir', 'Mee Houney',
          'Mee ny Nollick'
        ]
      }
    },
    eras: {abbreviated: ['RC', 'AD'], narrow: ['RC', 'AD'], wide: ['RC', 'AD']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '£', name: 'GBP'},
  getPluralCase: getPluralCase
};
