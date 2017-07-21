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
  if (!(v === 0) || n === 0 ||
      !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
    return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleRoMD: NgLocale = {
  localeId: 'ro-MD',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineața',
          afternoon1: 'după-amiaza',
          evening1: 'seara',
          night1: 'noaptea'
        },
        narrow: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineață',
          afternoon1: 'după-amiază',
          evening1: 'seară',
          night1: 'noapte'
        },
        wide: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineața',
          afternoon1: 'după-amiaza',
          evening1: 'seara',
          night1: 'noaptea'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineața',
          afternoon1: 'după-amiaza',
          evening1: 'seara',
          night1: 'noaptea'
        },
        narrow: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineață',
          afternoon1: 'după-amiază',
          evening1: 'seară',
          night1: 'noapte'
        },
        wide: {
          midnight: 'miezul nopții',
          am: 'a.m.',
          noon: 'amiază',
          pm: 'p.m.',
          morning1: 'dimineața',
          afternoon1: 'după-amiaza',
          evening1: 'seara',
          night1: 'noaptea'
        }
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
        short: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
        abbreviated: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
        wide: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']
      },
      standalone: {
        narrow: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
        short: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
        abbreviated: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
        wide: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']
      }
    },
    months: {
      format: {
        narrow: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.',
          'dec.'
        ],
        wide: [
          'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august',
          'septembrie', 'octombrie', 'noiembrie', 'decembrie'
        ]
      },
      standalone: {
        narrow: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.',
          'dec.'
        ],
        wide: [
          'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august',
          'septembrie', 'octombrie', 'noiembrie', 'decembrie'
        ]
      }
    },
    eras: {
      abbreviated: ['î.Hr.', 'd.Hr.'],
      narrow: ['î.Hr.', 'd.Hr.'],
      wide: ['înainte de Hristos', 'după Hristos']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd.MM.y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '12:00'},
      night1: {from: '22:00', to: '05:00'},
      noon: '12:00'
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'L', name: 'leu moldovenesc'},
  getPluralCase: getPluralCase
};
