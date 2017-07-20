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
  if (n % 10 === 1 && !(n % 100 === 11)) return Plural.One;
  if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
      !(n % 100 >= 12 && n % 100 <= 14))
    return Plural.Few;
  if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
      n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
    return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleBe: NgLocale = {
  localeId: 'be',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['н', 'п', 'а', 'с', 'ч', 'п', 'с'],
        short: ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
        wide: ['нядзеля', 'панядзелак', 'аўторак', 'серада', 'чацвер', 'пятніца', 'субота']
      },
      standalone: {
        narrow: ['н', 'п', 'а', 'с', 'ч', 'п', 'с'],
        short: ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
        abbreviated: ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
        wide: ['нядзеля', 'панядзелак', 'аўторак', 'серада', 'чацвер', 'пятніца', 'субота']
      }
    },
    months: {
      format: {
        narrow: ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
        abbreviated:
            ['сту', 'лют', 'сак', 'кра', 'мая', 'чэр', 'ліп', 'жні', 'вер', 'кас', 'ліс', 'сне'],
        wide: [
          'студзеня', 'лютага', 'сакавіка', 'красавіка', 'мая', 'чэрвеня', 'ліпеня', 'жніўня',
          'верасня', 'кастрычніка', 'лістапада', 'снежня'
        ]
      },
      standalone: {
        narrow: ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
        abbreviated:
            ['сту', 'лют', 'сак', 'кра', 'май', 'чэр', 'ліп', 'жні', 'вер', 'кас', 'ліс', 'сне'],
        wide: [
          'студзень', 'люты', 'сакавік', 'красавік', 'май', 'чэрвень', 'ліпень', 'жнівень',
          'верасень', 'кастрычнік', 'лістапад', 'снежань'
        ]
      }
    },
    eras: {
      abbreviated: ['да н.э.', 'н.э.'],
      narrow: ['да н.э.', 'н.э.'],
      wide: ['да нараджэння Хрыстова', 'ад нараджэння Хрыстова']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM y \'г\'.',
        long: 'd MMMM y \'г\'.',
        medium: 'd.MM.y',
        short: 'd.MM.yy'
      },
      time: {full: 'HH:mm:ss, zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'у\' {0}', long: '{1} \'у\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
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
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Br', name: 'беларускі рубель'},
  getPluralCase: getPluralCase
};
