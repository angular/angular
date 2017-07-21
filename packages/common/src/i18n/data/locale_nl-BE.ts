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
export const NgLocaleNlBE: NgLocale = {
  localeId: 'nl-BE',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'ochtend',
          afternoon1: 'middag',
          evening1: 'avond',
          night1: 'nacht'
        },
        narrow: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: '‘s ochtends',
          afternoon1: '‘s middags',
          evening1: '‘s avonds',
          night1: '‘s nachts'
        },
        wide: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: '‘s ochtends',
          afternoon1: '‘s middags',
          evening1: '‘s avonds',
          night1: '‘s nachts'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'ochtend',
          afternoon1: 'middag',
          evening1: 'avond',
          night1: 'nacht'
        },
        narrow: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'ochtend',
          afternoon1: 'middag',
          evening1: 'avond',
          night1: 'nacht'
        },
        wide: {
          midnight: 'middernacht',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'ochtend',
          afternoon1: 'middag',
          evening1: 'avond',
          night1: 'nacht'
        }
      }
    },
    days: {
      format: {
        narrow: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
        short: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
        abbreviated: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
        wide: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
      },
      standalone: {
        narrow: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
        short: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
        abbreviated: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
        wide: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september',
          'oktober', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september',
          'oktober', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['v.Chr.', 'n.Chr.'],
      narrow: ['v.C.', 'n.C.'],
      wide: ['voor Christus', 'na Christus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/MM/yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'om\' {0}', long: '{1} \'om\' {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'}
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
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
