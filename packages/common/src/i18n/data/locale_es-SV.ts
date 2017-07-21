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
export const NgLocaleEsSV: NgLocale = {
  localeId: 'es-SV',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'a. m.',
          noon: 'del mediodía',
          pm: 'p. m.',
          morning1: 'de la madrugada',
          morning2: 'de la mañana',
          evening1: 'de la tarde',
          night1: 'de la noche'
        },
        narrow: {
          am: 'a. m.',
          noon: 'del mediodía',
          pm: 'p. m.',
          morning1: 'de la madrugada',
          morning2: 'de la mañana',
          evening1: 'de la tarde',
          night1: 'de la noche'
        },
        wide: {
          am: 'a. m.',
          noon: 'del mediodía',
          pm: 'p. m.',
          morning1: 'de la madrugada',
          morning2: 'de la mañana',
          evening1: 'de la tarde',
          night1: 'de la noche'
        }
      },
      standalone: {
        abbreviated: {
          am: 'a. m.',
          noon: 'mediodía',
          pm: 'p. m.',
          morning1: 'madrugada',
          morning2: 'mañana',
          evening1: 'tarde',
          night1: 'noche'
        },
        narrow: {
          am: 'a. m.',
          noon: 'mediodía',
          pm: 'p. m.',
          morning1: 'madrugada',
          morning2: 'mañana',
          evening1: 'tarde',
          night1: 'noche'
        },
        wide: {
          am: 'a. m.',
          noon: 'mediodía',
          pm: 'p. m.',
          morning1: 'madrugada',
          morning2: 'mañana',
          evening1: 'tarde',
          night1: 'noche'
        }
      }
    },
    days: {
      format: {
        narrow: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
        short: ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'],
        abbreviated: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
        wide: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        short: ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'],
        abbreviated: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
        wide: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      }
    },
    months: {
      format: {
        narrow: ['e', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.',
          'dic.'
        ],
        wide: [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
          'octubre', 'noviembre', 'diciembre'
        ]
      },
      standalone: {
        narrow: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.',
          'dic.'
        ],
        wide: [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
          'octubre', 'noviembre', 'diciembre'
        ]
      }
    },
    eras: {
      abbreviated: ['a. C.', 'd. C.'],
      narrow: ['a. C.', 'd. C.'],
      wide: ['antes de Cristo', 'después de Cristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d \'de\' MMMM \'de\' y',
        long: 'd \'de\' MMMM \'de\' y',
        medium: 'd MMM y',
        short: 'd/M/yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      evening1: {from: '12:00', to: '20:00'},
      morning1: {from: '00:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '20:00', to: '24:00'},
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '$', name: 'dólar estadounidense'},
  getPluralCase: getPluralCase
};
