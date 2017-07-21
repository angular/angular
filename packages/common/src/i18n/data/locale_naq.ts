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
  if (n === 2) return Plural.Two;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleNaq: NgLocale = {
  localeId: 'naq',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ǁgoagas', pm: 'ǃuias'},
        narrow: {am: 'ǁgoagas', pm: 'ǃuias'},
        wide: {am: 'ǁgoagas', pm: 'ǃuias'}
      },
      standalone: {
        abbreviated: {am: 'ǁgoagas', pm: 'ǃuias'},
        narrow: {am: 'ǁgoagas', pm: 'ǃuias'},
        wide: {am: 'ǁgoagas', pm: 'ǃuias'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'E', 'W', 'D', 'F', 'A'],
        short: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
        abbreviated: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
        wide: [
          'Sontaxtsees', 'Mantaxtsees', 'Denstaxtsees', 'Wunstaxtsees', 'Dondertaxtsees',
          'Fraitaxtsees', 'Satertaxtsees'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'E', 'W', 'D', 'F', 'A'],
        short: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
        abbreviated: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
        wide: [
          'Sontaxtsees', 'Mantaxtsees', 'Denstaxtsees', 'Wunstaxtsees', 'Dondertaxtsees',
          'Fraitaxtsees', 'Satertaxtsees'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: [
          'ǃKhanni', 'ǃKhanǀgôab', 'ǀKhuuǁkhâb', 'ǃHôaǂkhaib', 'ǃKhaitsâb', 'Gamaǀaeb', 'ǂKhoesaob',
          'Aoǁkhuumûǁkhâb', 'Taraǀkhuumûǁkhâb', 'ǂNûǁnâiseb', 'ǀHooǂgaeb', 'Hôasoreǁkhâb'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: [
          'ǃKhanni', 'ǃKhanǀgôab', 'ǀKhuuǁkhâb', 'ǃHôaǂkhaib', 'ǃKhaitsâb', 'Gamaǀaeb', 'ǂKhoesaob',
          'Aoǁkhuumûǁkhâb', 'Taraǀkhuumûǁkhâb', 'ǂNûǁnâiseb', 'ǀHooǂgaeb', 'Hôasoreǁkhâb'
        ]
      }
    },
    eras: {
      abbreviated: ['BC', 'AD'],
      narrow: ['BC', 'AD'],
      wide: ['Xristub aiǃâ', 'Xristub khaoǃgâ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
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
  currencySettings: {symbol: 'ZAR', name: 'South African Randi'},
  getPluralCase: getPluralCase
};
