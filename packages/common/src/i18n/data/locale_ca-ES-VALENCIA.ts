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
export const NgLocaleCaESVALENCIA: NgLocale = {
  localeId: 'ca-ES-VALENCIA',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'matinada',
          morning2: 'matí',
          afternoon1: 'migdia',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        },
        narrow: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'mat.',
          morning2: 'matí',
          afternoon1: 'md',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        },
        wide: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'matinada',
          morning2: 'matí',
          afternoon1: 'migdia',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'matinada',
          morning2: 'matí',
          afternoon1: 'migdia',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        },
        narrow: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'matinada',
          morning2: 'matí',
          afternoon1: 'migdia',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        },
        wide: {
          midnight: 'mitjanit',
          am: 'a. m.',
          pm: 'p. m.',
          morning1: 'matinada',
          morning2: 'matí',
          afternoon1: 'migdia',
          afternoon2: 'tarda',
          evening1: 'vespre',
          night1: 'nit'
        }
      }
    },
    days: {
      format: {
        narrow: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
        short: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
        abbreviated: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
        wide: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte']
      },
      standalone: {
        narrow: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
        short: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
        abbreviated: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
        wide: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte']
      }
    },
    months: {
      format: {
        narrow: ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
        abbreviated: [
          'de gen.', 'de febr.', 'de març', 'd’abr.', 'de maig', 'de juny', 'de jul.', 'd’ag.',
          'de set.', 'd’oct.', 'de nov.', 'de des.'
        ],
        wide: [
          'de gener', 'de febrer', 'de març', 'd’abril', 'de maig', 'de juny', 'de juliol',
          'd’agost', 'de setembre', 'd’octubre', 'de novembre', 'de desembre'
        ]
      },
      standalone: {
        narrow: ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
        abbreviated: [
          'gen.', 'febr.', 'març', 'abr.', 'maig', 'juny', 'jul.', 'ag.', 'set.', 'oct.', 'nov.',
          'des.'
        ],
        wide: [
          'gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre',
          'octubre', 'novembre', 'desembre'
        ]
      }
    },
    eras: {
      abbreviated: ['aC', 'dC'],
      narrow: ['aC', 'dC'],
      wide: ['abans de Crist', 'després de Crist']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d MMMM \'de\' y',
        long: 'd MMMM \'de\' y',
        medium: 'd MMM y',
        short: 'd/M/yy'
      },
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {
        full: '{1} \'a\' \'les\' {0}',
        long: '{1} \'a\' \'les\' {0}',
        medium: '{1}, {0}',
        short: '{1} {0}'
      }
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '13:00'},
      afternoon2: {from: '13:00', to: '19:00'},
      evening1: {from: '19:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '00:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '24:00'}
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
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
