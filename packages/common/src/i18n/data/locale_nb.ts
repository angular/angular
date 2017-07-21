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
export const NgLocaleNb: NgLocale = {
  localeId: 'nb',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'midn.',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'morg.',
          morning2: 'form.',
          afternoon1: 'etterm.',
          evening1: 'kveld',
          night1: 'natt'
        },
        narrow: {
          midnight: 'mn.',
          am: 'a',
          pm: 'p',
          morning1: 'mg.',
          morning2: 'fm.',
          afternoon1: 'em.',
          evening1: 'kv.',
          night1: 'nt.'
        },
        wide: {
          midnight: 'midnatt',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'morgenen',
          morning2: 'formiddagen',
          afternoon1: 'ettermiddagen',
          evening1: 'kvelden',
          night1: 'natten'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'midn.',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'morg.',
          morning2: 'form.',
          afternoon1: 'etterm.',
          evening1: 'kveld',
          night1: 'natt'
        },
        narrow: {
          midnight: 'mn.',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'mg.',
          morning2: 'fm.',
          afternoon1: 'em.',
          evening1: 'kv.',
          night1: 'nt.'
        },
        wide: {
          midnight: 'midnatt',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'morgen',
          morning2: 'formiddag',
          afternoon1: 'ettermiddag',
          evening1: 'kveld',
          night1: 'natt'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø.', 'ma.', 'ti.', 'on.', 'to.', 'fr.', 'lø.'],
        abbreviated: ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
        wide: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø.', 'ma.', 'ti.', 'on.', 'to.', 'fr.', 'lø.'],
        abbreviated: ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
        wide: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
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
    eras: {
      abbreviated: ['f.Kr.', 'e.Kr.'],
      narrow: ['f.Kr.', 'e.Kr.'],
      wide: ['før Kristus', 'etter Kristus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'dd.MM.y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} \'kl\'. {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'}
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'kr', name: 'norske kroner'},
  getPluralCase: getPluralCase
};
