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
  let i = Math.floor(Math.abs(n)), f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (n === 0 || n === 1 || i === 0 && f === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSi: NgLocale = {
  localeId: 'si',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'මැදියම',
          am: 'පෙ.ව.',
          noon: 'මධ්‍යාහ්නය',
          pm: 'ප.ව.',
          morning1: 'පාන්දර',
          morning2: 'උදේ',
          afternoon1: 'දවල්',
          evening1: 'හවස',
          night1: 'රෑ',
          night2: 'මැදියමට පසු'
        },
        narrow: {
          midnight: 'මැ',
          am: 'පෙ',
          noon: 'ම',
          pm: 'ප',
          morning1: 'පා',
          morning2: 'උ',
          afternoon1: 'ද',
          evening1: 'හ',
          night1: 'රෑ',
          night2: 'මැ'
        },
        wide: {
          midnight: 'මැදියම',
          am: 'පෙ.ව.',
          noon: 'මධ්‍යාහ්නය',
          pm: 'ප.ව.',
          morning1: 'පාන්දර',
          morning2: 'උදේ',
          afternoon1: 'දවල්',
          evening1: 'හවස',
          night1: 'රෑ',
          night2: 'මැදියමට පසු'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'මැදියම',
          am: 'පෙ.ව.',
          noon: 'මධ්‍යාහ්නය',
          pm: 'ප.ව.',
          morning1: 'පාන්දර',
          morning2: 'උදේ',
          afternoon1: 'දවල්',
          evening1: 'හවස',
          night1: 'රෑ',
          night2: 'මැදියමට පසු'
        },
        narrow: {
          midnight: 'මැදියම',
          am: 'පෙ.ව.',
          noon: 'මධ්‍යාහ්නය',
          pm: 'ප.ව.',
          morning1: 'පාන්දර',
          morning2: 'උදේ',
          afternoon1: 'දවල්',
          evening1: 'හවස',
          night1: 'රෑ',
          night2: 'මැදියමට පසු'
        },
        wide: {
          midnight: 'මැදියම',
          am: 'පෙ.ව.',
          noon: 'මධ්‍යාහ්නය',
          pm: 'ප.ව.',
          morning1: 'පාන්දර',
          morning2: 'උදේ',
          afternoon1: 'දවල්',
          evening1: 'හවස',
          night1: 'රෑ',
          night2: 'මැදියමට පසු'
        }
      }
    },
    days: {
      format: {
        narrow: ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'],
        short: ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'],
        abbreviated: ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'],
        wide: [
          'ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා',
          'සිකුරාදා', 'සෙනසුරාදා'
        ]
      },
      standalone: {
        narrow: ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'],
        short: ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'],
        abbreviated: ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'],
        wide: [
          'ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා',
          'සිකුරාදා', 'සෙනසුරාදා'
        ]
      }
    },
    months: {
      format: {
        narrow: ['ජ', 'පෙ', 'මා', 'අ', 'මැ', 'ජූ', 'ජූ', 'අ', 'සැ', 'ඔ', 'නෙ', 'දෙ'],
        abbreviated: [
          'ජන', 'පෙබ', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්',
          'නොවැ', 'දෙසැ'
        ],
        wide: [
          'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු',
          'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'
        ]
      },
      standalone: {
        narrow: ['ජ', 'පෙ', 'මා', 'අ', 'මැ', 'ජූ', 'ජූ', 'අ', 'සැ', 'ඔ', 'නෙ', 'දෙ'],
        abbreviated: [
          'ජන', 'පෙබ', 'මාර්', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්',
          'නොවැ', 'දෙසැ'
        ],
        wide: [
          'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු',
          'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'
        ]
      }
    },
    eras: {
      abbreviated: ['ක්‍රි.පූ.', 'ක්‍රි.ව.'],
      narrow: ['ක්‍රි.පූ.', 'ක්‍රි.ව.'],
      wide: [
        'ක්‍රිස්තු පූර්ව', 'ක්‍රිස්තු වර්ෂ'
      ]
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
      time: {full: 'HH.mm.ss zzzz', long: 'HH.mm.ss z', medium: 'HH.mm.ss', short: 'HH.mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      evening1: {from: '14:00', to: '18:00'},
      midnight: '00:00',
      morning1: {from: '01:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '18:00', to: '24:00'},
      night2: {from: '00:00', to: '01:00'},
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
      timeSeparator: '.'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#'}
  },
  currencySettings: {symbol: 'රු.', name: 'ශ්‍රී ලංකා රුපියල'},
  getPluralCase: getPluralCase
};
