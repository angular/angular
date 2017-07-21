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
export const NgLocaleSah: NgLocale = {
  localeId: 'sah',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ЭИ', pm: 'ЭК'},
        narrow: {am: 'ЭИ', pm: 'ЭК'},
        wide: {am: 'ЭИ', pm: 'ЭК'}
      },
      standalone: {
        abbreviated: {am: 'ЭИ', pm: 'ЭК'},
        narrow: {am: 'ЭИ', pm: 'ЭК'},
        wide: {am: 'ЭИ', pm: 'ЭК'}
      }
    },
    days: {
      format: {
        narrow: ['Б', 'Б', 'О', 'С', 'Ч', 'Б', 'С'],
        short: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
        abbreviated: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
        wide: [
          'баскыһыанньа', 'бэнидиэнньик', 'оптуорунньук', 'сэрэдэ', 'чэппиэр', 'Бээтиҥсэ', 'субуота'
        ]
      },
      standalone: {
        narrow: ['Б', 'Б', 'О', 'С', 'Ч', 'Б', 'С'],
        short: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
        abbreviated: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
        wide: [
          'баскыһыанньа', 'бэнидиэнньик', 'оптуорунньук', 'сэрэдэ', 'чэппиэр', 'Бээтиҥсэ', 'субуота'
        ]
      }
    },
    months: {
      format: {
        narrow: ['Т', 'О', 'К', 'М', 'Ы', 'Б', 'О', 'А', 'Б', 'А', 'С', 'А'],
        abbreviated:
            ['Тохс', 'Олун', 'Клн', 'Мсу', 'Ыам', 'Бэс', 'Отй', 'Атр', 'Блҕ', 'Алт', 'Сэт', 'Ахс'],
        wide: [
          'Тохсунньу', 'Олунньу', 'Кулун тутар', 'Муус устар', 'Ыам ыйын', 'Бэс ыйын', 'От ыйын',
          'Атырдьых ыйын', 'Балаҕан ыйын', 'Алтынньы', 'Сэтинньи', 'ахсынньы'
        ]
      },
      standalone: {
        narrow: ['Т', 'О', 'К', 'М', 'Ы', 'Б', 'О', 'А', 'Б', 'А', 'С', 'А'],
        abbreviated:
            ['Тохс', 'Олун', 'Клн', 'Мсу', 'Ыам', 'Бэс', 'Отй', 'Атр', 'Блҕ', 'Алт', 'Сэт', 'Ахс'],
        wide: [
          'тохсунньу', 'олунньу', 'кулун тутар', 'муус устар', 'ыам ыйа', 'бэс ыйа', 'от ыйа',
          'атырдьых ыйа', 'балаҕан ыйа', 'алтынньы', 'сэтинньи', 'ахсынньы'
        ]
      }
    },
    eras: {
      abbreviated: ['б. э. и.', 'б. э'],
      narrow: ['б. э. и.', 'б. э'],
      wide: ['б. э. и.', 'б. э']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y \'сыл\' MMMM d \'күнэ\', EEEE',
        long: 'y, MMMM d',
        medium: 'y, MMM d',
        short: 'yy/M/d'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
      nan: 'чыыһыла буотах',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₽', name: 'Арассыыйа солкуобайа'},
  getPluralCase: getPluralCase
};
