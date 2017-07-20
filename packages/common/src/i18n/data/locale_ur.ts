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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleUr: NgLocale = {
  localeId: 'ur',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'آدھی رات',
          am: 'AM',
          pm: 'PM',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        },
        narrow: {
          midnight: 'آدھی رات',
          am: 'a',
          pm: 'p',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        },
        wide: {
          midnight: 'آدھی رات',
          am: 'AM',
          pm: 'PM',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'آدھی رات',
          am: 'AM',
          pm: 'PM',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        },
        narrow: {
          midnight: 'آدھی رات',
          am: 'AM',
          pm: 'PM',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        },
        wide: {
          midnight: 'آدھی رات',
          am: 'AM',
          pm: 'PM',
          morning1: 'صبح',
          afternoon1: 'دوپہر',
          afternoon2: 'سہ پہر',
          evening1: 'شام',
          night1: 'رات'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        abbreviated: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        wide: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        abbreviated: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        wide: ['اتوار', 'سوموار', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      }
    },
    eras: {
      abbreviated: ['قبل مسیح', 'عیسوی'],
      narrow: ['قبل مسیح', 'عیسوی'],
      wide: ['قبل مسیح', 'عیسوی']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE، d MMMM، y', long: 'd MMMM، y', medium: 'y MMM d', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      afternoon2: {from: '16:00', to: '18:00'},
      evening1: {from: '18:00', to: '20:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '20:00', to: '04:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '‎-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats:
        {currency: '¤ #,##,##0.00', decimal: '#,##0.###', percent: '#,##,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Rs', name: 'پاکستانی روپیہ'},
  getPluralCase: getPluralCase
};
