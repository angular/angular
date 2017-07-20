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
  if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
      !(i % 100 >= 12 && i % 100 <= 14))
    return Plural.Few;
  if (v === 0 && !(i === 1) && i % 10 === Math.floor(i % 10) && i % 10 >= 0 && i % 10 <= 1 ||
      v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
      v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 12 && i % 100 <= 14)
    return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocalePl: NgLocale = {
  localeId: 'pl',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'o północy',
          am: 'AM',
          noon: 'w południe',
          pm: 'PM',
          morning1: 'rano',
          morning2: 'przed południem',
          afternoon1: 'po południu',
          evening1: 'wieczorem',
          night1: 'w nocy'
        },
        narrow: {
          midnight: 'o półn.',
          am: 'a',
          noon: 'w poł.',
          pm: 'p',
          morning1: 'rano',
          morning2: 'przed poł.',
          afternoon1: 'po poł.',
          evening1: 'wiecz.',
          night1: 'w nocy'
        },
        wide: {
          midnight: 'o północy',
          am: 'AM',
          noon: 'w południe',
          pm: 'PM',
          morning1: 'rano',
          morning2: 'przed południem',
          afternoon1: 'po południu',
          evening1: 'wieczorem',
          night1: 'w nocy'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'północ',
          am: 'AM',
          noon: 'południe',
          pm: 'PM',
          morning1: 'rano',
          morning2: 'przedpołudnie',
          afternoon1: 'popołudnie',
          evening1: 'wieczór',
          night1: 'noc'
        },
        narrow: {
          midnight: 'półn.',
          am: 'a',
          noon: 'poł.',
          pm: 'p',
          morning1: 'rano',
          morning2: 'przedpoł.',
          afternoon1: 'popoł.',
          evening1: 'wiecz.',
          night1: 'noc'
        },
        wide: {
          midnight: 'północ',
          am: 'AM',
          noon: 'południe',
          pm: 'PM',
          morning1: 'rano',
          morning2: 'przedpołudnie',
          afternoon1: 'popołudnie',
          evening1: 'wieczór',
          night1: 'noc'
        }
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 'w', 'ś', 'c', 'p', 's'],
        short: ['nie', 'pon', 'wto', 'śro', 'czw', 'pią', 'sob'],
        abbreviated: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
        wide: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
      },
      standalone: {
        narrow: ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'],
        short: ['nie', 'pon', 'wto', 'śro', 'czw', 'pią', 'sob'],
        abbreviated: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
        wide: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['s', 'l', 'm', 'k', 'm', 'c', 'l', 's', 'w', 'p', 'l', 'g'],
        abbreviated:
            ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
        wide: [
          'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia',
          'września', 'października', 'listopada', 'grudnia'
        ]
      },
      standalone: {
        narrow: ['S', 'L', 'M', 'K', 'M', 'C', 'L', 'S', 'W', 'P', 'L', 'G'],
        abbreviated:
            ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
        wide: [
          'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień',
          'wrzesień', 'październik', 'listopad', 'grudzień'
        ]
      }
    },
    eras: {
      abbreviated: ['p.n.e.', 'n.e.'],
      narrow: ['p.n.e.', 'n.e.'],
      wide: ['przed naszą erą', 'naszej ery']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd.MM.y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'},
      noon: '12:00'
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'zł', name: 'złoty polski'},
  getPluralCase: getPluralCase
};
