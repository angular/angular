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
export const NgLocaleYoBJ: NgLocale = {
  localeId: 'yo-BJ',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'},
        narrow: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'},
        wide: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'}
      },
      standalone: {
        abbreviated: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'},
        narrow: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'},
        wide: {am: 'Àárɔ̀', pm: 'Ɔ̀sán'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Àìkú', 'Ajé', 'Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɛtì', 'Àbámɛ́ta'],
        abbreviated: ['Àìkú', 'Ajé', 'Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɛtì', 'Àbámɛ́ta'],
        wide: ['Ɔjɔ́ Àìkú', 'Ɔjɔ́ Ajé', 'Ɔjɔ́ Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɔjɔ́ Ɛtì', 'Ɔjɔ́ Àbámɛ́ta']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Àìkú', 'Ajé', 'Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɛtì', 'Àbámɛ́ta'],
        abbreviated: ['Àìkú', 'Ajé', 'Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɛtì', 'Àbámɛ́ta'],
        wide: ['Ɔjɔ́ Àìkú', 'Ɔjɔ́ Ajé', 'Ɔjɔ́ Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɔjɔ́ Ɛtì', 'Ɔjɔ́ Àbámɛ́ta']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Shɛ́rɛ́', 'Èrèlè', 'Ɛrɛ̀nà', 'Ìgbé', 'Ɛ̀bibi', 'Òkúdu', 'Agɛmɔ', 'Ògún', 'Owewe', 'Ɔ̀wàrà',
          'Bélú', 'Ɔ̀pɛ̀'
        ],
        wide: [
          'Oshù Shɛ́rɛ́', 'Oshù Èrèlè', 'Oshù Ɛrɛ̀nà', 'Oshù Ìgbé', 'Oshù Ɛ̀bibi', 'Oshù Òkúdu',
          'Oshù Agɛmɔ', 'Oshù Ògún', 'Oshù Owewe', 'Oshù Ɔ̀wàrà', 'Oshù Bélú', 'Oshù Ɔ̀pɛ̀'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Shɛ́rɛ́', 'Èrèlè', 'Ɛrɛ̀nà', 'Ìgbé', 'Ɛ̀bibi', 'Òkúdu', 'Agɛmɔ', 'Ògún', 'Owewe', 'Ɔ̀wàrà',
          'Bélú', 'Ɔ̀pɛ̀'
        ],
        wide: [
          'Oshù Shɛ́rɛ́', 'Oshù Èrèlè', 'Oshù Ɛrɛ̀nà', 'Oshù Ìgbé', 'Oshù Ɛ̀bibi', 'Oshù Òkúdu',
          'Oshù Agɛmɔ', 'Oshù Ògún', 'Oshù Owewe', 'Oshù Ɔ̀wàrà', 'Oshù Bélú', 'Oshù Ɔ̀pɛ̀'
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
  currencySettings: {symbol: 'CFA', name: 'Faransi ti Orílɛ́ède BIKEAO'},
  getPluralCase: getPluralCase
};
