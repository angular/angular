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
export const NgLocaleYo: NgLocale = {
  localeId: 'yo',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Àárọ̀', pm: 'Ọ̀sán'},
        narrow: {am: 'Àárọ̀', pm: 'Ọ̀sán'},
        wide: {am: 'Àárọ̀', pm: 'Ọ̀sán'}
      },
      standalone: {
        abbreviated: {am: 'Àárọ̀', pm: 'Ọ̀sán'},
        narrow: {am: 'Àárọ̀', pm: 'Ọ̀sán'},
        wide: {am: 'Àárọ̀', pm: 'Ọ̀sán'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
        abbreviated: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
        wide: ['Ọjọ́ Àìkú', 'Ọjọ́ Ajé', 'Ọjọ́ Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ọjọ́ Ẹtì', 'Ọjọ́ Àbámẹ́ta']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
        abbreviated: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
        wide: ['Ọjọ́ Àìkú', 'Ọjọ́ Ajé', 'Ọjọ́ Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ọjọ́ Ẹtì', 'Ọjọ́ Àbámẹ́ta']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Ṣẹ́rẹ́', 'Èrèlè', 'Ẹrẹ̀nà', 'Ìgbé', 'Ẹ̀bibi', 'Òkúdu', 'Agẹmọ', 'Ògún', 'Owewe', 'Ọ̀wàrà',
          'Bélú', 'Ọ̀pẹ̀'
        ],
        wide: [
          'Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Ẹ̀bibi', 'Oṣù Òkúdu', 'Oṣù Agẹmọ',
          'Oṣù Ògún', 'Oṣù Owewe', 'Oṣù Ọ̀wàrà', 'Oṣù Bélú', 'Oṣù Ọ̀pẹ̀'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Ṣẹ́rẹ́', 'Èrèlè', 'Ẹrẹ̀nà', 'Ìgbé', 'Ẹ̀bibi', 'Òkúdu', 'Agẹmọ', 'Ògún', 'Owewe', 'Ọ̀wàrà',
          'Bélú', 'Ọ̀pẹ̀'
        ],
        wide: [
          'Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Ẹ̀bibi', 'Oṣù Òkúdu', 'Oṣù Agẹmọ',
          'Oṣù Ògún', 'Oṣù Owewe', 'Oṣù Ọ̀wàrà', 'Oṣù Bélú', 'Oṣù Ọ̀pẹ̀'
        ]
      }
    },
    eras:
        {abbreviated: ['BCE', 'LK'], narrow: ['BCE', 'LK'], wide: ['Saju Kristi', 'Lehin Kristi']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₦', name: 'Naira ti Orílẹ́ède Nàìjíríà'},
  getPluralCase: getPluralCase
};
