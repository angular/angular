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
export const NgLocaleSaq: NgLocale = {
  localeId: 'saq',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Tesiran', pm: 'Teipa'},
        narrow: {am: 'Tesiran', pm: 'Teipa'},
        wide: {am: 'Tesiran', pm: 'Teipa'}
      },
      standalone: {
        abbreviated: {am: 'Tesiran', pm: 'Teipa'},
        narrow: {am: 'Tesiran', pm: 'Teipa'},
        wide: {am: 'Tesiran', pm: 'Teipa'}
      }
    },
    days: {
      format: {
        narrow: ['A', 'K', 'O', 'I', 'I', 'S', 'K'],
        short: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
        abbreviated: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
        wide: [
          'Mderot ee are', 'Mderot ee kuni', 'Mderot ee ong’wan', 'Mderot ee inet', 'Mderot ee ile',
          'Mderot ee sapa', 'Mderot ee kwe'
        ]
      },
      standalone: {
        narrow: ['A', 'K', 'O', 'I', 'I', 'S', 'K'],
        short: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
        abbreviated: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
        wide: [
          'Mderot ee are', 'Mderot ee kuni', 'Mderot ee ong’wan', 'Mderot ee inet', 'Mderot ee ile',
          'Mderot ee sapa', 'Mderot ee kwe'
        ]
      }
    },
    months: {
      format: {
        narrow: ['O', 'W', 'O', 'O', 'I', 'I', 'S', 'I', 'S', 'T', 'T', 'T'],
        abbreviated:
            ['Obo', 'Waa', 'Oku', 'Ong', 'Ime', 'Ile', 'Sap', 'Isi', 'Saa', 'Tom', 'Tob', 'Tow'],
        wide: [
          'Lapa le obo', 'Lapa le waare', 'Lapa le okuni', 'Lapa le ong’wan', 'Lapa le imet',
          'Lapa le ile', 'Lapa le sapa', 'Lapa le isiet', 'Lapa le saal', 'Lapa le tomon',
          'Lapa le tomon obo', 'Lapa le tomon waare'
        ]
      },
      standalone: {
        narrow: ['O', 'W', 'O', 'O', 'I', 'I', 'S', 'I', 'S', 'T', 'T', 'T'],
        abbreviated:
            ['Obo', 'Waa', 'Oku', 'Ong', 'Ime', 'Ile', 'Sap', 'Isi', 'Saa', 'Tom', 'Tob', 'Tow'],
        wide: [
          'Lapa le obo', 'Lapa le waare', 'Lapa le okuni', 'Lapa le ong’wan', 'Lapa le imet',
          'Lapa le ile', 'Lapa le sapa', 'Lapa le isiet', 'Lapa le saal', 'Lapa le tomon',
          'Lapa le tomon obo', 'Lapa le tomon waare'
        ]
      }
    },
    eras: {
      abbreviated: ['KK', 'BK'],
      narrow: ['KK', 'BK'],
      wide: ['Kabla ya Christo', 'Baada ya Christo']
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Ksh', name: 'Njilingi eel Kenya'},
  getPluralCase: getPluralCase
};
