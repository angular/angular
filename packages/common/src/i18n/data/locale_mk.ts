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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (v === 0 && i % 10 === 1 || f % 10 === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleMk: NgLocale = {
  localeId: 'mk',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'полноќ',
          am: 'претпл.',
          noon: 'напладне',
          pm: 'попл.',
          morning1: 'наутро',
          morning2: 'претпл.',
          afternoon1: 'попл.',
          evening1: 'навечер',
          night1: 'ноќе'
        },
        narrow: {
          midnight: 'полн.',
          am: 'претпл.',
          noon: 'напл.',
          pm: 'попл.',
          morning1: 'утро',
          morning2: 'претпл.',
          afternoon1: 'попл.',
          evening1: 'веч.',
          night1: 'ноќе'
        },
        wide: {
          midnight: 'полноќ',
          am: 'претпладне',
          noon: 'напладне',
          pm: 'попладне',
          morning1: 'наутро',
          morning2: 'претпладне',
          afternoon1: 'попладне',
          evening1: 'навечер',
          night1: 'по полноќ'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'полноќ',
          am: 'претпл.',
          noon: 'напладне',
          pm: 'попл.',
          morning1: 'наутро',
          morning2: 'претпл.',
          afternoon1: 'попл.',
          evening1: 'навечер',
          night1: 'по полноќ'
        },
        narrow: {
          midnight: 'полноќ',
          am: 'претпл.',
          noon: 'пладне',
          pm: 'попл.',
          morning1: 'наутро',
          morning2: 'претпладне',
          afternoon1: 'попладне',
          evening1: 'навечер',
          night1: 'по полноќ'
        },
        wide: {
          midnight: 'на полноќ',
          am: 'претпладне',
          noon: 'напладне',
          pm: 'попладне',
          morning1: 'наутро',
          morning2: 'претпладне',
          afternoon1: 'попладне',
          evening1: 'навечер',
          night1: 'по полноќ'
        }
      }
    },
    days: {
      format: {
        narrow: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        short: ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.'],
        abbreviated: ['нед.', 'пон.', 'вт.', 'сре.', 'чет.', 'пет.', 'саб.'],
        wide: ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота']
      },
      standalone: {
        narrow: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        short: ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.'],
        abbreviated: ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.'],
        wide: ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота']
      }
    },
    months: {
      format: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated: [
          'јан.', 'фев.', 'мар.', 'апр.', 'мај', 'јун.', 'јул.', 'авг.', 'септ.', 'окт.', 'ноем.',
          'дек.'
        ],
        wide: [
          'јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември',
          'октомври', 'ноември', 'декември'
        ]
      },
      standalone: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated: [
          'јан.', 'фев.', 'мар.', 'апр.', 'мај', 'јун.', 'јул.', 'авг.', 'септ.', 'окт.', 'ноем.',
          'дек.'
        ],
        wide: [
          'јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември',
          'октомври', 'ноември', 'декември'
        ]
      }
    },
    eras: {
      abbreviated: ['пр.н.е.', 'н.е.'],
      narrow: ['пр.н.е.', 'н.е.'],
      wide: ['пред нашата ера', 'од нашата ера']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM y', long: 'dd MMMM y', medium: 'dd.M.y', short: 'dd.M.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '00:00', to: '04:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'ден', name: 'Македонски денар'},
  getPluralCase: getPluralCase
};
