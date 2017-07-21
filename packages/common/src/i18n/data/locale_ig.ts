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
export const NgLocaleIg: NgLocale = {
  localeId: 'ig',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'A.M.', pm: 'P.M.'},
        narrow: {am: 'A.M.', pm: 'P.M.'},
        wide: {am: 'A.M.', pm: 'P.M.'}
      },
      standalone: {
        abbreviated: {am: 'A.M.', pm: 'P.M.'},
        narrow: {am: 'A.M.', pm: 'P.M.'},
        wide: {am: 'A.M.', pm: 'P.M.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat'],
        abbreviated: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat'],
        wide: ['Mbọsị Ụka', 'Mọnde', 'Tiuzdee', 'Wenezdee', 'Tọọzdee', 'Fraịdee', 'Satọdee']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat'],
        abbreviated: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Sat'],
        wide: ['Mbọsị Ụka', 'Mọnde', 'Tiuzdee', 'Wenezdee', 'Tọọzdee', 'Fraịdee', 'Satọdee']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Jen', 'Feb', 'Maa', 'Epr', 'Mee', 'Juu', 'Jul', 'Ọgọ', 'Sep', 'Ọkt', 'Nov', 'Dis'],
        wide: [
          'Jenụwarị', 'Febrụwarị', 'Maachị', 'Eprel', 'Mee', 'Juun', 'Julaị', 'Ọgọọst', 'Septemba',
          'Ọktoba', 'Novemba', 'Disemba'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Jen', 'Feb', 'Maa', 'Epr', 'Mee', 'Juu', 'Jul', 'Ọgọ', 'Sep', 'Ọkt', 'Nov', 'Dis'],
        wide: [
          'Jenụwarị', 'Febrụwarị', 'Maachị', 'Eprel', 'Mee', 'Juun', 'Julaị', 'Ọgọọst', 'Septemba',
          'Ọktoba', 'Novemba', 'Disemba'
        ]
      }
    },
    eras: {
      abbreviated: ['T.K.', 'A.K.'],
      narrow: ['T.K.', 'A.K.'],
      wide: ['Tupu Kristi', 'Afọ Kristi']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
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
  currencySettings: {symbol: '₦', name: 'Naịra'},
  getPluralCase: getPluralCase
};
