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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || i === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleFfMR: NgLocale = {
  localeId: 'ff-MR',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'subaka', pm: 'kikiiɗe'},
        narrow: {am: 'subaka', pm: 'kikiiɗe'},
        wide: {am: 'subaka', pm: 'kikiiɗe'}
      },
      standalone: {
        abbreviated: {am: 'subaka', pm: 'kikiiɗe'},
        narrow: {am: 'subaka', pm: 'kikiiɗe'},
        wide: {am: 'subaka', pm: 'kikiiɗe'}
      }
    },
    days: {
      format: {
        narrow: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
        short: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
        abbreviated: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
        wide: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir']
      },
      standalone: {
        narrow: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
        short: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
        abbreviated: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
        wide: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir']
      }
    },
    months: {
      format: {
        narrow: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
        abbreviated:
            ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
        wide: [
          'siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto',
          'yarkomaa', 'jolal', 'bowte'
        ]
      },
      standalone: {
        narrow: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
        abbreviated:
            ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
        wide: [
          'siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto',
          'yarkomaa', 'jolal', 'bowte'
        ]
      }
    },
    eras:
        {abbreviated: ['H-I', 'C-I'], narrow: ['H-I', 'C-I'], wide: ['Hade Iisa', 'Caggal Iisa']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM, y', short: 'd/M/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: 'UM', name: 'Ugiyya Muritani'},
  getPluralCase: getPluralCase
};
