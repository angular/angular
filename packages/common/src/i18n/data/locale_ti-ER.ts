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
  if (n === Math.floor(n) && n >= 0 && n <= 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleTiER: NgLocale = {
  localeId: 'ti-ER',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'},
        narrow: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'},
        wide: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'}
      },
      standalone: {
        abbreviated: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'},
        narrow: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'},
        wide: {am: 'ንጉሆ ሰዓተ', pm: 'ድሕር ሰዓት'}
      }
    },
    days: {
      format: {
        narrow: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
        short: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
        abbreviated: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
        wide: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም']
      },
      standalone: {
        narrow: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
        short: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
        abbreviated: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
        wide: ['ሰንበት', 'ሰኑይ', 'ሰሉስ', 'ረቡዕ', 'ሓሙስ', 'ዓርቢ', 'ቀዳም']
      }
    },
    months: {
      format: {
        narrow: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
        abbreviated: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
        wide: [
          'ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'
        ]
      },
      standalone: {
        narrow: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
        abbreviated: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
        wide: [
          'ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'
        ]
      }
    },
    eras: {abbreviated: ['ዓ/ዓ', 'ዓ/ም'], narrow: ['ዓ/ዓ', 'ዓ/ም'], wide: ['ዓመተ ዓለም', 'ዓመተ ምህረት']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE፣ dd MMMM መዓልቲ y G',
        long: 'dd MMMM y',
        medium: 'dd-MMM-y',
        short: 'dd/MM/yy'
      },
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
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
  currencySettings: {symbol: 'Nfk', name: 'ERN'},
  getPluralCase: getPluralCase
};
