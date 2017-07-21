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
export const NgLocaleBsCyrl: NgLocale = {
  localeId: 'bs-Cyrl',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'пре подне', pm: 'поподне'},
        narrow: {am: 'пре подне', pm: 'поподне'},
        wide: {am: 'пре подне', pm: 'поподне'}
      },
      standalone: {
        abbreviated: {am: 'пре подне', pm: 'поподне'},
        narrow: {am: 'пре подне', pm: 'поподне'},
        wide: {am: 'пре подне', pm: 'поподне'}
      }
    },
    days: {
      format: {
        narrow: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
        short: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
        abbreviated: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
        wide: ['недеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота']
      },
      standalone: {
        narrow: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
        short: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
        abbreviated: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
        wide: ['недеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота']
      }
    },
    months: {
      format: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
        wide: [
          'јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септембар',
          'октобар', 'новембар', 'децембар'
        ]
      },
      standalone: {
        narrow: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        abbreviated:
            ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
        wide: [
          'јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септембар',
          'октобар', 'новембар', 'децембар'
        ]
      }
    },
    eras: {
      abbreviated: ['п. н. е.', 'н. е.'],
      narrow: ['п.н.е.', 'н.е.'],
      wide: ['Пре нове ере', 'Нове ере']
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
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'},
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
  currencySettings: {symbol: 'КМ', name: 'Конвертибилна марка'},
  getPluralCase: getPluralCase
};
