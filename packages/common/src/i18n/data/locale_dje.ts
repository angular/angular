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
export const NgLocaleDje: NgLocale = {
  localeId: 'dje',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Subbaahi', pm: 'Zaarikay b'},
        narrow: {am: 'Subbaahi', pm: 'Zaarikay b'},
        wide: {am: 'Subbaahi', pm: 'Zaarikay b'}
      },
      standalone: {
        abbreviated: {am: 'Subbaahi', pm: 'Zaarikay b'},
        narrow: {am: 'Subbaahi', pm: 'Zaarikay b'},
        wide: {am: 'Subbaahi', pm: 'Zaarikay b'}
      }
    },
    days: {
      format: {
        narrow: ['H', 'T', 'T', 'L', 'M', 'Z', 'S'],
        short: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
        abbreviated: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
        wide: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamisi', 'Alzuma', 'Asibti']
      },
      standalone: {
        narrow: ['H', 'T', 'T', 'L', 'M', 'Z', 'S'],
        short: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
        abbreviated: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
        wide: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamisi', 'Alzuma', 'Asibti']
      }
    },
    months: {
      format: {
        narrow: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
        wide: [
          'Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur',
          'Oktoobur', 'Noowanbur', 'Deesanbur'
        ]
      },
      standalone: {
        narrow: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
        wide: [
          'Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur',
          'Oktoobur', 'Noowanbur', 'Deesanbur'
        ]
      }
    },
    eras: {abbreviated: ['IJ', 'IZ'], narrow: ['IJ', 'IZ'], wide: ['Isaa jine', 'Isaa zamanoo']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM, y', short: 'd/M/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
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
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'CFA', name: 'CFA Fraŋ (BCEAO)'},
  getPluralCase: getPluralCase
};
