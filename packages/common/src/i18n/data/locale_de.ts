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
  if (i === 1 && v === 0) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleDe: NgLocale = {
  localeId: 'de',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nachm.',
          morning1: 'morgens',
          morning2: 'vormittags',
          afternoon1: 'mittags',
          afternoon2: 'nachmittags',
          evening1: 'abends',
          night1: 'nachts'
        },
        narrow: {
          midnight: 'Mitternacht',
          am: 'vm.',
          pm: 'nm.',
          morning1: 'morgens',
          morning2: 'vormittags',
          afternoon1: 'mittags',
          afternoon2: 'nachmittags',
          evening1: 'abends',
          night1: 'nachts'
        },
        wide: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nachm.',
          morning1: 'morgens',
          morning2: 'vormittags',
          afternoon1: 'mittags',
          afternoon2: 'nachmittags',
          evening1: 'abends',
          night1: 'nachts'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nachm.',
          morning1: 'Morgen',
          morning2: 'Vormittag',
          afternoon1: 'Mittag',
          afternoon2: 'Nachmittag',
          evening1: 'Abend',
          night1: 'Nacht'
        },
        narrow: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nachm.',
          morning1: 'Morgen',
          morning2: 'Vormittag',
          afternoon1: 'Mittag',
          afternoon2: 'Nachmittag',
          evening1: 'Abend',
          night1: 'Nacht'
        },
        wide: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nachm.',
          morning1: 'Morgen',
          morning2: 'Vormittag',
          afternoon1: 'Mittag',
          afternoon2: 'Nachmittag',
          evening1: 'Abend',
          night1: 'Nacht'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
        abbreviated: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
        wide: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
        abbreviated: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        wide: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.',
          'Dez.'
        ],
        wide: [
          'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September',
          'Oktober', 'November', 'Dezember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        wide: [
          'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September',
          'Oktober', 'November', 'Dezember'
        ]
      }
    },
    eras: {
      abbreviated: ['v. Chr.', 'n. Chr.'],
      narrow: ['v. Chr.', 'n. Chr.'],
      wide: ['v. Chr.', 'n. Chr.']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'dd.MM.y', short: 'dd.MM.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'um\' {0}', long: '{1} \'um\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '13:00'},
      afternoon2: {from: '13:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '00:00', to: '05:00'}
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
      superscriptingExponent: '·',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
