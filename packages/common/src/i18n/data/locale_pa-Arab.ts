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
export const NgLocalePaArab: NgLocale = {
  localeId: 'pa-Arab',
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
        short: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        abbreviated: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        wide: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        abbreviated: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
        wide: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ],
        wide: [
          'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر',
          'نومبر', 'دسمبر'
        ]
      }
    },
    eras: {abbreviated: ['ايساپورو', 'سں'], narrow: ['ايساپورو', 'سں'], wide: ['ايساپورو', 'سں']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
      plusSign: '‎+',
      minusSign: '‎-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'ر', name: 'روپئیہ'},
  getPluralCase: getPluralCase
};
