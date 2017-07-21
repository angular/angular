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
export const NgLocaleGl: NgLocale = {
  localeId: 'gl',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'da noite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'da madrugada',
          morning2: 'da mañá',
          afternoon1: 'do mediodía',
          evening1: 'da tarde',
          night1: 'da noite'
        },
        narrow: {
          midnight: 'da noite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'da madrugada',
          morning2: 'da mañá',
          afternoon1: 'do mediodía',
          evening1: 'da tarde',
          night1: 'da noite'
        },
        wide: {
          midnight: 'da noite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'da madrugada',
          morning2: 'da mañá',
          afternoon1: 'do mediodía',
          evening1: 'da tarde',
          night1: 'da noite'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'medianoite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'madrugada',
          morning2: 'mañá',
          afternoon1: 'mediodía',
          evening1: 'tarde',
          night1: 'noite'
        },
        narrow: {
          midnight: 'medianoite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'madrugada',
          morning2: 'mañá',
          afternoon1: 'mediodía',
          evening1: 'tarde',
          night1: 'noite'
        },
        wide: {
          midnight: 'medianoite',
          am: 'a.m.',
          pm: 'p.m.',
          morning1: 'madrugada',
          morning2: 'mañá',
          afternoon1: 'mediodía',
          evening1: 'tarde',
          night1: 'noite'
        }
      }
    },
    days: {
      format: {
        narrow: ['d.', 'l.', 'm.', 'm.', 'x.', 'v.', 's.'],
        short: ['dom.', 'luns', 'mar.', 'mér.', 'xov.', 'ven.', 'sáb.'],
        abbreviated: ['dom.', 'luns', 'mar.', 'mér.', 'xov.', 'ven.', 'sáb.'],
        wide: ['domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
        short: ['Do', 'Lu', 'Ma', 'Mé', 'Xo', 'Ve', 'Sá'],
        abbreviated: ['Dom.', 'Luns', 'Mar.', 'Mér.', 'Xov.', 'Ven.', 'Sáb.'],
        wide: ['Domingo', 'Luns', 'Martes', 'Mércores', 'Xoves', 'Venres', 'Sábado']
      }
    },
    months: {
      format: {
        narrow: ['x.', 'f.', 'm.', 'a.', 'm.', 'x.', 'x.', 'a.', 's.', 'o.', 'n.', 'd.'],
        abbreviated: [
          'xan.', 'feb.', 'mar.', 'abr.', 'maio', 'xuño', 'xul.', 'ago.', 'set.', 'out.', 'nov.',
          'dec.'
        ],
        wide: [
          'xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño', 'xullo', 'agosto', 'setembro',
          'outubro', 'novembro', 'decembro'
        ]
      },
      standalone: {
        narrow: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Xan.', 'Feb.', 'Mar.', 'Abr.', 'Maio', 'Xuño', 'Xul.', 'Ago.', 'Set.', 'Out.', 'Nov.',
          'Dec.'
        ],
        wide: [
          'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño', 'Xullo', 'Agosto', 'Setembro',
          'Outubro', 'Novembro', 'Decembro'
        ]
      }
    },
    eras: {
      abbreviated: ['a.C.', 'd.C.'],
      narrow: ['a.C.', 'd.C.'],
      wide: ['antes de Cristo', 'despois de Cristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d \'de\' MMMM \'de\' y',
        long: 'd \'de\' MMMM \'de\' y',
        medium: 'd \'de\' MMM \'de\' y',
        short: 'dd/MM/yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{0} \'do\' {1}', long: '{0} \'do\' {1}', medium: '{0}, {1}', short: '{0}, {1}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '13:00'},
      evening1: {from: '13:00', to: '21:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
