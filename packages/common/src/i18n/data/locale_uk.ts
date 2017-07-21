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
  if (v === 0 && i % 10 === 1 && !(i % 100 === 11)) return Plural.One;
  if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
      !(i % 100 >= 12 && i % 100 <= 14))
    return Plural.Few;
  if (v === 0 && i % 10 === 0 ||
      v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
      v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 11 && i % 100 <= 14)
    return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleUk: NgLocale = {
  localeId: 'uk',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'опівночі',
          am: 'дп',
          noon: 'пополудні',
          pm: 'пп',
          morning1: 'ранку',
          afternoon1: 'дня',
          evening1: 'вечора',
          night1: 'ночі'
        },
        narrow: {
          midnight: 'північ',
          am: 'дп',
          noon: 'п',
          pm: 'пп',
          morning1: 'ранку',
          afternoon1: 'дня',
          evening1: 'вечора',
          night1: 'ночі'
        },
        wide: {
          midnight: 'опівночі',
          am: 'дп',
          noon: 'пополудні',
          pm: 'пп',
          morning1: 'ранку',
          afternoon1: 'дня',
          evening1: 'вечора',
          night1: 'ночі'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'північ',
          am: 'дп',
          noon: 'полудень',
          pm: 'пп',
          morning1: 'ранок',
          afternoon1: 'день',
          evening1: 'вечір',
          night1: 'ніч'
        },
        narrow: {
          midnight: 'північ',
          am: 'дп',
          noon: 'полудень',
          pm: 'пп',
          morning1: 'ранок',
          afternoon1: 'день',
          evening1: 'вечір',
          night1: 'ніч'
        },
        wide: {
          midnight: 'північ',
          am: 'дп',
          noon: 'полудень',
          pm: 'пп',
          morning1: 'ранок',
          afternoon1: 'день',
          evening1: 'вечір',
          night1: 'ніч'
        }
      }
    },
    days: {
      format: {
        narrow: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
        short: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'пʼятниця', 'субота']
      },
      standalone: {
        narrow: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
        short: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'пʼятниця', 'субота']
      }
    },
    months: {
      format: {
        narrow: ['с', 'л', 'б', 'к', 'т', 'ч', 'л', 'с', 'в', 'ж', 'л', 'г'],
        abbreviated: [
          'січ.', 'лют.', 'бер.', 'квіт.', 'трав.', 'черв.', 'лип.', 'серп.', 'вер.', 'жовт.',
          'лист.', 'груд.'
        ],
        wide: [
          'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня',
          'жовтня', 'листопада', 'грудня'
        ]
      },
      standalone: {
        narrow: ['С', 'Л', 'Б', 'К', 'Т', 'Ч', 'Л', 'С', 'В', 'Ж', 'Л', 'Г'],
        abbreviated:
            ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'],
        wide: [
          'січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень',
          'вересень', 'жовтень', 'листопад', 'грудень'
        ]
      }
    },
    eras: {
      abbreviated: ['до н. е.', 'н. е.'],
      narrow: ['до н.е.', 'н.е.'],
      wide: ['до нашої ери', 'нашої ери']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM y \'р\'.',
        long: 'd MMMM y \'р\'.',
        medium: 'd MMM y \'р\'.',
        short: 'dd.MM.yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'о\' {0}', long: '{1} \'о\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '00:00', to: '04:00'},
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
      exponential: 'Е',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₴', name: 'українська гривня'},
  getPluralCase: getPluralCase
};
