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
  if (n === 0) return Plural.Zero;
  if (n === 1) return Plural.One;
  if (n === 2) return Plural.Two;
  if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return Plural.Few;
  if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleArAE: NgLocale = {
  localeId: 'ar-AE',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'ص',
          pm: 'م',
          morning1: 'فجرا',
          morning2: 'ص',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ل'
        },
        narrow: {
          am: 'ص',
          pm: 'م',
          morning1: 'فجرًا',
          morning2: 'صباحًا',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ليلاً'
        },
        wide: {
          am: 'ص',
          pm: 'م',
          morning1: 'فجرًا',
          morning2: 'صباحًا',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ليلاً'
        }
      },
      standalone: {
        abbreviated: {
          am: 'ص',
          pm: 'م',
          morning1: 'فجرا',
          morning2: 'ص',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ليلاً'
        },
        narrow: {
          am: 'ص',
          pm: 'م',
          morning1: 'فجرا',
          morning2: 'صباحًا',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ليلاً'
        },
        wide: {
          am: 'صباحًا',
          pm: 'مساءً',
          morning1: 'فجرًا',
          morning2: 'صباحًا',
          afternoon1: 'ظهرًا',
          afternoon2: 'بعد الظهر',
          evening1: 'مساءً',
          night1: 'منتصف الليل',
          night2: 'ليلاً'
        }
      }
    },
    days: {
      format: {
        narrow: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
        short: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        abbreviated: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        wide: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      },
      standalone: {
        narrow: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
        short: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        abbreviated: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        wide: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      }
    },
    months: {
      format: {
        narrow: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
        abbreviated: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يون��و', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
          'نوفمبر', 'ديسمبر'
        ],
        wide: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
          'نوفمبر', 'ديسمبر'
        ]
      },
      standalone: {
        narrow: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
        abbreviated: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
          'نوفمبر', 'ديسمبر'
        ],
        wide: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
          'نوفمبر', 'ديسمبر'
        ]
      }
    },
    eras: {abbreviated: ['ق.م', 'م'], narrow: ['ق.م', 'م'], wide: ['قبل الميلاد', 'ميلادي']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 6],
    formats: {
      date: {
        full: 'EEEE، d MMMM، y',
        long: 'd MMMM، y',
        medium: 'dd‏/MM‏/y',
        short: 'd‏/M‏/y'
      },
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '13:00'},
      afternoon2: {from: '13:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      morning1: {from: '03:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '01:00'},
      night2: {from: '01:00', to: '03:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '‎%‎',
      plusSign: '‎+',
      minusSign: '‎-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'ليس رقمًا',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'د.إ.‏', name: 'درهم إماراتي'},
  getPluralCase: getPluralCase
};
