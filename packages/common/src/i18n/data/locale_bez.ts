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
export const NgLocaleBez: NgLocale = {
  localeId: 'bez',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'pamilau', pm: 'pamunyi'},
        narrow: {am: 'pamilau', pm: 'pamunyi'},
        wide: {am: 'pamilau', pm: 'pamunyi'}
      },
      standalone: {
        abbreviated: {am: 'pamilau', pm: 'pamunyi'},
        narrow: {am: 'pamilau', pm: 'pamunyi'},
        wide: {am: 'pamilau', pm: 'pamunyi'}
      }
    },
    days: {
      format: {
        narrow: ['M', 'J', 'H', 'H', 'H', 'W', 'J'],
        short: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
        abbreviated: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
        wide: [
          'pa mulungu', 'pa shahuviluha', 'pa hivili', 'pa hidatu', 'pa hitayi', 'pa hihanu',
          'pa shahulembela'
        ]
      },
      standalone: {
        narrow: ['M', 'J', 'H', 'H', 'H', 'W', 'J'],
        short: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
        abbreviated: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
        wide: [
          'pa mulungu', 'pa shahuviluha', 'pa hivili', 'pa hidatu', 'pa hitayi', 'pa hihanu',
          'pa shahulembela'
        ]
      }
    },
    months: {
      format: {
        narrow: ['H', 'V', 'D', 'T', 'H', 'S', 'S', 'N', 'T', 'K', 'K', 'K'],
        abbreviated:
            ['Hut', 'Vil', 'Dat', 'Tai', 'Han', 'Sit', 'Sab', 'Nan', 'Tis', 'Kum', 'Kmj', 'Kmb'],
        wide: [
          'pa mwedzi gwa hutala', 'pa mwedzi gwa wuvili', 'pa mwedzi gwa wudatu',
          'pa mwedzi gwa wutai', 'pa mwedzi gwa wuhanu', 'pa mwedzi gwa sita', 'pa mwedzi gwa saba',
          'pa mwedzi gwa nane', 'pa mwedzi gwa tisa', 'pa mwedzi gwa kumi',
          'pa mwedzi gwa kumi na moja', 'pa mwedzi gwa kumi na mbili'
        ]
      },
      standalone: {
        narrow: ['H', 'V', 'D', 'T', 'H', 'S', 'S', 'N', 'T', 'K', 'K', 'K'],
        abbreviated:
            ['Hut', 'Vil', 'Dat', 'Tai', 'Han', 'Sit', 'Sab', 'Nan', 'Tis', 'Kum', 'Kmj', 'Kmb'],
        wide: [
          'pa mwedzi gwa hutala', 'pa mwedzi gwa wuvili', 'pa mwedzi gwa wudatu',
          'pa mwedzi gwa wutai', 'pa mwedzi gwa wuhanu', 'pa mwedzi gwa sita', 'pa mwedzi gwa saba',
          'pa mwedzi gwa nane', 'pa mwedzi gwa tisa', 'pa mwedzi gwa kumi',
          'pa mwedzi gwa kumi na moja', 'pa mwedzi gwa kumi na mbili'
        ]
      }
    },
    eras: {
      abbreviated: ['KM', 'BM'],
      narrow: ['KM', 'BM'],
      wide: ['Kabla ya Mtwaa', 'Baada ya Mtwaa']
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
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'TSh', name: 'Shilingi ya Hutanzania'},
  getPluralCase: getPluralCase
};
