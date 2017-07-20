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
export const NgLocaleItSM: NgLocale = {
  localeId: 'it-SM',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'mezzanotte',
          am: 'AM',
          noon: 'mezzogiorno',
          pm: 'PM',
          morning1: 'di mattina',
          afternoon1: 'del pomeriggio',
          evening1: 'di sera',
          night1: 'di notte'
        },
        narrow: {
          midnight: 'mezzanotte',
          am: 'm.',
          noon: 'mezzogiorno',
          pm: 'p.',
          morning1: 'mattina',
          afternoon1: 'pomeriggio',
          evening1: 'sera',
          night1: 'notte'
        },
        wide: {
          midnight: 'mezzanotte',
          am: 'AM',
          noon: 'mezzogiorno',
          pm: 'PM',
          morning1: 'di mattina',
          afternoon1: 'del pomeriggio',
          evening1: 'di sera',
          night1: 'di notte'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'mezzanotte',
          am: 'AM',
          noon: 'mezzogiorno',
          pm: 'PM',
          morning1: 'mattina',
          afternoon1: 'pomeriggio',
          evening1: 'sera',
          night1: 'notte'
        },
        narrow: {
          midnight: 'mezzanotte',
          am: 'm.',
          noon: 'mezzogiorno',
          pm: 'p.',
          morning1: 'mattina',
          afternoon1: 'pomeriggio',
          evening1: 'sera',
          night1: 'notte'
        },
        wide: {
          midnight: 'mezzanotte',
          am: 'AM',
          noon: 'mezzogiorno',
          pm: 'PM',
          morning1: 'mattina',
          afternoon1: 'pomeriggio',
          evening1: 'sera',
          night1: 'notte'
        }
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
        short: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        abbreviated: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        wide: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
        short: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        abbreviated: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        wide: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
      }
    },
    months: {
      format: {
        narrow: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
        wide: [
          'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto',
          'settembre', 'ottobre', 'novembre', 'dicembre'
        ]
      },
      standalone: {
        narrow: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
        wide: [
          'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto',
          'settembre', 'ottobre', 'novembre', 'dicembre'
        ]
      }
    },
    eras: {
      abbreviated: ['a.C.', 'd.C.'],
      narrow: ['aC', 'dC'],
      wide: ['avanti Cristo', 'dopo Cristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'dd MMM y', short: 'dd/MM/yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
