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
export const NgLocaleFa: NgLocale = {
  localeId: 'fa',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'نیمه‌شب',
          am: 'ق.ظ.',
          noon: 'ظهر',
          pm: 'ب.ظ.',
          morning1: 'صبح',
          afternoon1: 'ب.ظ.',
          evening1: 'عصر',
          night1: 'شب'
        },
        narrow: {
          midnight: 'ن',
          am: 'ق',
          noon: 'ظ',
          pm: 'ب',
          morning1: 'ص',
          afternoon1: 'ب.ظ.',
          evening1: 'ع',
          night1: 'ش'
        },
        wide: {
          midnight: 'نیمه‌شب',
          am: 'قبل‌ازظهر',
          noon: 'ظهر',
          pm: 'بعدازظهر',
          morning1: 'صبح',
          afternoon1: 'عصر',
          evening1: 'عصر',
          night1: 'شب'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'نیمه‌شب',
          am: 'ق.ظ.',
          noon: 'ظ',
          pm: 'ب.ظ.',
          morning1: 'صبح',
          afternoon1: 'ب.ظ.',
          evening1: 'عصر',
          night1: 'شب'
        },
        narrow: {
          midnight: 'ن',
          am: 'ق.ظ.',
          noon: 'ظ',
          pm: 'ب.ظ.',
          morning1: 'ص',
          afternoon1: 'ب.ظ.',
          evening1: 'ع',
          night1: 'ش'
        },
        wide: {
          midnight: 'نیمه‌شب',
          am: 'قبل‌ازظهر',
          noon: 'ظهر',
          pm: 'بعدازظهر',
          morning1: 'صبح',
          afternoon1: 'بعدازظهر',
          evening1: 'عصر',
          night1: 'شب'
        }
      }
    },
    days: {
      format: {
        narrow: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        short: ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش'],
        abbreviated: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      },
      standalone: {
        narrow: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        short: ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش'],
        abbreviated: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      }
    },
    months: {
      format: {
        narrow: ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
        abbreviated: [
          'ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ', 'ژوئن', 'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر',
          'نوامبر', 'دسامبر'
        ],
        wide: [
          'ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ', 'ژوئن', 'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر',
          'نوامبر', 'دسامبر'
        ]
      },
      standalone: {
        narrow: ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
        abbreviated: [
          'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر',
          'نوامبر', 'دسامبر'
        ],
        wide: [
          'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر',
          'نوامبر', 'دسامبر'
        ]
      }
    },
    eras: {abbreviated: ['ق.م.', 'م.'], narrow: ['ق', 'م'], wide: ['قبل از میلاد', 'میلادی']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 5],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'y/M/d'},
      time: {full: 'H:mm:ss (zzzz)', long: 'H:mm:ss (z)', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {
        full: '{1}، ساعت {0}',
        long: '{1}، ساعت {0}',
        medium: '{1}،‏ {0}',
        short: '{1}،‏ {0}'
      }
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '17:00'},
      evening1: {from: '17:00', to: '19:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '19:00', to: '04:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '‎−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'ناعدد',
      timeSeparator: ':'
    },
    formats:
        {currency: '‎¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'ریال', name: 'ریال ایران'},
  getPluralCase: getPluralCase
};
