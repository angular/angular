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
export const NgLocalePa: NgLocale = {
  localeId: 'pa',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਪੂ.ਦੁ.',
          pm: 'ਬਾ.ਦੁ.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮੀਂ',
          night1: 'ਰਾਤੀਂ'
        },
        narrow: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਸ.',
          pm: 'ਸ਼.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮੀਂ',
          night1: 'ਰਾਤੀਂ'
        },
        wide: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਪੂ.ਦੁ.',
          pm: 'ਬਾ.ਦੁ.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮੀਂ',
          night1: 'ਰਾਤੀਂ'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਪੂ.ਦੁ.',
          pm: 'ਬਾ.ਦੁ.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮੀਂ',
          night1: 'ਰਾਤੀਂ'
        },
        narrow: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਪੂ.ਦੁ.',
          pm: 'ਬਾ.ਦੁ.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮੀਂ',
          night1: 'ਰਾਤੀਂ'
        },
        wide: {
          midnight: 'ਅੱਧੀ ਰਾਤ',
          am: 'ਪੂ.ਦੁ.',
          pm: 'ਬਾ.ਦੁ.',
          morning1: 'ਸਵੇਰੇ',
          afternoon1: 'ਦੁਪਹਿਰੇ',
          evening1: 'ਸ਼ਾਮ',
          night1: 'ਰਾਤ'
        }
      }
    },
    days: {
      format: {
        narrow: ['ਐ', 'ਸੋ', 'ਮੰ', 'ਬੁੱ', 'ਵੀ', 'ਸ਼ੁੱ', 'ਸ਼'],
        short: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕ', 'ਸ਼ਨਿੱ'],
        abbreviated: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨਿੱਚਰ'],
        wide: ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨਿੱਚਰਵਾਰ']
      },
      standalone: {
        narrow: ['ਐ', 'ਸੋ', 'ਮੰ', 'ਬੁੱ', 'ਵੀ', 'ਸ਼ੁੱ', 'ਸ਼'],
        short: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕ', 'ਸ਼ਨਿੱ'],
        abbreviated: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨਿੱਚਰ'],
        wide: ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨਿੱਚਰਵਾਰ']
      }
    },
    months: {
      format: {
        narrow: ['ਜ', 'ਫ਼', 'ਮਾ', 'ਅ', 'ਮ', 'ਜੂ', 'ਜੁ', 'ਅ', 'ਸ', 'ਅ', 'ਨ', 'ਦ'],
        abbreviated: ['ਜਨ', 'ਫ਼ਰ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾ', 'ਅਗ', 'ਸਤੰ', 'ਅਕਤੂ', 'ਨਵੰ', 'ਦਸੰ'],
        wide: [
          'ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ',
          'ਦਸੰਬਰ'
        ]
      },
      standalone: {
        narrow: ['ਜ', 'ਫ਼', 'ਮਾ', 'ਅ', 'ਮ', 'ਜੂ', 'ਜੁ', 'ਅ', 'ਸ', 'ਅ', 'ਨ', 'ਦ'],
        abbreviated: ['ਜਨ', 'ਫ਼ਰ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾ', 'ਅਗ', 'ਸਤੰ', 'ਅਕਤੂ', 'ਨਵੰ', 'ਦਸੰ'],
        wide: [
          'ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ',
          'ਦਸੰਬਰ'
        ]
      }
    },
    eras: {abbreviated: ['ਈ. ਪੂ.', 'ਸੰਨ'], narrow: ['ਈ.ਪੂ.', 'ਸੰਨ'], wide: ['ਈਸਵੀ ਪੂਰਵ', 'ਈਸਵੀ ਸੰਨ']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
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
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {
      currency: '¤ #,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '[#E0]'
    }
  },
  currencySettings: {symbol: '₹', name: 'ਭਾਰਤੀ ਰੁਪਇਆ'},
  getPluralCase: getPluralCase
};
