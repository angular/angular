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
export const NgLocaleLb: NgLocale = {
  localeId: 'lb',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'moies', pm: 'nomëttes'},
        narrow: {am: 'mo.', pm: 'nomë.'},
        wide: {am: 'moies', pm: 'nomëttes'}
      },
      standalone: {
        abbreviated: {am: 'moies', pm: 'nomëttes'},
        narrow: {am: 'moies', pm: 'nomëttes'},
        wide: {am: 'moies', pm: 'nomëttes'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['So.', 'Mé.', 'Dë.', 'Më.', 'Do.', 'Fr.', 'Sa.'],
        abbreviated: ['Son.', 'Méi.', 'Dën.', 'Mët.', 'Don.', 'Fre.', 'Sam.'],
        wide:
            ['Sonndeg', 'Méindeg', 'Dënschdeg', 'Mëttwoch', 'Donneschdeg', 'Freideg', 'Samschdeg']
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['So.', 'Mé.', 'Dë.', 'Më.', 'Do.', 'Fr.', 'Sa.'],
        abbreviated: ['Son', 'Méi', 'Dën', 'Mët', 'Don', 'Fre', 'Sam'],
        wide: [
          'Sonndeg', 'Méindeg', 'Dënschdeg', 'Mëttwoch', 'Donneschdeg', 'Freideg', 'Samschdeg'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Jan.', 'Feb.', 'Mäe.', 'Abr.', 'Mee', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.',
          'Dez.'
        ],
        wide: [
          'Januar', 'Februar', 'Mäerz', 'Abrëll', 'Mee', 'Juni', 'Juli', 'August', 'September',
          'Oktober', 'November', 'Dezember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mäe', 'Abr', 'Mee', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        wide: [
          'Januar', 'Februar', 'Mäerz', 'Abrëll', 'Mee', 'Juni', 'Juli', 'August', 'September',
          'Oktober', 'November', 'Dezember'
        ]
      }
    },
    eras: {
      abbreviated: ['v. Chr.', 'n. Chr.'],
      narrow: ['v. Chr.', 'n. Chr.'],
      wide: ['v. Chr.', 'n. Chr.']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'dd.MM.yy'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
