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
  if (v === 0 && i % 100 === 1 || f % 100 === 1) return Plural.One;
  if (v === 0 && i % 100 === 2 || f % 100 === 2) return Plural.Two;
  if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 ||
      f % 100 === Math.floor(f % 100) && f % 100 >= 3 && f % 100 <= 4)
    return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleHsb: NgLocale = {
  localeId: 'hsb',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'dopołdnja', pm: 'popołdnju'},
        narrow: {am: 'dop.', pm: 'pop.'},
        wide: {am: 'dopołdnja', pm: 'popołdnju'}
      },
      standalone: {
        abbreviated: {am: 'dopołdnja', pm: 'popołdnju'},
        narrow: {am: 'dopołdnja', pm: 'popołdnju'},
        wide: {am: 'dopołdnja', pm: 'popołdnju'}
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 'w', 's', 'š', 'p', 's'],
        short: ['nj', 'pó', 'wu', 'sr', 'št', 'pj', 'so'],
        abbreviated: ['nje', 'pón', 'wut', 'srj', 'štw', 'pja', 'sob'],
        wide: ['njedźela', 'póndźela', 'wutora', 'srjeda', 'štwórtk', 'pjatk', 'sobota']
      },
      standalone: {
        narrow: ['n', 'p', 'w', 's', 'š', 'p', 's'],
        short: ['nj', 'pó', 'wu', 'sr', 'št', 'pj', 'so'],
        abbreviated: ['nje', 'pón', 'wut', 'srj', 'štw', 'pja', 'sob'],
        wide: ['njedźela', 'póndźela', 'wutora', 'srjeda', 'štwórtk', 'pjatk', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'měr.', 'apr.', 'mej.', 'jun.', 'jul.', 'awg.', 'sep.', 'okt.', 'now.',
          'dec.'
        ],
        wide: [
          'januara', 'februara', 'měrca', 'apryla', 'meje', 'junija', 'julija', 'awgusta',
          'septembra', 'oktobra', 'nowembra', 'decembra'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'měr', 'apr', 'mej', 'jun', 'jul', 'awg', 'sep', 'okt', 'now', 'dec'],
        wide: [
          'januar', 'februar', 'měrc', 'apryl', 'meja', 'junij', 'julij', 'awgust', 'september',
          'oktober', 'nowember', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['př.Chr.n.', 'po Chr.n.'],
      narrow: ['př.Chr.n.', 'po Chr.n.'],
      wide: ['před Chrystowym narodźenjom', 'po Chrystowym narodźenju']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd.M.y', short: 'd.M.yy'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm \'hodź\'.'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
