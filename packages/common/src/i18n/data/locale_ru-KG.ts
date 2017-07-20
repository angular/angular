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
export const NgLocaleRuKG: NgLocale = {
  localeId: 'ru-KG',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'полн.',
          am: 'ДП',
          noon: 'полд.',
          pm: 'ПП',
          morning1: 'утра',
          afternoon1: 'дня',
          evening1: 'вечера',
          night1: 'ночи'
        },
        narrow: {
          midnight: 'полн.',
          am: 'ДП',
          noon: 'полд.',
          pm: 'ПП',
          morning1: 'утра',
          afternoon1: 'дня',
          evening1: 'вечера',
          night1: 'ночи'
        },
        wide: {
          midnight: 'полночь',
          am: 'ДП',
          noon: 'полдень',
          pm: 'ПП',
          morning1: 'утра',
          afternoon1: 'дня',
          evening1: 'вечера',
          night1: 'ночи'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'полн.',
          am: 'ДП',
          noon: 'полд.',
          pm: 'ПП',
          morning1: 'утро',
          afternoon1: 'день',
          evening1: 'веч.',
          night1: 'ночь'
        },
        narrow: {
          midnight: 'полн.',
          am: 'ДП',
          noon: 'полд.',
          pm: 'ПП',
          morning1: 'утро',
          afternoon1: 'день',
          evening1: 'веч.',
          night1: 'ночь'
        },
        wide: {
          midnight: 'полночь',
          am: 'ДП',
          noon: 'полдень',
          pm: 'ПП',
          morning1: 'утро',
          afternoon1: 'день',
          evening1: 'вечер',
          night1: 'ночь'
        }
      }
    },
    days: {
      format: {
        narrow: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        short: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
      },
      standalone: {
        narrow: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
        short: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
      }
    },
    months: {
      format: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated: [
          'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.',
          'дек.'
        ],
        wide: [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября',
          'октября', 'ноября', 'декабря'
        ]
      },
      standalone: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated: [
          'янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.',
          'дек.'
        ],
        wide: [
          'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь',
          'октябрь', 'ноябрь', 'декабрь'
        ]
      }
    },
    eras: {
      abbreviated: ['до н. э.', 'н. э.'],
      narrow: ['до н.э.', 'н.э.'],
      wide: ['до Рождества Христова', 'от Рождества Христова']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM y \'г\'.',
        long: 'd MMMM y \'г\'.',
        medium: 'd MMM y \'г\'.',
        short: 'dd.MM.y'
      },
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
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
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'не число',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'сом', name: 'Киргизский сом'},
  getPluralCase: getPluralCase
};
