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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSvFI: NgLocale = {
  localeId: 'sv-FI',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'midnatt',
          am: 'fm',
          pm: 'em',
          morning1: 'på morg.',
          morning2: 'på förm.',
          afternoon1: 'på efterm.',
          evening1: 'på kvällen',
          night1: 'på natten'
        },
        narrow: {
          midnight: 'midn.',
          am: 'fm',
          pm: 'em',
          morning1: 'på morg.',
          morning2: 'på förm.',
          afternoon1: 'på efterm.',
          evening1: 'på kvällen',
          night1: 'på natten'
        },
        wide: {
          midnight: 'midnatt',
          am: 'fm',
          pm: 'em',
          morning1: 'på morgonen',
          morning2: 'på förmiddagen',
          afternoon1: 'på eftermiddagen',
          evening1: 'på kvällen',
          night1: 'på natten'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'midnatt',
          am: 'f.m.',
          pm: 'e.m.',
          morning1: 'morgon',
          morning2: 'förm.',
          afternoon1: 'efterm.',
          evening1: 'kväll',
          night1: 'natt'
        },
        narrow: {
          midnight: 'midn.',
          am: 'fm',
          pm: 'em',
          morning1: 'morg.',
          morning2: 'förm.',
          afternoon1: 'efterm.',
          evening1: 'kväll',
          night1: 'natt'
        },
        wide: {
          midnight: 'midnatt',
          am: 'förmiddag',
          pm: 'eftermiddag',
          morning1: 'morgon',
          morning2: 'förmiddag',
          afternoon1: 'eftermiddag',
          evening1: 'kväll',
          night1: 'natt'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö'],
        abbreviated: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
        wide: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö'],
        abbreviated: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
        wide: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september',
          'oktober', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september',
          'oktober', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['f.Kr.', 'e.Kr.'],
      narrow: ['f.Kr.', 'e.Kr.'],
      wide: ['före Kristus', 'efter Kristus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd-MM-y'},
      time: {full: '\'kl\'. HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '00:00', to: '05:00'}
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
      exponential: '×10^',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: '¤¤¤',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
