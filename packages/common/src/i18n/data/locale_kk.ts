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
export const NgLocaleKk: NgLocale = {
  localeId: 'kk',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'түн жарымы',
          am: 'AM',
          noon: 'түскі',
          pm: 'PM',
          morning1: 'таңғы',
          afternoon1: 'түстен кейінгі',
          evening1: 'кешкі',
          night1: 'түнгі'
        },
        narrow: {
          midnight: 'түнгі',
          am: 'AM',
          noon: 'түскі',
          pm: 'PM',
          morning1: 'таңғы',
          afternoon1: 'түстен кейінгі',
          evening1: 'кешкі',
          night1: 'түнгі'
        },
        wide: {
          midnight: 'түн жарымы',
          am: 'AM',
          noon: 'түскі',
          pm: 'PM',
          morning1: 'таңғы',
          afternoon1: 'түстен кейінгі',
          evening1: 'кешкі',
          night1: 'түнгі'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'түн жарымы',
          am: 'AM',
          noon: 'талтүс',
          pm: 'PM',
          morning1: 'таң',
          afternoon1: 'түстен кейін',
          evening1: 'кеш',
          night1: 'түн'
        },
        narrow: {
          midnight: 'түн жарымы',
          am: 'AM',
          noon: 'талтүс',
          pm: 'PM',
          morning1: 'таң',
          afternoon1: 'түстен кейін',
          evening1: 'кеш',
          night1: 'түн'
        },
        wide: {
          midnight: 'түн жарымы',
          am: 'AM',
          noon: 'талтүс',
          pm: 'PM',
          morning1: 'таң',
          afternoon1: 'түстен кейін',
          evening1: 'кеш',
          night1: 'түн'
        }
      }
    },
    days: {
      format: {
        narrow: ['Ж', 'Д', 'С', 'С', 'Б', 'Ж', 'С'],
        short: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
        abbreviated: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
        wide: ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі']
      },
      standalone: {
        narrow: ['Ж', 'Д', 'С', 'С', 'Б', 'Ж', 'С'],
        short: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
        abbreviated: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
        wide: ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі']
      }
    },
    months: {
      format: {
        narrow: ['Қ', 'А', 'Н', 'С', 'М', 'М', 'Ш', 'Т', 'Қ', 'Қ', 'Қ', 'Ж'],
        abbreviated: [
          'қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.',
          'жел.'
        ],
        wide: [
          'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек',
          'қазан', 'қараша', 'желтоқсан'
        ]
      },
      standalone: {
        narrow: ['Қ', 'А', 'Н', 'С', 'М', 'М', 'Ш', 'Т', 'Қ', 'Қ', 'Қ', 'Ж'],
        abbreviated: [
          'Қаң.', 'Ақп.', 'Нау.', 'Сәу.', 'Мам.', 'Мау.', 'Шіл.', 'Там.', 'Қыр.', 'Қаз.', 'Қар.',
          'Жел.'
        ],
        wide: [
          'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек',
          'Қазан', 'Қараша', 'Желтоқсан'
        ]
      }
    },
    eras: {
      abbreviated: ['б.з.д.', 'б.з.'],
      narrow: ['б.з.д.', 'б.з.'],
      wide: ['Біздің заманымызға дейін', 'Біздің заманымыз']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y \'ж\'. d MMMM, EEEE',
        long: 'y \'ж\'. d MMMM',
        medium: 'y \'ж\'. dd MMM',
        short: 'dd.MM.yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'сан емес',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₸', name: 'Қазақстан теңгесі'},
  getPluralCase: getPluralCase
};
