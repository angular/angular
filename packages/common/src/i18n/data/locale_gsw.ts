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
export const NgLocaleGsw: NgLocale = {
  localeId: 'gsw',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nam.',
          morning1: 'am Morge',
          afternoon1: 'zmittag',
          afternoon2: 'am Namittag',
          evening1: 'zaabig',
          night1: 'znacht'
        },
        narrow: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nam.',
          morning1: 'am Morge',
          afternoon1: 'zmittag',
          afternoon2: 'am Namittag',
          evening1: 'zaabig',
          night1: 'znacht'
        },
        wide: {
          midnight: 'Mitternacht',
          am: 'am Vormittag',
          pm: 'am Namittag',
          morning1: 'am Morge',
          afternoon1: 'zmittag',
          afternoon2: 'am Namittag',
          evening1: 'zaabig',
          night1: 'znacht'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nam.',
          morning1: 'am Morge',
          afternoon1: 'zmittag',
          afternoon2: 'am Namittag',
          evening1: 'zaabig',
          night1: 'znacht'
        },
        narrow: {
          midnight: 'Mitternacht',
          am: 'vorm.',
          pm: 'nam.',
          morning1: 'am Morge',
          afternoon1: 'zmittag',
          afternoon2: 'am Namittag',
          evening1: 'zaabig',
          night1: 'znacht'
        },
        wide: {
          midnight: 'Mitternacht',
          am: 'Vormittag',
          pm: 'Namittag',
          morning1: 'Morge',
          afternoon1: 'Mittag',
          afternoon2: 'Namittag',
          evening1: 'Aabig',
          night1: 'Nacht'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
        abbreviated: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
        wide: ['Sunntig', 'Määntig', 'Ziischtig', 'Mittwuch', 'Dunschtig', 'Friitig', 'Samschtig']
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
        abbreviated: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
        wide:
            ['Sunntig', 'Määntig', 'Ziischtig', 'Mittwuch', 'Dunschtig', 'Friitig', 'Samschtig']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        wide: [
          'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Auguscht', 'Septämber',
          'Oktoober', 'Novämber', 'Dezämber'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        wide: [
          'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Auguscht', 'Septämber',
          'Oktoober', 'Novämber', 'Dezämber'
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
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      afternoon2: {from: '14:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '12:00'},
      night1: {from: '00:00', to: '05:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: '’',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'CHF', name: 'Schwiizer Franke'},
  getPluralCase: getPluralCase
};
