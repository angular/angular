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
export const NgLocaleRof: NgLocale = {
  localeId: 'rof',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'kang’ama', pm: 'kingoto'},
        narrow: {am: 'kang’ama', pm: 'kingoto'},
        wide: {am: 'kang’ama', pm: 'kingoto'}
      },
      standalone: {
        abbreviated: {am: 'kang’ama', pm: 'kingoto'},
        narrow: {am: 'kang’ama', pm: 'kingoto'},
        wide: {am: 'kang’ama', pm: 'kingoto'}
      }
    },
    days: {
      format: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
        abbreviated: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
        wide:
            ['Ijumapili', 'Ijumatatu', 'Ijumanne', 'Ijumatano', 'Alhamisi', 'Ijumaa', 'Ijumamosi']
      },
      standalone: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
        abbreviated: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
        wide: [
          'Ijumapili', 'Ijumatatu', 'Ijumanne', 'Ijumatano', 'Alhamisi', 'Ijumaa', 'Ijumamosi'
        ]
      }
    },
    months: {
      format: {
        narrow: ['K', 'K', 'K', 'K', 'T', 'S', 'S', 'N', 'T', 'I', 'I', 'I'],
        abbreviated: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
        wide: [
          'Mweri wa kwanza', 'Mweri wa kaili', 'Mweri wa katatu', 'Mweri wa kaana', 'Mweri wa tanu',
          'Mweri wa sita', 'Mweri wa saba', 'Mweri wa nane', 'Mweri wa tisa', 'Mweri wa ikumi',
          'Mweri wa ikumi na moja', 'Mweri wa ikumi na mbili'
        ]
      },
      standalone: {
        narrow: ['K', 'K', 'K', 'K', 'T', 'S', 'S', 'N', 'T', 'I', 'I', 'I'],
        abbreviated: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
        wide: [
          'Mweri wa kwanza', 'Mweri wa kaili', 'Mweri wa katatu', 'Mweri wa kaana', 'Mweri wa tanu',
          'Mweri wa sita', 'Mweri wa saba', 'Mweri wa nane', 'Mweri wa tisa', 'Mweri wa ikumi',
          'Mweri wa ikumi na moja', 'Mweri wa ikumi na mbili'
        ]
      }
    },
    eras: {
      abbreviated: ['KM', 'BM'],
      narrow: ['KM', 'BM'],
      wide: ['Kabla ya Mayesu', 'Baada ya Mayesu']
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
  currencySettings: {symbol: 'TSh', name: 'heleri sa Tanzania'},
  getPluralCase: getPluralCase
};
