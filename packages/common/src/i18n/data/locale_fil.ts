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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (v === 0 && (i === 1 || i === 2 || i === 3) ||
      v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) ||
      !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
    return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleFil: NgLocale = {
  localeId: 'fil',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'hatinggabi',
          am: 'AM',
          noon: 'tanghaling-tapat',
          pm: 'PM',
          morning1: 'nang umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'ng hapon',
          night1: 'gabi'
        },
        narrow: {
          midnight: 'hatinggabi',
          am: 'am',
          noon: 'tanghaling-tapat',
          pm: 'pm',
          morning1: 'umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'ng hapon',
          night1: 'gabi'
        },
        wide: {
          midnight: 'hatinggabi',
          am: 'AM',
          noon: 'tanghaling-tapat',
          pm: 'PM',
          morning1: 'nang umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'ng hapon',
          night1: 'ng gabi'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'hatinggabi',
          am: 'AM',
          noon: 'tanghaling-tapat',
          pm: 'PM',
          morning1: 'umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'hapon',
          night1: 'gabi'
        },
        narrow: {
          midnight: 'hatinggabi',
          am: 'AM',
          noon: 'tanghaling-tapat',
          pm: 'PM',
          morning1: 'umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'hapon',
          night1: 'gabi'
        },
        wide: {
          midnight: 'hatinggabi',
          am: 'AM',
          noon: 'tanghaling-tapat',
          pm: 'PM',
          morning1: 'umaga',
          morning2: 'madaling-araw',
          afternoon1: 'tanghali',
          evening1: 'hapon',
          night1: 'gabi'
        }
      }
    },
    days: {
      format: {
        narrow: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
        short: ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa'],
        abbreviated: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
        wide: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
      },
      standalone: {
        narrow: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
        short: ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa'],
        abbreviated: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
        wide: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
      }
    },
    months: {
      format: {
        narrow:
            ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
        abbreviated:
            ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
        wide: [
          'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre',
          'Oktubre', 'Nobyembre', 'Disyembre'
        ]
      },
      standalone: {
        narrow: ['E', 'P', 'M', 'A', 'M', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
        abbreviated:
            ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
        wide: [
          'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre',
          'Oktubre', 'Nobyembre', 'Disyembre'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['BC', 'AD'], wide: ['BC', 'AD']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'M/d/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {
        full: '{1} \'nang\' {0}',
        long: '{1} \'nang\' {0}',
        medium: '{1}, {0}',
        short: '{1}, {0}'
      }
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '18:00'},
      midnight: '00:00',
      morning1: {from: '00:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '18:00', to: '24:00'},
      noon: '12:00'
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
  currencySettings: {symbol: '₱', name: 'Piso ng Pilipinas'},
  getPluralCase: getPluralCase
};
