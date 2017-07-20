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
export const NgLocaleMfe: NgLocale = {
  localeId: 'mfe',
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
        narrow: ['d', 'l', 'm', 'm', 'z', 'v', 's'],
        short: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
        abbreviated: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
        wide: ['dimans', 'lindi', 'mardi', 'merkredi', 'zedi', 'vandredi', 'samdi']
      },
      standalone: {
        narrow: ['d', 'l', 'm', 'm', 'z', 'v', 's'],
        short: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
        abbreviated: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
        wide: ['dimans', 'lindi', 'mardi', 'merkredi', 'zedi', 'vandredi', 'samdi']
      }
    },
    months: {
      format: {
        narrow: ['z', 'f', 'm', 'a', 'm', 'z', 'z', 'o', 's', 'o', 'n', 'd'],
        abbreviated:
            ['zan', 'fev', 'mar', 'avr', 'me', 'zin', 'zil', 'out', 'sep', 'okt', 'nov', 'des'],
        wide: [
          'zanvie', 'fevriye', 'mars', 'avril', 'me', 'zin', 'zilye', 'out', 'septam', 'oktob',
          'novam', 'desam'
        ]
      },
      standalone: {
        narrow: ['z', 'f', 'm', 'a', 'm', 'z', 'z', 'o', 's', 'o', 'n', 'd'],
        abbreviated:
            ['zan', 'fev', 'mar', 'avr', 'me', 'zin', 'zil', 'out', 'sep', 'okt', 'nov', 'des'],
        wide: [
          'zanvie', 'fevriye', 'mars', 'avril', 'me', 'zin', 'zilye', 'out', 'septam', 'oktob',
          'novam', 'desam'
        ]
      }
    },
    eras: {
      abbreviated: ['av. Z-K', 'ap. Z-K'],
      narrow: ['av. Z-K', 'ap. Z-K'],
      wide: ['avan Zezi-Krist', 'apre Zezi-Krist']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM, y', short: 'd/M/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Rs', name: 'roupi morisien'},
  getPluralCase: getPluralCase
};
