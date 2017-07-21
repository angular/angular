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
  if (n === Math.floor(n) && n >= 0 && n <= 2 && !(n === 2)) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocalePtMO: NgLocale = {
  localeId: 'pt-MO',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'meia-noite',
          am: 'a.m.',
          noon: 'meio-dia',
          pm: 'p.m.',
          morning1: 'da manhã',
          afternoon1: 'da tarde',
          evening1: 'da noite',
          night1: 'da madrugada'
        },
        narrow: {
          midnight: 'meia-noite',
          am: 'a.m.',
          noon: 'meio-dia',
          pm: 'p.m.',
          morning1: 'manhã',
          afternoon1: 'tarde',
          evening1: 'noite',
          night1: 'madrugada'
        },
        wide: {
          midnight: 'meia-noite',
          am: 'da manhã',
          noon: 'meio-dia',
          pm: 'da tarde',
          morning1: 'da manhã',
          afternoon1: 'da tarde',
          evening1: 'da noite',
          night1: 'da madrugada'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'meia-noite',
          am: 'a.m.',
          noon: 'meio-dia',
          pm: 'p.m.',
          morning1: 'manhã',
          afternoon1: 'tarde',
          evening1: 'noite',
          night1: 'madrugada'
        },
        narrow: {
          midnight: 'meia-noite',
          am: 'a.m.',
          noon: 'meio-dia',
          pm: 'p.m.',
          morning1: 'manhã',
          afternoon1: 'tarde',
          evening1: 'noite',
          night1: 'madrugada'
        },
        wide: {
          midnight: 'meia-noite',
          am: 'manhã',
          noon: 'meio-dia',
          pm: 'tarde',
          morning1: 'manhã',
          afternoon1: 'tarde',
          evening1: 'noite',
          night1: 'madrugada'
        }
      }
    },
    days: {
      format: {
        narrow: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        short: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        abbreviated: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        wide: [
          'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira',
          'sábado'
        ]
      },
      standalone: {
        narrow: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        short: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        abbreviated: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        wide: [
          'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira',
          'sábado'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        wide: [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
          'outubro', 'novembro', 'dezembro'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        wide: [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
          'outubro', 'novembro', 'dezembro'
        ]
      }
    },
    eras: {
      abbreviated: ['a.C.', 'd.C.'],
      narrow: ['a.C.', 'd.C.'],
      wide: ['antes de Cristo', 'depois de Cristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d \'de\' MMMM \'de\' y',
        long: 'd \'de\' MMMM \'de\' y',
        medium: 'dd/MM/y',
        short: 'dd/MM/yy'
      },
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime:
          {full: '{1} \'às\' {0}', long: '{1} \'às\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '19:00'},
      evening1: {from: '19:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
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
  currencySettings: {symbol: 'MOP$', name: 'Pataca de Macau'},
  getPluralCase: getPluralCase
};
