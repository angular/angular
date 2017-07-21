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
export const NgLocaleLu: NgLocale = {
  localeId: 'lu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Dinda', pm: 'Dilolo'},
        narrow: {am: 'Dinda', pm: 'Dilolo'},
        wide: {am: 'Dinda', pm: 'Dilolo'}
      },
      standalone: {
        abbreviated: {am: 'Dinda', pm: 'Dilolo'},
        narrow: {am: 'Dinda', pm: 'Dilolo'},
        wide: {am: 'Dinda', pm: 'Dilolo'}
      }
    },
    days: {
      format: {
        narrow: ['L', 'N', 'N', 'N', 'N', 'N', 'L'],
        short: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
        abbreviated: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
        wide: ['Lumingu', 'Nkodya', 'Ndàayà', 'Ndangù', 'Njòwa', 'Ngòvya', 'Lubingu']
      },
      standalone: {
        narrow: ['L', 'N', 'N', 'N', 'N', 'N', 'L'],
        short: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
        abbreviated: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
        wide: ['Lumingu', 'Nkodya', 'Ndàayà', 'Ndangù', 'Njòwa', 'Ngòvya', 'Lubingu']
      }
    },
    months: {
      format: {
        narrow: ['C', 'L', 'L', 'M', 'L', 'L', 'K', 'L', 'L', 'L', 'K', 'C'],
        abbreviated:
            ['Cio', 'Lui', 'Lus', 'Muu', 'Lum', 'Luf', 'Kab', 'Lush', 'Lut', 'Lun', 'Kas', 'Cis'],
        wide: [
          'Ciongo', 'Lùishi', 'Lusòlo', 'Mùuyà', 'Lumùngùlù', 'Lufuimi', 'Kabàlàshìpù', 'Lùshìkà',
          'Lutongolo', 'Lungùdi', 'Kaswèkèsè', 'Ciswà'
        ]
      },
      standalone: {
        narrow: ['C', 'L', 'L', 'M', 'L', 'L', 'K', 'L', 'L', 'L', 'K', 'C'],
        abbreviated:
            ['Cio', 'Lui', 'Lus', 'Muu', 'Lum', 'Luf', 'Kab', 'Lush', 'Lut', 'Lun', 'Kas', 'Cis'],
        wide: [
          'Ciongo', 'Lùishi', 'Lusòlo', 'Mùuyà', 'Lumùngùlù', 'Lufuimi', 'Kabàlàshìpù', 'Lùshìkà',
          'Lutongolo', 'Lungùdi', 'Kaswèkèsè', 'Ciswà'
        ]
      }
    },
    eras: {
      abbreviated: ['kmp. Y.K.', 'kny. Y. K.'],
      narrow: ['kmp. Y.K.', 'kny. Y. K.'],
      wide: ['Kumpala kwa Yezu Kli', 'Kunyima kwa Yezu Kli']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
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
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FC', name: 'Nfalanga wa Kongu'},
  getPluralCase: getPluralCase
};
