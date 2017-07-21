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
export const NgLocaleUzCyrl: NgLocale = {
  localeId: 'uz-Cyrl',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        },
        narrow: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        },
        wide: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        },
        narrow: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        },
        wide: {
          midnight: 'ярим тун',
          am: 'ТО',
          noon: 'туш пайти',
          pm: 'ТК',
          morning1: 'эрталаб',
          afternoon1: 'кундузи',
          evening1: 'кечқурун',
          night1: 'кечаси'
        }
      }
    },
    days: {
      format: {
        narrow: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
        short: ['Як', 'Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша'],
        abbreviated: ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
        wide: ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба']
      },
      standalone: {
        narrow: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
        short: ['Як', 'Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша'],
        abbreviated: ['Якш', 'Душ', 'Сеш', 'Чор', 'Пай', 'Жум', 'Шан'],
        wide: ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба']
      }
    },
    months: {
      format: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated:
            ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        wide: [
          'январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр',
          'ноябр', 'декабр'
        ]
      },
      standalone: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated:
            ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        wide: [
          'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр',
          'Ноябр', 'Декабр'
        ]
      }
    },
    eras: {
      abbreviated: ['м.а.', 'милодий'],
      narrow: ['м.а.', 'милодий'],
      wide: ['милоддан аввалги', 'милодий']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'dd/MM/yy'},
      time: {full: 'HH:mm:ss (zzzz)', long: 'HH:mm:ss (z)', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '11:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '11:00'},
      night1: {from: '22:00', to: '06:00'},
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
      nan: 'ҳақиқий сон эмас',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'сўм', name: 'Ўзбекистон сўм'},
  getPluralCase: getPluralCase
};
