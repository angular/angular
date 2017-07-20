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
export const NgLocaleMua: NgLocale = {
  localeId: 'mua',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'comme', pm: 'lilli'},
        narrow: {am: 'comme', pm: 'lilli'},
        wide: {am: 'comme', pm: 'lilli'}
      },
      standalone: {
        abbreviated: {am: 'comme', pm: 'lilli'},
        narrow: {am: 'comme', pm: 'lilli'},
        wide: {am: 'comme', pm: 'lilli'}
      }
    },
    days: {
      format: {
        narrow: ['Y', 'L', 'Z', 'O', 'A', 'G', 'E'],
        short: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
        abbreviated: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
        wide: [
          'Com’yakke', 'Comlaaɗii', 'Comzyiiɗii', 'Comkolle', 'Comkaldǝɓlii', 'Comgaisuu',
          'Comzyeɓsuu'
        ]
      },
      standalone: {
        narrow: ['Y', 'L', 'Z', 'O', 'A', 'G', 'E'],
        short: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
        abbreviated: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
        wide: [
          'Com’yakke', 'Comlaaɗii', 'Comzyiiɗii', 'Comkolle', 'Comkaldǝɓlii', 'Comgaisuu',
          'Comzyeɓsuu'
        ]
      }
    },
    months: {
      format: {
        narrow: ['O', 'A', 'I', 'F', 'D', 'B', 'L', 'M', 'E', 'U', 'W', 'Y'],
        abbreviated:
            ['FLO', 'CLA', 'CKI', 'FMF', 'MAD', 'MBI', 'MLI', 'MAM', 'FDE', 'FMU', 'FGW', 'FYU'],
        wide: [
          'Fĩi Loo', 'Cokcwaklaŋne', 'Cokcwaklii', 'Fĩi Marfoo', 'Madǝǝuutǝbijaŋ',
          'Mamǝŋgwãafahbii', 'Mamǝŋgwãalii', 'Madǝmbii', 'Fĩi Dǝɓlii', 'Fĩi Mundaŋ', 'Fĩi Gwahlle',
          'Fĩi Yuru'
        ]
      },
      standalone: {
        narrow: ['O', 'A', 'I', 'F', 'D', 'B', 'L', 'M', 'E', 'U', 'W', 'Y'],
        abbreviated:
            ['FLO', 'CLA', 'CKI', 'FMF', 'MAD', 'MBI', 'MLI', 'MAM', 'FDE', 'FMU', 'FGW', 'FYU'],
        wide: [
          'Fĩi Loo', 'Cokcwaklaŋne', 'Cokcwaklii', 'Fĩi Marfoo', 'Madǝǝuutǝbijaŋ',
          'Mamǝŋgwãafahbii', 'Mamǝŋgwãalii', 'Madǝmbii', 'Fĩi Dǝɓlii', 'Fĩi Mundaŋ', 'Fĩi Gwahlle',
          'Fĩi Yuru'
        ]
      }
    },
    eras: {abbreviated: ['KK', 'PK'], narrow: ['KK', 'PK'], wide: ['KǝPel Kristu', 'Pel Kristu']}
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'solai BEAC'},
  getPluralCase: getPluralCase
};
