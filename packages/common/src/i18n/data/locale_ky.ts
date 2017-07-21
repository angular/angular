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
export const NgLocaleKy: NgLocale = {
  localeId: 'ky',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'түн ортосу',
          am: 'тң',
          noon: 'чак түш',
          pm: 'тк',
          morning1: 'эртең менен',
          afternoon1: 'түштөн кийин',
          evening1: 'кечинде',
          night1: 'түн ичинде'
        },
        narrow: {
          midnight: 'түн орт',
          am: 'тң',
          noon: 'чт',
          pm: 'тк',
          morning1: 'эртң мн',
          afternoon1: 'түшт кйн',
          evening1: 'кечк',
          night1: 'түн'
        },
        wide: {
          midnight: 'түн ортосу',
          am: 'таңкы',
          noon: 'чак түш',
          pm: 'түштөн кийинки',
          morning1: 'эртең менен',
          afternoon1: 'түштөн кийин',
          evening1: 'кечинде',
          night1: 'түн ичинде'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'түн ортосу',
          am: 'тң',
          noon: 'чак түш',
          pm: 'тк',
          morning1: 'эртең менен',
          afternoon1: 'түштөн кийин',
          evening1: 'кечкурун',
          night1: 'түн'
        },
        narrow: {
          midnight: 'түн ортосу',
          am: 'тң',
          noon: 'чак түш',
          pm: 'тк',
          morning1: 'эртең менен',
          afternoon1: 'түштөн кийин',
          evening1: 'кечкурун',
          night1: 'түн'
        },
        wide: {
          midnight: 'түн ортосу',
          am: 'таңкы',
          noon: 'чак түш',
          pm: 'түштөн кийинки',
          morning1: 'эртең менен',
          afternoon1: 'түштөн кийин',
          evening1: 'кечкурун',
          night1: 'түн'
        }
      }
    },
    days: {
      format: {
        narrow: ['Ж', 'Д', 'Ш', 'Ш', 'Б', 'Ж', 'И'],
        short: ['жек.', 'дүй.', 'шейш.', 'шарш.', 'бейш.', 'жума', 'ишм.'],
        abbreviated: ['жек.', 'дүй.', 'шейш.', 'шарш.', 'бейш.', 'жума', 'ишм.'],
        wide: ['жекшемби', 'дүйшөмбү', 'шейшемби', 'шаршемби', 'бейшемби', 'жума', 'ишемби']
      },
      standalone: {
        narrow: ['Ж', 'Д', 'Ш', 'Ш', 'Б', 'Ж', 'И'],
        short: ['жк', 'дш.', 'шш.', 'шр.', 'бш.', 'жм.', 'иш.'],
        abbreviated: ['жек.', 'дүй.', 'шейш.', 'шарш.', 'бейш.', 'жума', 'ишм.'],
        wide: ['жекшемби', 'дүйшөмбү', 'шейшемби', 'шаршемби', 'бейшемби', 'жума', 'ишемби']
      }
    },
    months: {
      format: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated: [
          'янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.',
          'дек.'
        ],
        wide: [
          'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь',
          'октябрь', 'ноябрь', 'декабрь'
        ]
      },
      standalone: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated:
            ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        wide: [
          'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
          'Октябрь', 'Ноябрь', 'Декабрь'
        ]
      }
    },
    eras: {
      abbreviated: ['б.з.ч.', 'б.з.'],
      narrow: ['б.з.ч.', 'б.з.'],
      wide: ['биздин заманга чейин', 'биздин заман']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y-\'ж\'., d-MMMM, EEEE',
        long: 'y-\'ж\'., d-MMMM',
        medium: 'y-\'ж\'., d-MMM',
        short: 'd/M/yy'
      },
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
      group: ' ',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'сан эмес',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'сом', name: 'Кыргызстан сому'},
  getPluralCase: getPluralCase
};
