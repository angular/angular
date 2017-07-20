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
export const NgLocaleMgh: NgLocale = {
  localeId: 'mgh',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'wichishu', pm: 'mchochil’l'},
        narrow: {am: 'wichishu', pm: 'mchochil’l'},
        wide: {am: 'wichishu', pm: 'mchochil’l'}
      },
      standalone: {
        abbreviated: {am: 'wichishu', pm: 'mchochil’l'},
        narrow: {am: 'wichishu', pm: 'mchochil’l'},
        wide: {am: 'wichishu', pm: 'mchochil’l'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
        abbreviated: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
        wide: ['Sabato', 'Jumatatu', 'Jumanne', 'Jumatano', 'Arahamisi', 'Ijumaa', 'Jumamosi']
      },
      standalone: {
        narrow: ['S', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
        abbreviated: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
        wide: ['Sabato', 'Jumatatu', 'Jumanne', 'Jumatano', 'Arahamisi', 'Ijumaa', 'Jumamosi']
      }
    },
    months: {
      format: {
        narrow: ['K', 'U', 'R', 'C', 'T', 'M', 'S', 'N', 'T', 'K', 'M', 'Y'],
        abbreviated:
            ['Kwa', 'Una', 'Rar', 'Che', 'Tha', 'Moc', 'Sab', 'Nan', 'Tis', 'Kum', 'Moj', 'Yel'],
        wide: [
          'Mweri wo kwanza', 'Mweri wo unayeli', 'Mweri wo uneraru', 'Mweri wo unecheshe',
          'Mweri wo unethanu', 'Mweri wo thanu na mocha', 'Mweri wo saba', 'Mweri wo nane',
          'Mweri wo tisa', 'Mweri wo kumi', 'Mweri wo kumi na moja', 'Mweri wo kumi na yel’li'
        ]
      },
      standalone: {
        narrow: ['K', 'U', 'R', 'C', 'T', 'M', 'S', 'N', 'T', 'K', 'M', 'Y'],
        abbreviated:
            ['Kwa', 'Una', 'Rar', 'Che', 'Tha', 'Moc', 'Sab', 'Nan', 'Tis', 'Kum', 'Moj', 'Yel'],
        wide: [
          'Mweri wo kwanza', 'Mweri wo unayeli', 'Mweri wo uneraru', 'Mweri wo unecheshe',
          'Mweri wo unethanu', 'Mweri wo thanu na mocha', 'Mweri wo saba', 'Mweri wo nane',
          'Mweri wo tisa', 'Mweri wo kumi', 'Mweri wo kumi na moja', 'Mweri wo kumi na yel’li'
        ]
      }
    },
    eras: {abbreviated: ['HY', 'YY'], narrow: ['HY', 'YY'], wide: ['Hinapiya yesu', 'Yopia yesu']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'MTn', name: 'MZN'},
  getPluralCase: getPluralCase
};
