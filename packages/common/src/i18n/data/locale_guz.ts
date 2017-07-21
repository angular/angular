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
export const NgLocaleGuz: NgLocale = {
  localeId: 'guz',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Ma', pm: 'Mo'},
        narrow: {am: 'Ma', pm: 'Mo'},
        wide: {am: 'Mambia', pm: 'Mog'}
      },
      standalone: {
        abbreviated: {am: 'Ma', pm: 'Mo'},
        narrow: {am: 'Ma', pm: 'Mo'},
        wide: {am: 'Ma', pm: 'Mo'}
      }
    },
    days: {
      format: {
        narrow: ['C', 'C', 'C', 'C', 'A', 'I', 'E'],
        short: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
        abbreviated: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
        wide: ['Chumapiri', 'Chumatato', 'Chumaine', 'Chumatano', 'Aramisi', 'Ichuma', 'Esabato']
      },
      standalone: {
        narrow: ['C', 'C', 'C', 'C', 'A', 'I', 'E'],
        short: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
        abbreviated: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
        wide: ['Chumapiri', 'Chumatato', 'Chumaine', 'Chumatano', 'Aramisi', 'Ichuma', 'Esabato']
      }
    },
    months: {
      format: {
        narrow: ['C', 'F', 'M', 'A', 'M', 'J', 'C', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Can', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Cul', 'Agt', 'Sep', 'Okt', 'Nob', 'Dis'],
        wide: [
          'Chanuari', 'Feburari', 'Machi', 'Apiriri', 'Mei', 'Juni', 'Chulai', 'Agosti', 'Septemba',
          'Okitoba', 'Nobemba', 'Disemba'
        ]
      },
      standalone: {
        narrow: ['C', 'F', 'M', 'A', 'M', 'J', 'C', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Can', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Cul', 'Agt', 'Sep', 'Okt', 'Nob', 'Dis'],
        wide: [
          'Chanuari', 'Feburari', 'Machi', 'Apiriri', 'Mei', 'Juni', 'Chulai', 'Agosti', 'Septemba',
          'Okitoba', 'Nobemba', 'Disemba'
        ]
      }
    },
    eras: {
      abbreviated: ['YA', 'YK'],
      narrow: ['YA', 'YK'],
      wide: ['Yeso ataiborwa', 'Yeso kaiboirwe']
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
  currencySettings: {symbol: 'Ksh', name: 'Shilingi ya Kenya'},
  getPluralCase: getPluralCase
};
