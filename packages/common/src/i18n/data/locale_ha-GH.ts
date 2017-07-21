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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleHaGH: NgLocale = {
  localeId: 'ha-GH',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
        short: ['Lh', 'Li', 'Ta', 'Lr', 'Al', 'Ju', 'As'],
        abbreviated: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
        wide: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar']
      },
      standalone: {
        narrow: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
        short: ['Lh', 'Li', 'Ta', 'Lr', 'Al', 'Ju', 'As'],
        abbreviated: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
        wide: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
        wide: [
          'Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba',
          'Oktoba', 'Nuwamba', 'Disamba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
        wide: [
          'Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba',
          'Oktoba', 'Nuwamba', 'Disamba'
        ]
      }
    },
    eras: {
      abbreviated: ['KHAI', 'BHAI'],
      narrow: ['KHAI', 'BHAI'],
      wide: ['Kafin haihuwar annab', 'Bayan haihuwar annab']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'd/M/yy'},
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'GH₵', name: 'GHS'},
  getPluralCase: getPluralCase
};
