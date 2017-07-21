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
export const NgLocaleKoKP: NgLocale = {
  localeId: 'ko-KP',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: '자정',
          am: 'AM',
          noon: '정오',
          pm: 'PM',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        },
        narrow: {
          midnight: '자정',
          am: 'AM',
          noon: '정오',
          pm: 'PM',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        },
        wide: {
          midnight: '자정',
          am: '오전',
          noon: '정오',
          pm: '오후',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        }
      },
      standalone: {
        abbreviated: {
          midnight: '자정',
          am: 'AM',
          noon: '정오',
          pm: 'PM',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        },
        narrow: {
          midnight: '자정',
          am: 'AM',
          noon: '정오',
          pm: 'PM',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        },
        wide: {
          midnight: '자정',
          am: '오전',
          noon: '정오',
          pm: '오후',
          morning1: '새벽',
          morning2: '오전',
          afternoon1: '오후',
          evening1: '저녁',
          night1: '밤'
        }
      }
    },
    days: {
      format: {
        narrow: ['일', '월', '화', '수', '목', '금', '토'],
        short: ['일', '월', '화', '수', '목', '금', '토'],
        abbreviated: ['일', '월', '화', '수', '목', '금', '토'],
        wide: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      },
      standalone: {
        narrow: ['일', '월', '화', '수', '목', '금', '토'],
        short: ['일', '월', '화', '수', '목', '금', '토'],
        abbreviated: ['일', '월', '화', '수', '목', '금', '토'],
        wide: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      }
    },
    months: {
      format: {
        narrow:
            ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        abbreviated:
            ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        wide: [
          '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'
        ]
      },
      standalone: {
        narrow:
            ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        abbreviated:
            ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        wide: [
          '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['BC', 'AD'], wide: ['기원전', '서기']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y년 M월 d일 EEEE', long: 'y년 M월 d일', medium: 'y. M. d.', short: 'yy. M. d.'},
      time: {
        full: 'a h시 m분 s초 zzzz',
        long: 'a h시 m분 s초 z',
        medium: 'a h:mm:ss',
        short: 'a h:mm'
      },
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '03:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '03:00'},
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
  currencySettings: {symbol: 'KPW', name: '조선 민주주의 인민 공화국 원'},
  getPluralCase: getPluralCase
};
