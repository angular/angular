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
export const NgLocaleSrLatnXK: NgLocale = {
  localeId: 'sr-Latn-XK',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'ponoć',
          am: 'pre podne',
          noon: 'podne',
          pm: 'po podne',
          morning1: 'jutro',
          afternoon1: 'po pod.',
          evening1: 'uveče',
          night1: 'noću'
        },
        narrow: {
          midnight: 'ponoć',
          am: 'a',
          noon: 'podne',
          pm: 'p',
          morning1: 'jutro',
          afternoon1: 'po pod.',
          evening1: 'veče',
          night1: 'noć'
        },
        wide: {
          midnight: 'ponoć',
          am: 'pre podne',
          noon: 'podne',
          pm: 'po podne',
          morning1: 'ujutro',
          afternoon1: 'po podne',
          evening1: 'uveče',
          night1: 'noću'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'ponoć',
          am: 'pre podne',
          noon: 'podne',
          pm: 'po podne',
          morning1: 'jutro',
          afternoon1: 'popodne',
          evening1: 'veče',
          night1: 'noć'
        },
        narrow: {
          midnight: 'ponoć',
          am: 'a',
          noon: 'podne',
          pm: 'p',
          morning1: 'ujutro',
          afternoon1: 'po podne',
          evening1: 'uveče',
          night1: 'noću'
        },
        wide: {
          midnight: 'ponoć',
          am: 'pre podne',
          noon: 'podne',
          pm: 'po podne',
          morning1: 'jutro',
          afternoon1: 'popodne',
          evening1: 'veče',
          night1: 'noć'
        }
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 'u', 's', 'č', 'p', 's'],
        short: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
        abbreviated: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
        wide: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota']
      },
      standalone: {
        narrow: ['n', 'p', 'u', 's', 'č', 'p', 's'],
        short: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
        abbreviated: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
        wide: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar',
          'oktobar', 'novembar', 'decembar'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar',
          'oktobar', 'novembar', 'decembar'
        ]
      }
    },
    eras: {
      abbreviated: ['p. n. e.', 'n. e.'],
      narrow: ['p.n.e.', 'n.e.'],
      wide: ['pre nove ere', 'nove ere']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd. MMMM y.', long: 'dd. MMMM y.', medium: 'dd.MM.y.', short: 'd.M.yy.'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'},
      noon: '12:00'
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Evro'},
  getPluralCase: getPluralCase
};
