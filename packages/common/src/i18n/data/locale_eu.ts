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
export const NgLocaleEu: NgLocale = {
  localeId: 'eu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goiz.',
          morning2: 'goizeko',
          afternoon1: 'eguerd.',
          afternoon2: 'arrats.',
          evening1: 'iluntz.',
          night1: 'gau.'
        },
        narrow: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goiz.',
          morning2: 'goizeko',
          afternoon1: 'eguerd.',
          afternoon2: 'arrats.',
          evening1: 'iluntz.',
          night1: 'gau.'
        },
        wide: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goizaldeko',
          morning2: 'goizeko',
          afternoon1: 'eguerdiko',
          afternoon2: 'arratsaldeko',
          evening1: 'iluntzeko',
          night1: 'gaueko'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goiz.',
          morning2: 'goiza',
          afternoon1: 'eguerd.',
          afternoon2: 'arrats.',
          evening1: 'iluntz.',
          night1: 'gaua'
        },
        narrow: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goiz.',
          morning2: 'goiza',
          afternoon1: 'eguerd.',
          afternoon2: 'arrats.',
          evening1: 'iluntz.',
          night1: 'gaua'
        },
        wide: {
          midnight: 'gauerdia',
          am: 'AM',
          pm: 'PM',
          morning1: 'goizaldea',
          morning2: 'goiza',
          afternoon1: 'eguerdia',
          afternoon2: 'arratsaldea',
          evening1: 'iluntzea',
          night1: 'gaua'
        }
      }
    },
    days: {
      format: {
        narrow: ['I', 'A', 'A', 'A', 'O', 'O', 'L'],
        short: ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.'],
        abbreviated: ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.'],
        wide: [
          'igandea', 'astelehena', 'asteartea', 'asteazkena', 'osteguna', 'ostirala', 'larunbata'
        ]
      },
      standalone: {
        narrow: ['I', 'A', 'A', 'A', 'O', 'O', 'L'],
        short: ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.'],
        abbreviated: ['ig.', 'al.', 'ar.', 'az.', 'og.', 'or.', 'lr.'],
        wide: [
          'Igandea', 'Astelehena', 'Asteartea', 'Asteazkena', 'Osteguna', 'Ostirala', 'Larunbata'
        ]
      }
    },
    months: {
      format: {
        narrow: ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U', 'A', 'A'],
        abbreviated: [
          'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.',
          'abe.'
        ],
        wide: [
          'urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua',
          'iraila', 'urria', 'azaroa', 'abendua'
        ]
      },
      standalone: {
        narrow: ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U', 'A', 'A'],
        abbreviated: [
          'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.',
          'abe.'
        ],
        wide: [
          'urtarrila', 'Otsaila', 'Martxoa', 'Apirila', 'Maiatza', 'Ekaina', 'Uztaila', 'Abuztua',
          'Iraila', 'Urria', 'Azaroa', 'Abendua'
        ]
      }
    },
    eras: {
      abbreviated: ['K.a.', 'K.o.'],
      narrow: ['K.a.', 'K.o.'],
      wide: ['K.a.', 'Kristo ondoren']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y(\'e\')\'ko\' MMMM d, EEEE',
        long: 'y(\'e\')\'ko\' MMMM d',
        medium: 'y MMM d',
        short: 'yy/M/d'
      },
      time: {full: 'HH:mm:ss (zzzz)', long: 'HH:mm:ss (z)', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      afternoon2: {from: '14:00', to: '19:00'},
      evening1: {from: '19:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '00:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '24:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '% #,##0', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euroa'},
  getPluralCase: getPluralCase
};
