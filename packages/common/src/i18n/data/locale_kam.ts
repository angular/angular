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
export const NgLocaleKam: NgLocale = {
  localeId: 'kam',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'},
        narrow: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'},
        wide: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'}
      },
      standalone: {
        abbreviated: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'},
        narrow: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'},
        wide: {am: 'Ĩyakwakya', pm: 'Ĩyawĩoo'}
      }
    },
    days: {
      format: {
        narrow: ['Y', 'W', 'E', 'A', 'A', 'A', 'A'],
        short: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
        abbreviated: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
        wide: [
          'Wa kyumwa', 'Wa kwambĩlĩlya', 'Wa kelĩ', 'Wa katatũ', 'Wa kana', 'Wa katano',
          'Wa thanthatũ'
        ]
      },
      standalone: {
        narrow: ['Y', 'W', 'E', 'A', 'A', 'A', 'A'],
        short: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
        abbreviated: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
        wide: [
          'Wa kyumwa', 'Wa kwambĩlĩlya', 'Wa kelĩ', 'Wa katatũ', 'Wa kana', 'Wa katano',
          'Wa thanthatũ'
        ]
      }
    },
    months: {
      format: {
        narrow: ['M', 'K', 'K', 'K', 'K', 'T', 'M', 'N', 'K', 'Ĩ', 'Ĩ', 'Ĩ'],
        abbreviated:
            ['Mbe', 'Kel', 'Ktũ', 'Kan', 'Ktn', 'Tha', 'Moo', 'Nya', 'Knd', 'Ĩku', 'Ĩkm', 'Ĩkl'],
        wide: [
          'Mwai wa mbee', 'Mwai wa kelĩ', 'Mwai wa katatũ', 'Mwai wa kana', 'Mwai wa katano',
          'Mwai wa thanthatũ', 'Mwai wa muonza', 'Mwai wa nyaanya', 'Mwai wa kenda',
          'Mwai wa ĩkumi', 'Mwai wa ĩkumi na ĩmwe', 'Mwai wa ĩkumi na ilĩ'
        ]
      },
      standalone: {
        narrow: ['M', 'K', 'K', 'K', 'K', 'T', 'M', 'N', 'K', 'Ĩ', 'Ĩ', 'Ĩ'],
        abbreviated:
            ['Mbe', 'Kel', 'Ktũ', 'Kan', 'Ktn', 'Tha', 'Moo', 'Nya', 'Knd', 'Ĩku', 'Ĩkm', 'Ĩkl'],
        wide: [
          'Mwai wa mbee', 'Mwai wa kelĩ', 'Mwai wa katatũ', 'Mwai wa kana', 'Mwai wa katano',
          'Mwai wa thanthatũ', 'Mwai wa muonza', 'Mwai wa nyaanya', 'Mwai wa kenda',
          'Mwai wa ĩkumi', 'Mwai wa ĩkumi na ĩmwe', 'Mwai wa ĩkumi na ilĩ'
        ]
      }
    },
    eras:
        {abbreviated: ['MY', 'IY'], narrow: ['MY', 'IY'], wide: ['Mbee wa Yesũ', 'Ĩtina wa Yesũ']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
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
  currencySettings: {symbol: 'Ksh', name: 'Silingi ya Kenya'},
  getPluralCase: getPluralCase
};
