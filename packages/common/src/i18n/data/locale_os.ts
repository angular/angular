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
export const NgLocaleOs: NgLocale = {
  localeId: 'os',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'ӕмбисбоны размӕ', pm: 'ӕмбисбоны фӕстӕ'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
        short: ['хцб', 'крс', 'дцг', 'ӕрт', 'цпр', 'мрб', 'сбт'],
        abbreviated: ['хцб', 'крс', 'дцг', 'ӕрт', 'цпр', 'мрб', 'сбт'],
        wide: ['хуыцаубон', 'къуырисӕр', 'дыццӕг', 'ӕртыццӕг', 'цыппӕрӕм', 'майрӕмбон', 'сабат']
      },
      standalone: {
        narrow: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
        short: ['хцб', 'крс', 'дцг', 'ӕрт', 'цпр', 'мрб', 'сбт'],
        abbreviated: ['Хцб', 'Крс', 'Дцг', 'Ӕрт', 'Цпр', 'Мрб', 'Сбт'],
        wide: ['Хуыцаубон', 'Къуырисӕр', 'Дыццӕг', 'Ӕртыццӕг', 'Цыппӕрӕм', 'Майрӕмбон', 'Сабат']
      }
    },
    months: {
      format: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated: [
          'янв.', 'фев.', 'мар.', 'апр.', 'майы', 'июны', 'июлы', 'авг.', 'сен.', 'окт.', 'ноя.',
          'дек.'
        ],
        wide: [
          'январы', 'февралы', 'мартъийы', 'апрелы', 'майы', 'июны', 'июлы', 'августы', 'сентябры',
          'октябры', 'ноябры', 'декабры'
        ]
      },
      standalone: {
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
        abbreviated: [
          'Янв.', 'Февр.', 'Март.', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.',
          'Дек.'
        ],
        wide: [
          'Январь', 'Февраль', 'Мартъи', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
          'Октябрь', 'Ноябрь', 'Декабрь'
        ]
      }
    },
    eras: {abbreviated: ['н.д.а.', 'н.д.'], narrow: ['н.д.а.', 'н.д.'], wide: ['н.д.а.', 'н.д.']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM, y \'аз\'',
        long: 'd MMMM, y \'аз\'',
        medium: 'dd MMM y \'аз\'',
        short: 'dd.MM.yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
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
      nan: 'НН',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₾', name: 'Лар'},
  getPluralCase: getPluralCase
};
