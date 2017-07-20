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
export const NgLocaleBg: NgLocale = {
  localeId: 'bg',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'полунощ',
          am: 'am',
          pm: 'pm',
          morning1: 'сутринта',
          morning2: 'на обед',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        },
        narrow: {
          midnight: 'полунощ',
          am: 'am',
          pm: 'pm',
          morning1: 'сутринта',
          morning2: 'на обед',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        },
        wide: {
          midnight: 'полунощ',
          am: 'пр.об.',
          pm: 'сл.об.',
          morning1: 'сутринта',
          morning2: 'на обяд',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'полунощ',
          am: 'am',
          pm: 'pm',
          morning1: 'сутринта',
          morning2: 'на обед',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        },
        narrow: {
          midnight: 'полунощ',
          am: 'am',
          pm: 'pm',
          morning1: 'сутринта',
          morning2: 'на обед',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        },
        wide: {
          midnight: 'полунощ',
          am: 'am',
          pm: 'pm',
          morning1: 'сутринта',
          morning2: 'на обед',
          afternoon1: 'следобед',
          evening1: 'вечерта',
          night1: 'през нощта'
        }
      }
    },
    days: {
      format: {
        narrow: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        short: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота']
      },
      standalone: {
        narrow: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        short: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        wide: ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота']
      }
    },
    months: {
      format: {
        narrow: ['я', 'ф', 'м', 'а', 'м', 'ю', 'ю', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['яну', 'фев', 'март', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
        wide: [
          'януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември',
          'октомври', 'ноември', 'декември'
        ]
      },
      standalone: {
        narrow: ['я', 'ф', 'м', 'а', 'м', 'ю', 'ю', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['яну', 'фев', 'март', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
        wide: [
          'януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември',
          'октомври', 'ноември', 'декември'
        ]
      }
    },
    eras: {
      abbreviated: ['пр.Хр.', 'сл.Хр.'],
      narrow: ['пр.Хр.', 'сл.Хр.'],
      wide: ['преди Христа', 'след Христа']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM y \'г\'.',
        long: 'd MMMM y \'г\'.',
        medium: 'd.MM.y \'г\'.',
        short: 'd.MM.yy \'г\'.'
      },
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '14:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '11:00'},
      morning2: {from: '11:00', to: '14:00'},
      night1: {from: '22:00', to: '04:00'}
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
      superscriptingExponent: '·',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'лв.', name: 'Български лев'},
  getPluralCase: getPluralCase
};
