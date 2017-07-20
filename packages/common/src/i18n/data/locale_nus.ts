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
export const NgLocaleNus: NgLocale = {
  localeId: 'nus',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'RW', pm: 'TŊ'},
        narrow: {am: 'RW', pm: 'TŊ'},
        wide: {am: 'RW', pm: 'TŊ'}
      },
      standalone: {
        abbreviated: {am: 'RW', pm: 'TŊ'},
        narrow: {am: 'RW', pm: 'TŊ'},
        wide: {am: 'RW', pm: 'TŊ'}
      }
    },
    days: {
      format: {
        narrow: ['C', 'J', 'R', 'D', 'Ŋ', 'D', 'B'],
        short: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
        abbreviated: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
        wide: [
          'Cäŋ kuɔth', 'Jiec la̱t', 'Rɛw lätni', 'Diɔ̱k lätni', 'Ŋuaan lätni', 'Dhieec lätni',
          'Bäkɛl lätni'
        ]
      },
      standalone: {
        narrow: ['C', 'J', 'R', 'D', 'Ŋ', 'D', 'B'],
        short: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
        abbreviated: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
        wide: [
          'Cäŋ kuɔth', 'Jiec la̱t', 'Rɛw lätni', 'Diɔ̱k lätni', 'Ŋuaan lätni', 'Dhieec lätni',
          'Bäkɛl lätni'
        ]
      }
    },
    months: {
      format: {
        narrow: ['T', 'P', 'D', 'G', 'D', 'K', 'P', 'T', 'T', 'L', 'K', 'T'],
        abbreviated: [
          'Tiop', 'Pɛt', 'Duɔ̱ɔ̱', 'Guak', 'Duä', 'Kor', 'Pay', 'Thoo', 'Tɛɛ', 'Laa', 'Kur', 'Tid'
        ],
        wide: [
          'Tiop thar pɛt', 'Pɛt', 'Duɔ̱ɔ̱ŋ', 'Guak', 'Duät', 'Kornyoot', 'Pay yie̱tni', 'Tho̱o̱r',
          'Tɛɛr', 'Laath', 'Kur', 'Tio̱p in di̱i̱t'
        ]
      },
      standalone: {
        narrow: ['T', 'P', 'D', 'G', 'D', 'K', 'P', 'T', 'T', 'L', 'K', 'T'],
        abbreviated: [
          'Tiop', 'Pɛt', 'Duɔ̱ɔ̱', 'Guak', 'Duä', 'Kor', 'Pay', 'Thoo', 'Tɛɛ', 'Laa', 'Kur', 'Tid'
        ],
        wide: [
          'Tiop thar pɛt', 'Pɛt', 'Duɔ̱ɔ̱ŋ', 'Guak', 'Duät', 'Kornyoot', 'Pay yie̱tni', 'Tho̱o̱r',
          'Tɛɛr', 'Laath', 'Kur', 'Tio̱p in di̱i̱t'
        ]
      }
    },
    eras: {
      abbreviated: ['AY', 'ƐY'],
      narrow: ['AY', 'ƐY'],
      wide: ['A ka̱n Yecu ni dap', 'Ɛ ca Yecu dap']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/MM/y'},
      time: {full: 'zzzz h:mm:ss a', long: 'z h:mm:ss a', medium: 'h:mm:ss a', short: 'h:mm a'},
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
  currencySettings: {symbol: '£', name: 'SSP'},
  getPluralCase: getPluralCase
};
