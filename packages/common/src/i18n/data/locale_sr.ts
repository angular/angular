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
  if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
    return Plural.One;
  if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14) ||
      f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
          !(f % 100 >= 12 && f % 100 <= 14))
    return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSr: NgLocale = {
  localeId: 'sr',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'поноћ',
          am: 'пре подне',
          noon: 'подне',
          pm: 'по подне',
          morning1: 'ујутро',
          afternoon1: 'по подне',
          evening1: 'увече',
          night1: 'ноћу'
        },
        narrow: {
          midnight: 'у поноћ',
          am: 'a',
          noon: 'у подне',
          pm: 'p',
          morning1: 'ујутру',
          afternoon1: 'по подне',
          evening1: 'увече',
          night1: 'ноћу'
        },
        wide: {
          midnight: 'поноћ',
          am: 'пре подне',
          noon: 'подне',
          pm: 'по подне',
          morning1: 'ујутро',
          afternoon1: 'по подне',
          evening1: 'увече',
          night1: 'ноћу'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'поноћ',
          am: 'пре подне',
          noon: 'подне',
          pm: 'по подне',
          morning1: 'јутро',
          afternoon1: 'поподне',
          evening1: 'вече',
          night1: 'ноћ'
        },
        narrow: {
          midnight: 'поноћ',
          am: 'пре подне',
          noon: 'подне',
          pm: 'по подне',
          morning1: 'ујутро',
          afternoon1: 'по подне',
          evening1: 'увече',
          night1: 'ноћу'
        },
        wide: {
          midnight: 'поноћ',
          am: 'пре подне',
          noon: 'подне',
          pm: 'по подне',
          morning1: 'јутро',
          afternoon1: 'поподне',
          evening1: 'вече',
          night1: 'ноћ'
        }
      }
    },
    days: {
      format: {
        narrow: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
        short: ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су'],
        abbreviated: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
        wide: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота']
      },
      standalone: {
        narrow: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
        short: ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су'],
        abbreviated: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
        wide: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота']
      }
    },
    months: {
      format: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
        wide: [
          'јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар',
          'октобар', 'новембар', 'децембар'
        ]
      },
      standalone: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
        wide: [
          'јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар',
          'октобар', 'новембар', 'децембар'
        ]
      }
    },
    eras: {
      abbreviated: ['п. н. е.', 'н. е.'],
      narrow: ['п.н.е.', 'н.е.'],
      wide: ['пре нове ере', 'нове ере']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd. MMMM y.', long: 'dd. MMMM y.', medium: 'dd.MM.y.', short: 'd.M.yy.'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: 'RSD', name: 'Српски динар'},
  getPluralCase: getPluralCase
};
