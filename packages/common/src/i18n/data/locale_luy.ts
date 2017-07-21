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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleLuy: NgLocale = {
  localeId: 'luy',
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
        short: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
        abbreviated: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
        wide: [
          'Jumapiri', 'Jumatatu', 'Jumanne', 'Jumatano', 'Murwa wa Kanne', 'Murwa wa Katano',
          'Jumamosi'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
        abbreviated: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
        wide: [
          'Jumapiri', 'Jumatatu', 'Jumanne', 'Jumatano', 'Murwa wa Kanne', 'Murwa wa Katano',
          'Jumamosi'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      }
    },
    eras: {
      abbreviated: ['BC', 'AD'],
      narrow: ['BC', 'AD'],
      wide: ['Imberi ya Kuuza Kwa', 'Muhiga Kuvita Kuuza']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
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
    formats: {
      currency: '¤#,##0.00;¤- #,##0.00',
      decimal: '#,##0.###',
      percent: '#,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: 'Ksh', name: 'Sirinji ya Kenya'},
  getPluralCase: getPluralCase
};
