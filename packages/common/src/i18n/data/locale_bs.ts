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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
    return Plural.One;
  if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14) ||
      f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
          !(f % 100 >= 12 && f % 100 <= 14))
    return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleBs: NgLocale = {
  localeId: 'bs',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        },
        narrow: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        },
        wide: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        },
        narrow: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        },
        wide: {
          midnight: 'ponoć',
          am: 'prijepodne',
          noon: 'podne',
          pm: 'popodne',
          morning1: 'ujutro',
          afternoon1: 'poslijepodne',
          evening1: 'navečer',
          night1: 'po noći'
        }
      }
    },
    days: {
      format: {
        narrow: ['N', 'P', 'U', 'S', 'Č', 'P', 'S'],
        short: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
        abbreviated: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
        wide: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota']
      },
      standalone: {
        narrow: ['n', 'p', 'u', 's', 'č', 'p', 's'],
        short: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
        abbreviated: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
        wide: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'avgust', 'septembar',
          'oktobar', 'novembar', 'decembar'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'avgust', 'septembar',
          'oktobar', 'novembar', 'decembar'
        ]
      }
    },
    eras: {
      abbreviated: ['p. n. e.', 'n. e.'],
      narrow: ['p. n. e.', 'n. e.'],
      wide: ['prije nove ere', 'nove ere']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y.', long: 'd. MMMM y.', medium: 'd. MMM. y.', short: 'd.M.yy.'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'u\' {0}', long: '{1} \'u\' {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'KM', name: 'Bosanskohercegovačka konvertibilna marka'},
  getPluralCase: getPluralCase
};
