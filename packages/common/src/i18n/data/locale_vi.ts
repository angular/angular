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
export const NgLocaleVi: NgLocale = {
  localeId: 'vi',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'nửa đêm',
          am: 'SA',
          noon: 'TR',
          pm: 'CH',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        },
        narrow: {
          midnight: 'nửa đêm',
          am: 's',
          noon: 'tr',
          pm: 'c',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        },
        wide: {
          midnight: 'nửa đêm',
          am: 'SA',
          noon: 'TR',
          pm: 'CH',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'nửa đêm',
          am: 'SA',
          noon: 'TR',
          pm: 'CH',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        },
        narrow: {
          midnight: 'nửa đêm',
          am: 'SA',
          noon: 'trưa',
          pm: 'CH',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        },
        wide: {
          midnight: 'nửa đêm',
          am: 'SA',
          noon: 'trưa',
          pm: 'CH',
          morning1: 'sáng',
          afternoon1: 'chiều',
          evening1: 'tối',
          night1: 'đêm'
        }
      }
    },
    days: {
      format: {
        narrow: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        short: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        abbreviated: ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'],
        wide: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
      },
      standalone: {
        narrow: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        short: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        abbreviated: ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'],
        wide: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'thg 1', 'thg 2', 'thg 3', 'thg 4', 'thg 5', 'thg 6', 'thg 7', 'thg 8', 'thg 9', 'thg 10',
          'thg 11', 'thg 12'
        ],
        wide: [
          'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8',
          'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10',
          'Thg 11', 'Thg 12'
        ],
        wide: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
          'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ]
      }
    },
    eras: {
      abbreviated: ['Trước CN', 'sau CN'],
      narrow: ['tr. CN', 'sau CN'],
      wide: ['Trước CN', 'sau CN']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{0} {1}', long: '{0} {1}', medium: '{0}, {1}', short: '{0}, {1}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₫', name: 'Đồng Việt Nam'},
  getPluralCase: getPluralCase
};
