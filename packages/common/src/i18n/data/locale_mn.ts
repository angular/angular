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
export const NgLocaleMn: NgLocale = {
  localeId: 'mn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'шөнө дунд',
          am: 'ҮӨ',
          noon: 'үд дунд',
          pm: 'ҮХ',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        },
        narrow: {
          midnight: 'шөнө дунд',
          am: 'үө',
          noon: 'үд',
          pm: 'үх',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        },
        wide: {
          midnight: 'шөнө дунд',
          am: 'ү.ө',
          noon: 'үд дунд',
          pm: 'ү.х',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'шөнө дунд',
          am: 'ҮӨ',
          noon: 'үд дунд',
          pm: 'ҮХ',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        },
        narrow: {
          midnight: 'шөнө дунд',
          am: 'ҮӨ',
          noon: 'үд дунд',
          pm: 'ҮХ',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        },
        wide: {
          midnight: 'шөнө дунд',
          am: 'ҮӨ',
          noon: 'үд дунд',
          pm: 'ҮХ',
          morning1: 'өглөө',
          afternoon1: 'өдөр',
          evening1: 'орой',
          night1: 'шөнө'
        }
      }
    },
    days: {
      format: {
        narrow: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        short: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        abbreviated: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        wide: ['ням', 'даваа', 'мягмар', 'лхагва', 'пүрэв', 'баасан', 'бямба']
      },
      standalone: {
        narrow: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        short: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        abbreviated: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        wide: ['ням', 'даваа', 'мягмар', 'лхагва', 'пүрэв', 'баасан', 'бямба']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар',
          '9-р сар', '10-р сар', '11-р сар', '12-р сар'
        ],
        wide: [
          'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар',
          'Зургадугаар сар', 'Долдугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар',
          'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р са��', '8-р сар',
          '9-р сар', '10-р сар', '11-р сар', '12-р сар'
        ],
        wide: [
          'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар',
          'Зургадугаар сар', 'Долдугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар',
          'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
        ]
      }
    },
    eras: {
      abbreviated: ['м.э.ө', 'м.э.'],
      narrow: ['МЭӨ', 'МЭ'],
      wide: ['манай эриний өмнөх', 'манай эриний']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, y \'оны\' MM \'сарын\' d',
        long: 'y\'оны\' MMMM\'сарын\' d\'өдөр\'',
        medium: 'y MMM d',
        short: 'y-MM-dd'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1}, {0}'}
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₮', name: 'төгрөг'},
  getPluralCase: getPluralCase
};
