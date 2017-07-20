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
export const NgLocaleKln: NgLocale = {
  localeId: 'kln',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'krn', pm: 'koosk'},
        narrow: {am: 'krn', pm: 'koosk'},
        wide: {am: 'karoon', pm: 'kooskoliny'}
      },
      standalone: {
        abbreviated: {am: 'krn', pm: 'koosk'},
        narrow: {am: 'krn', pm: 'koosk'},
        wide: {am: 'krn', pm: 'koosk'}
      }
    },
    days: {
      format: {
        narrow: ['T', 'T', 'O', 'S', 'A', 'M', 'L'],
        short: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
        abbreviated: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
        wide: ['Kotisap', 'Kotaai', 'Koaeng’', 'Kosomok', 'Koang’wan', 'Komuut', 'Kolo']
      },
      standalone: {
        narrow: ['T', 'T', 'O', 'S', 'A', 'M', 'L'],
        short: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
        abbreviated: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
        wide: ['Kotisap', 'Kotaai', 'Koaeng’', 'Kosomok', 'Koang’wan', 'Komuut', 'Kolo']
      }
    },
    months: {
      format: {
        narrow: ['M', 'N', 'T', 'I', 'M', 'P', 'N', 'R', 'B', 'E', 'K', 'K'],
        abbreviated:
            ['Mul', 'Ngat', 'Taa', 'Iwo', 'Mam', 'Paa', 'Nge', 'Roo', 'Bur', 'Epe', 'Kpt', 'Kpa'],
        wide: [
          'Mulgul', 'Ng’atyaato', 'Kiptaamo', 'Iwootkuut', 'Mamuut', 'Paagi', 'Ng’eiyeet',
          'Rooptui', 'Bureet', 'Epeeso', 'Kipsuunde ne taai', 'Kipsuunde nebo aeng’'
        ]
      },
      standalone: {
        narrow: ['M', 'N', 'T', 'I', 'M', 'P', 'N', 'R', 'B', 'E', 'K', 'K'],
        abbreviated:
            ['Mul', 'Ngat', 'Taa', 'Iwo', 'Mam', 'Paa', 'Nge', 'Roo', 'Bur', 'Epe', 'Kpt', 'Kpa'],
        wide: [
          'Mulgul', 'Ng’atyaato', 'Kiptaamo', 'Iwootkuut', 'Mamuut', 'Paagi', 'Ng’eiyeet',
          'Rooptui', 'Bureet', 'Epeeso', 'Kipsuunde ne taai', 'Kipsuunde nebo aeng’'
        ]
      }
    },
    eras: {
      abbreviated: ['AM', 'KO'],
      narrow: ['AM', 'KO'],
      wide: ['Amait kesich Jesu', 'Kokakesich Jesu']
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
  currencySettings: {symbol: 'Ksh', name: 'Silingitab ya Kenya'},
  getPluralCase: getPluralCase
};
