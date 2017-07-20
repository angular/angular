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
export const NgLocaleNn: NgLocale = {
  localeId: 'nn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'f.m.', pm: 'e.m.'},
        narrow: {am: 'f.m.', pm: 'e.m.'},
        wide: {am: 'formiddag', pm: 'ettermiddag'}
      },
      standalone: {
        abbreviated: {am: 'f.m.', pm: 'e.m.'},
        narrow: {am: 'f.m.', pm: 'e.m.'},
        wide: {am: 'f.m.', pm: 'e.m.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'],
        abbreviated: ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'],
        wide: ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'],
        abbreviated: ['søn', 'mån', 'tys', 'ons', 'tor', 'fre', 'lau'],
        wide: ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.',
          'des.'
        ],
        wide: [
          'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'desember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
        wide: [
          'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'desember'
        ]
      }
    },
    eras: {abbreviated: ['f.Kr.', 'e.Kr.'], narrow: ['f.Kr.', 'e.Kr.'], wide: ['f.Kr.', 'e.Kr.']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'dd.MM.y'},
      time: {full: '\'kl\'. HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} \'kl\'. {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'kr', name: 'norsk krone'},
  getPluralCase: getPluralCase
};
