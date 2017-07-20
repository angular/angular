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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleAm: NgLocale = {
  localeId: 'am',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጥዋት',
          noon: 'ቀትር',
          pm: 'ከሰዓት',
          morning1: 'ጥዋት1',
          afternoon1: 'ከሰዓት1',
          evening1: 'ማታ1',
          night1: 'ሌሊት1'
        },
        narrow: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጠ',
          noon: 'ቀ',
          pm: 'ከ',
          morning1: 'ጥዋት1',
          afternoon1: 'ከሰዓት1',
          evening1: 'ማታ1',
          night1: 'ሌሊት1'
        },
        wide: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጥዋት',
          noon: 'ቀትር',
          pm: 'ከሰዓት',
          morning1: 'ጥዋት1',
          afternoon1: 'ከሰዓት1',
          evening1: 'ማታ1',
          night1: 'ሌሊት1'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጥዋት',
          noon: 'ቀትር',
          pm: 'ከሰዓት',
          morning1: 'ጥዋት1',
          afternoon1: 'ከሰዓት በኋላ',
          evening1: 'ማታ',
          night1: 'ሌሊት'
        },
        narrow: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጠ',
          noon: 'ቀትር',
          pm: 'ከ',
          morning1: 'ጥዋት',
          afternoon1: 'ከሰዓት በኋላ',
          evening1: 'ማታ',
          night1: 'ሌሊት'
        },
        wide: {
          midnight: 'እኩለ ሌሊት',
          am: 'ጥዋት',
          noon: 'ቀትር',
          pm: 'ከሰዓት',
          morning1: 'ጥዋት1',
          afternoon1: 'ከሰዓት በኋላ',
          evening1: 'ማታ',
          night1: 'ሌሊት'
        }
      }
    },
    days: {
      format: {
        narrow: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
        short: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
        abbreviated: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
        wide: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
      },
      standalone: {
        narrow: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
        short: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
        abbreviated: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
        wide: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
      }
    },
    months: {
      format: {
        narrow: ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ', 'ኦ', 'ሴ', 'ኦ', 'ኖ', 'ዲ'],
        abbreviated:
            ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም'],
        wide: [
          'ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር',
          'ዲሴምበር'
        ]
      },
      standalone: {
        narrow: ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ', 'ኦ', 'ሴ', 'ኦ', 'ኖ', 'ዲ'],
        abbreviated:
            ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም'],
        wide: [
          'ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር',
          'ዲሴምበር'
        ]
      }
    },
    eras: {abbreviated: ['ዓ/ዓ', 'ዓ/ም'], narrow: ['ዓ/ዓ', 'ዓ/ም'], wide: ['ዓመተ ዓለም', 'ዓመተ ምሕረት']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE ፣d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'},
      noon: '12:00'
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
  currencySettings: {symbol: 'ብር', name: 'የኢትዮጵያ ብር'},
  getPluralCase: getPluralCase
};
