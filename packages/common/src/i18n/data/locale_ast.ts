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
export const NgLocaleAst: NgLocale = {
  localeId: 'ast',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'de la mañana', pm: 'de la tarde'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'mañana', pm: 'tarde'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
        short: ['do', 'll', 'ma', 'mi', 'xu', 'vi', 'sá'],
        abbreviated: ['dom', 'llu', 'mar', 'mié', 'xue', 'vie', 'sáb'],
        wide: ['domingu', 'llunes', 'martes', 'miércoles', 'xueves', 'vienres', 'sábadu']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
        short: ['do', 'll', 'ma', 'mi', 'xu', 'vi', 'sá'],
        abbreviated: ['dom', 'llu', 'mar', 'mié', 'xue', 'vie', 'sáb'],
        wide: ['domingu', 'llunes', 'martes', 'miércoles', 'xueves', 'vienres', 'sábadu']
      }
    },
    months: {
      format: {
        narrow: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'P', 'A'],
        abbreviated:
            ['xin', 'feb', 'mar', 'abr', 'may', 'xun', 'xnt', 'ago', 'set', 'och', 'pay', 'avi'],
        wide: [
          'de xineru', 'de febreru', 'de marzu', 'd’abril', 'de mayu', 'de xunu', 'de xunetu',
          'd’agostu', 'de setiembre', 'd’ochobre', 'de payares', 'd’avientu'
        ]
      },
      standalone: {
        narrow: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'P', 'A'],
        abbreviated:
            ['Xin', 'Feb', 'Mar', 'Abr', 'May', 'Xun', 'Xnt', 'Ago', 'Set', 'Och', 'Pay', 'Avi'],
        wide: [
          'xineru', 'febreru', 'marzu', 'abril', 'mayu', 'xunu', 'xunetu', 'agostu', 'setiembre',
          'ochobre', 'payares', 'avientu'
        ]
      }
    },
    eras: {
      abbreviated: ['e.C.', 'd.C.'],
      narrow: ['e.C.', 'd.C.'],
      wide: ['enantes de Cristu', 'después de Cristu']
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
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {
        full: '{1} \'a\' \'les\' {0}',
        long: '{1} \'a\' \'les\' {0}',
        medium: '{1}, {0}',
        short: '{1} {0}'
      }
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
      nan: 'ND',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
