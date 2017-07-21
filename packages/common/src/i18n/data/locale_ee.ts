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
export const NgLocaleEe: NgLocale = {
  localeId: 'ee',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'ŋdi',
          pm: 'ɣetrɔ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        },
        narrow: {
          am: 'ŋ',
          pm: 'ɣ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        },
        wide: {
          am: 'ŋdi',
          pm: 'ɣetrɔ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        }
      },
      standalone: {
        abbreviated: {
          am: 'ŋdi',
          pm: 'ɣetrɔ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        },
        narrow: {
          am: 'ŋ',
          pm: 'ɣ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        },
        wide: {
          am: 'ŋdi',
          pm: 'ɣetrɔ',
          morning1: 'fɔŋli',
          morning2: 'ŋdi',
          afternoon1: 'ŋdɔ',
          afternoon2: 'ɣetrɔ',
          evening1: 'fiẽ',
          night1: 'zã'
        }
      }
    },
    days: {
      format: {
        narrow: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
        short: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
        abbreviated: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
        wide: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa']
      },
      standalone: {
        narrow: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
        short: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
        abbreviated: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
        wide: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa']
      }
    },
    months: {
      format: {
        narrow: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
        abbreviated:
            ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
        wide: [
          'dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ',
          'kele', 'adeɛmekpɔxe', 'dzome'
        ]
      },
      standalone: {
        narrow: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
        abbreviated:
            ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
        wide: [
          'dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ',
          'kele', 'adeɛmekpɔxe', 'dzome'
        ]
      }
    },
    eras: {
      abbreviated: ['hY', 'Yŋ'],
      narrow: ['hY', 'Yŋ'],
      wide: ['Hafi Yesu Va Do ŋgɔ', 'Yesu Ŋɔli']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, MMMM d \'lia\' y',
        long: 'MMMM d \'lia\' y',
        medium: 'MMM d \'lia\', y',
        short: 'M/d/yy'
      },
      time: {
        full: 'a \'ga\' h:mm:ss zzzz',
        long: 'a \'ga\' h:mm:ss z',
        medium: 'a \'ga\' h:mm:ss',
        short: 'a \'ga\' h:mm'
      },
      dateTime: {full: '{0} {1}', long: '{0} {1}', medium: '{0} {1}', short: '{0} {1}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      afternoon2: {from: '14:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      morning1: {from: '04:00', to: '05:00'},
      morning2: {from: '05:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'}
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
      nan: 'mnn',
      timeSeparator: ':'
    },
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'GH₵', name: 'ghana siɖi'},
  getPluralCase: getPluralCase
};
