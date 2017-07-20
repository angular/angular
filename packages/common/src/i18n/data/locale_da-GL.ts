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
  let i = Math.floor(Math.abs(n)),
      t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
  if (n === 1 || !(t === 0) && (i === 0 || i === 1)) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleDaGL: NgLocale = {
  localeId: 'da-GL',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'midnat',
          am: 'AM',
          pm: 'PM',
          morning1: 'om morgenen',
          morning2: 'om formiddagen',
          afternoon1: 'om eftermiddagen',
          evening1: 'om aftenen',
          night1: 'om natten'
        },
        narrow: {
          midnight: 'midnat',
          am: 'a',
          pm: 'p',
          morning1: 'om morgenen',
          morning2: 'om formiddagen',
          afternoon1: 'om eftermiddagen',
          evening1: 'om aftenen',
          night1: 'om natten'
        },
        wide: {
          midnight: 'midnat',
          am: 'AM',
          pm: 'PM',
          morning1: 'om morgenen',
          morning2: 'om formiddagen',
          afternoon1: 'om eftermiddagen',
          evening1: 'om aftenen',
          night1: 'om natten'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'midnat',
          am: 'AM',
          pm: 'PM',
          morning1: 'morgen',
          morning2: 'formiddag',
          afternoon1: 'eftermiddag',
          evening1: 'aften',
          night1: 'nat'
        },
        narrow: {
          midnight: 'midnat',
          am: 'AM',
          pm: 'PM',
          morning1: 'morgen',
          morning2: 'formiddag',
          afternoon1: 'eftermiddag',
          evening1: 'aften',
          night1: 'nat'
        },
        wide: {
          midnight: 'midnat',
          am: 'AM',
          pm: 'PM',
          morning1: 'morgen',
          morning2: 'formiddag',
          afternoon1: 'eftermiddag',
          evening1: 'aften',
          night1: 'nat'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
        abbreviated: ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
        wide: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
        short: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
        abbreviated: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
        wide: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'december'
        ]
      }
    },
    eras: {abbreviated: ['f.Kr.', 'e.Kr.'], narrow: ['fKr', 'eKr'], wide: ['f.Kr.', 'e.Kr.']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date:
          {full: 'EEEE \'den\' d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'dd/MM/y'},
      time: {full: 'h.mm.ss a zzzz', long: 'h.mm.ss a z', medium: 'h.mm.ss a', short: 'h.mm a'},
      dateTime:
          {full: '{1} \'kl\'. {0}', long: '{1} \'kl\'. {0}', medium: '{1} {0}', short: '{1} {0}'}
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
      timeSeparator: '.'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'kr.', name: 'dansk krone'},
  getPluralCase: getPluralCase
};
