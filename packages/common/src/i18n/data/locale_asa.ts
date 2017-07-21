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
export const NgLocaleAsa: NgLocale = {
  localeId: 'asa',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'icheheavo', pm: 'ichamthi'},
        narrow: {am: 'icheheavo', pm: 'ichamthi'},
        wide: {am: 'icheheavo', pm: 'ichamthi'}
      },
      standalone: {
        abbreviated: {am: 'icheheavo', pm: 'ichamthi'},
        narrow: {am: 'icheheavo', pm: 'ichamthi'},
        wide: {am: 'icheheavo', pm: 'ichamthi'}
      }
    },
    days: {
      format: {
        narrow: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
        abbreviated: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
        wide: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']
      },
      standalone: {
        narrow: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
        abbreviated: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
        wide: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Dec'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Dec'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba',
          'Oktoba', 'Novemba', 'Desemba'
        ]
      }
    },
    eras: {
      abbreviated: ['KM', 'BM'],
      narrow: ['KM', 'BM'],
      wide: ['Kabla yakwe Yethu', 'Baada yakwe Yethu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'TSh', name: 'shilingi ya Tandhania'},
  getPluralCase: getPluralCase
};
