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
export const NgLocaleDav: NgLocale = {
  localeId: 'dav',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Luma lwa K', pm: 'luma lwa p'},
        narrow: {am: 'Luma lwa K', pm: 'luma lwa p'},
        wide: {am: 'Luma lwa K', pm: 'luma lwa p'}
      },
      standalone: {
        abbreviated: {am: 'Luma lwa K', pm: 'luma lwa p'},
        narrow: {am: 'Luma lwa K', pm: 'luma lwa p'},
        wide: {am: 'Luma lwa K', pm: 'luma lwa p'}
      }
    },
    days: {
      format: {
        narrow: ['J', 'J', 'K', 'K', 'K', 'K', 'N'],
        short: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
        abbreviated: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
        wide: [
          'Ituku ja jumwa', 'Kuramuka jimweri', 'Kuramuka kawi', 'Kuramuka kadadu', 'Kuramuka kana',
          'Kuramuka kasanu', 'Kifula nguwo'
        ]
      },
      standalone: {
        narrow: ['J', 'J', 'K', 'K', 'K', 'K', 'N'],
        short: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
        abbreviated: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
        wide: [
          'Ituku ja jumwa', 'Kuramuka jimweri', 'Kuramuka kawi', 'Kuramuka kadadu', 'Kuramuka kana',
          'Kuramuka kasanu', 'Kifula nguwo'
        ]
      }
    },
    months: {
      format: {
        narrow: ['I', 'K', 'K', 'K', 'K', 'K', 'M', 'W', 'I', 'I', 'I', 'I'],
        abbreviated:
            ['Imb', 'Kaw', 'Kad', 'Kan', 'Kas', 'Kar', 'Mfu', 'Wun', 'Ike', 'Iku', 'Imw', 'Iwi'],
        wide: [
          'Mori ghwa imbiri', 'Mori ghwa kawi', 'Mori ghwa kadadu', 'Mori ghwa kana',
          'Mori ghwa kasanu', 'Mori ghwa karandadu', 'Mori ghwa mfungade', 'Mori ghwa wunyanya',
          'Mori ghwa ikenda', 'Mori ghwa ikumi', 'Mori ghwa ikumi na imweri',
          'Mori ghwa ikumi na iwi'
        ]
      },
      standalone: {
        narrow: ['I', 'K', 'K', 'K', 'K', 'K', 'M', 'W', 'I', 'I', 'I', 'I'],
        abbreviated:
            ['Imb', 'Kaw', 'Kad', 'Kan', 'Kas', 'Kar', 'Mfu', 'Wun', 'Ike', 'Iku', 'Imw', 'Iwi'],
        wide: [
          'Mori ghwa imbiri', 'Mori ghwa kawi', 'Mori ghwa kadadu', 'Mori ghwa kana',
          'Mori ghwa kasanu', 'Mori ghwa karandadu', 'Mori ghwa mfungade', 'Mori ghwa wunyanya',
          'Mori ghwa ikenda', 'Mori ghwa ikumi', 'Mori ghwa ikumi na imweri',
          'Mori ghwa ikumi na iwi'
        ]
      }
    },
    eras: {
      abbreviated: ['KK', 'BK'],
      narrow: ['KK', 'BK'],
      wide: ['Kabla ya Kristo', 'Baada ya Kristo']
    }
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
  currencySettings: {symbol: 'Ksh', name: 'Shilingi ya Kenya'},
  getPluralCase: getPluralCase
};
