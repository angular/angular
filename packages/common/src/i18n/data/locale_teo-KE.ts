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
export const NgLocaleTeoKE: NgLocale = {
  localeId: 'teo-KE',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Taparachu', pm: 'Ebongi'},
        narrow: {am: 'Taparachu', pm: 'Ebongi'},
        wide: {am: 'Taparachu', pm: 'Ebongi'}
      },
      standalone: {
        abbreviated: {am: 'Taparachu', pm: 'Ebongi'},
        narrow: {am: 'Taparachu', pm: 'Ebongi'},
        wide: {am: 'Taparachu', pm: 'Ebongi'}
      }
    },
    days: {
      format: {
        narrow: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
        short: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
        abbreviated: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
        wide: [
          'Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'
        ]
      },
      standalone: {
        narrow: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
        short: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
        abbreviated: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
        wide: [
          'Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'
        ]
      }
    },
    months: {
      format: {
        narrow: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
        abbreviated:
            ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
        wide: [
          'Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel',
          'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'
        ]
      },
      standalone: {
        narrow: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
        abbreviated:
            ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
        wide: [
          'Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel',
          'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'
        ]
      }
    },
    eras: {
      abbreviated: ['KK', 'BK'],
      narrow: ['KK', 'BK'],
      wide: ['Kabla ya Christo', 'Baada ya Christo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
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
  currencySettings: {symbol: 'Ksh', name: 'Ango’otol lok’ Kenya'},
  getPluralCase: getPluralCase
};
