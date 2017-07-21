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
export const NgLocaleBem: NgLocale = {
  localeId: 'bem',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'uluchelo', pm: 'akasuba'},
        narrow: {am: 'uluchelo', pm: 'akasuba'},
        wide: {am: 'uluchelo', pm: 'akasuba'}
      },
      standalone: {
        abbreviated: {am: 'uluchelo', pm: 'akasuba'},
        narrow: {am: 'uluchelo', pm: 'akasuba'},
        wide: {am: 'uluchelo', pm: 'akasuba'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ],
        abbreviated: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ],
        wide: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ],
        abbreviated: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ],
        wide: [
          'Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano',
          'Pachibelushi'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Epr', 'Mei', 'Jun', 'Jul', 'Oga', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Epreo', 'Mei', 'Juni', 'Julai', 'Ogasti', 'Septemba',
          'Oktoba', 'Novemba', 'Disemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Epr', 'Mei', 'Jun', 'Jul', 'Oga', 'Sep', 'Okt', 'Nov', 'Dis'],
        wide: [
          'Januari', 'Februari', 'Machi', 'Epreo', 'Mei', 'Juni', 'Julai', 'Ogasti', 'Septemba',
          'Oktoba', 'Novemba', 'Disemba'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['BC', 'AD'], wide: ['Before Yesu', 'After Yesu']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
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
  currencySettings: {symbol: 'K', name: 'ZMW'},
  getPluralCase: getPluralCase
};
