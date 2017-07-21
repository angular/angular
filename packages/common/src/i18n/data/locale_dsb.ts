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
export const NgLocaleDsb: NgLocale = {
  localeId: 'dsb',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'dopołdnja', pm: 'wótpołdnja'},
        narrow: {am: 'dop.', pm: 'wótp.'},
        wide: {am: 'dopołdnja', pm: 'wótpołdnja'}
      },
      standalone: {
        abbreviated: {am: 'dopołdnja', pm: 'wótpołdnja'},
        narrow: {am: 'dopołdnja', pm: 'wótpołdnja'},
        wide: {am: 'dopołdnja', pm: 'wótpołdnja'}
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 'w', 's', 's', 'p', 's'],
        short: ['nj', 'pó', 'wa', 'sr', 'st', 'pě', 'so'],
        abbreviated: ['nje', 'pón', 'wał', 'srj', 'stw', 'pět', 'sob'],
        wide: ['njeźela', 'pónjeźele', 'wałtora', 'srjoda', 'stwórtk', 'pětk', 'sobota']
      },
      standalone: {
        narrow: ['n', 'p', 'w', 's', 's', 'p', 's'],
        short: ['nj', 'pó', 'wa', 'sr', 'st', 'pě', 'so'],
        abbreviated: ['nje', 'pón', 'wał', 'srj', 'stw', 'pět', 'sob'],
        wide: ['njeźela', 'pónjeźele', 'wałtora', 'srjoda', 'stwórtk', 'pětk', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'měr.', 'apr.', 'maj.', 'jun.', 'jul.', 'awg.', 'sep.', 'okt.', 'now.',
          'dec.'
        ],
        wide: [
          'januara', 'februara', 'měrca', 'apryla', 'maja', 'junija', 'julija', 'awgusta',
          'septembra', 'oktobra', 'nowembra', 'decembra'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'měr', 'apr', 'maj', 'jun', 'jul', 'awg', 'sep', 'okt', 'now', 'dec'],
        wide: [
          'januar', 'februar', 'měrc', 'apryl', 'maj', 'junij', 'julij', 'awgust', 'september',
          'oktober', 'nowember', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['pś.Chr.n.', 'pó Chr.n.'],
      narrow: ['pś.Chr.n.', 'pó Chr.n.'],
      wide: ['pśed Kristusowym naroźenim', 'pó Kristusowem naroźenju']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd.M.y', short: 'd.M.yy'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
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
