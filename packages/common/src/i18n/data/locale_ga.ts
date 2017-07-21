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
  if (n === 2) return Plural.Two;
  if (n === Math.floor(n) && n >= 3 && n <= 6) return Plural.Few;
  if (n === Math.floor(n) && n >= 7 && n <= 10) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleGa: NgLocale = {
  localeId: 'ga',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      },
      standalone: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'C', 'D', 'A', 'S'],
        short: ['Do', 'Lu', 'Má', 'Cé', 'Dé', 'Ao', 'Sa'],
        abbreviated: ['Domh', 'Luan', 'Máirt', 'Céad', 'Déar', 'Aoine', 'Sath'],
        wide: [
          'Dé Domhnaigh', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin', 'Dé hAoine',
          'Dé Sathairn'
        ]
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'C', 'D', 'A', 'S'],
        short: ['Do', 'Lu', 'Má', 'Cé', 'Dé', 'Ao', 'Sa'],
        abbreviated: ['Domh', 'Luan', 'Máirt', 'Céad', 'Déar', 'Aoine', 'Sath'],
        wide: [
          'Dé Domhnaigh', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin', 'Dé hAoine',
          'Dé Sathairn'
        ]
      }
    },
    months: {
      format: {
        narrow: ['E', 'F', 'M', 'A', 'B', 'M', 'I', 'L', 'M', 'D', 'S', 'N'],
        abbreviated: [
          'Ean', 'Feabh', 'Márta', 'Aib', 'Beal', 'Meith', 'Iúil', 'Lún', 'MFómh', 'DFómh', 'Samh',
          'Noll'
        ],
        wide: [
          'Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa',
          'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Nollaig'
        ]
      },
      standalone: {
        narrow: ['E', 'F', 'M', 'A', 'B', 'M', 'I', 'L', 'M', 'D', 'S', 'N'],
        abbreviated: [
          'Ean', 'Feabh', 'Márta', 'Aib', 'Beal', 'Meith', 'Iúil', 'Lún', 'MFómh', 'DFómh', 'Samh',
          'Noll'
        ],
        wide: [
          'Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa',
          'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Nollaig'
        ]
      }
    },
    eras:
        {abbreviated: ['RC', 'AD'], narrow: ['RC', 'AD'], wide: ['Roimh Chríost', 'Anno Domini']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
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
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
