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
export const NgLocaleUzArab: NgLocale = {
  localeId: 'uz-Arab',
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
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
        abbreviated: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
        abbreviated: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
        wide: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
        wide: [
          'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
        wide: [
          'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [4, 5],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '11:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '11:00'},
      night1: {from: '22:00', to: '06:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '‎−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '؋', name: 'افغانی'},
  getPluralCase: getPluralCase
};
