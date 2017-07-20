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
export const NgLocaleKea: NgLocale = {
  localeId: 'kea',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'am', pm: 'pm'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'am', pm: 'pm'}
      },
      standalone: {
        abbreviated: {am: 'am', pm: 'pm'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'am', pm: 'pm'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'S', 'T', 'K', 'K', 'S', 'S'],
        short: ['du', 'si', 'te', 'ku', 'ki', 'se', 'sa'],
        abbreviated: ['dum', 'sig', 'ter', 'kua', 'kin', 'ses', 'sab'],
        wide: [
          'dumingu', 'sigunda-fera', 'tersa-fera', 'kuarta-fera', 'kinta-fera', 'sesta-fera',
          'sabadu'
        ]
      },
      standalone: {
        narrow: ['D', 'S', 'T', 'K', 'K', 'S', 'S'],
        short: ['du', 'si', 'te', 'ku', 'ki', 'se', 'sa'],
        abbreviated: ['dum', 'sig', 'ter', 'kua', 'kin', 'ses', 'sab'],
        wide: [
          'dumingu', 'sigunda-fera', 'tersa-fera', 'kuarta-fera', 'kinta-fera', 'sesta-fera',
          'sábadu'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Otu', 'Nuv', 'Diz'],
        wide: [
          'Janeru', 'Febreru', 'Marsu', 'Abril', 'Maiu', 'Junhu', 'Julhu', 'Agostu', 'Setenbru',
          'Otubru', 'Nuvenbru', 'Dizenbru'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Otu', 'Nuv', 'Diz'],
        wide: [
          'Janeru', 'Febreru', 'Marsu', 'Abril', 'Maiu', 'Junhu', 'Julhu', 'Agostu', 'Setenbru',
          'Otubru', 'Nuvenbru', 'Dizenbru'
        ]
      }
    },
    eras: {
      abbreviated: ['AK', 'DK'],
      narrow: ['AK', 'DK'],
      wide: ['Antis di Kristu', 'Dispos di Kristu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d \'di\' MMMM \'di\' y',
        long: 'd \'di\' MMMM \'di\' y',
        medium: 'd MMM y',
        short: 'd/M/y'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
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
  currencySettings: {symbol: '​', name: 'Skudu Kabuverdianu'},
  getPluralCase: getPluralCase
};
