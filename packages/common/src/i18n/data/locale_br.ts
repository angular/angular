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
  if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91)) return Plural.One;
  if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92)) return Plural.Two;
  if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) &&
      !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 ||
        n % 100 >= 90 && n % 100 <= 99))
    return Plural.Few;
  if (!(n === 0) && n % 1e6 === 0) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleBr: NgLocale = {
  localeId: 'br',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'A.M.', pm: 'G.M.'},
        narrow: {am: 'am', pm: 'gm'},
        wide: {am: 'A.M.', pm: 'G.M.'}
      },
      standalone: {
        abbreviated: {am: 'A.M.', pm: 'G.M.'},
        narrow: {am: 'A.M.', pm: 'G.M.'},
        wide: {am: 'A.M.', pm: 'G.M.'}
      }
    },
    days: {
      format: {
        narrow: ['Su', 'L', 'Mz', 'Mc', 'Y', 'G', 'Sa'],
        short: ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.'],
        abbreviated: ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.'],
        wide: ['Sul', 'Lun', 'Meurzh', 'Mercʼher', 'Yaou', 'Gwener', 'Sadorn']
      },
      standalone: {
        narrow: ['Su', 'L', 'Mz', 'Mc', 'Y', 'G', 'Sa'],
        short: ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.'],
        abbreviated: ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.'],
        wide: ['Sul', 'Lun', 'Meurzh', 'Mercʼher', 'Yaou', 'Gwener', 'Sadorn']
      }
    },
    months: {
      format: {
        narrow: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        abbreviated: [
          'Gen.', 'Cʼhwe.', 'Meur.', 'Ebr.', 'Mae', 'Mezh.', 'Goue.', 'Eost', 'Gwen.', 'Here', 'Du',
          'Kzu.'
        ],
        wide: [
          'Genver', 'Cʼhwevrer', 'Meurzh', 'Ebrel', 'Mae', 'Mezheven', 'Gouere', 'Eost', 'Gwengolo',
          'Here', 'Du', 'Kerzu'
        ]
      },
      standalone: {
        narrow: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        abbreviated: [
          'Gen.', 'Cʼhwe.', 'Meur.', 'Ebr.', 'Mae', 'Mezh.', 'Goue.', 'Eost', 'Gwen.', 'Here', 'Du',
          'Ker.'
        ],
        wide: [
          'Genver', 'Cʼhwevrer', 'Meurzh', 'Ebrel', 'Mae', 'Mezheven', 'Gouere', 'Eost', 'Gwengolo',
          'Here', 'Du', 'Kerzu'
        ]
      }
    },
    eras: {
      abbreviated: ['a-raok J.K.', 'goude J.K.'],
      narrow: ['a-raok J.K.', 'goude J.K.'],
      wide: ['a-raok Jezuz-Krist', 'goude Jezuz-Krist']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'da\' {0}', long: '{1} \'da\' {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
