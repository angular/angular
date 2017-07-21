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
export const NgLocaleAfNA: NgLocale = {
  localeId: 'af-NA',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'middernag',
          am: 'vm.',
          pm: 'nm.',
          morning1: 'die oggend',
          afternoon1: 'die middag',
          evening1: 'die aand',
          night1: 'die nag'
        },
        narrow: {
          midnight: 'mn',
          am: 'v',
          pm: 'n',
          morning1: 'o',
          afternoon1: 'm',
          evening1: 'a',
          night1: 'n'
        },
        wide: {
          midnight: 'middernag',
          am: 'vm.',
          pm: 'nm.',
          morning1: 'die oggend',
          afternoon1: 'die middag',
          evening1: 'die aand',
          night1: 'die nag'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'middernag',
          am: 'vm.',
          pm: 'nm.',
          morning1: 'oggend',
          afternoon1: 'middag',
          evening1: 'aand',
          night1: 'nag'
        },
        narrow: {
          midnight: 'mn',
          am: 'v',
          pm: 'n',
          morning1: 'o',
          afternoon1: 'm',
          evening1: 'a',
          night1: 'n'
        },
        wide: {
          midnight: 'middernag',
          am: 'vm.',
          pm: 'nm.',
          morning1: 'oggend',
          afternoon1: 'middag',
          evening1: 'aand',
          night1: 'nag'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
        short: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
        abbreviated: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
        wide: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag']
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
        short: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
        abbreviated: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
        wide: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.',
          'Des.'
        ],
        wide: [
          'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus',
          'September', 'Oktober', 'November', 'Desember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.',
          'Des.'
        ],
        wide: [
          'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus',
          'September', 'Oktober', 'November', 'Desember'
        ]
      }
    },
    eras: {
      abbreviated: ['v.C.', 'n.C.'],
      narrow: ['v.C.', 'n.C.'],
      wide: ['voor Christus', 'na Christus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM y', long: 'dd MMMM y', medium: 'dd MMM y', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '12:00'},
      night1: {from: '00:00', to: '05:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
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
  currencySettings: {symbol: 'R', name: 'Suid-Afrikaanse rand'},
  getPluralCase: getPluralCase
};
