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
export const NgLocaleEl: NgLocale = {
  localeId: 'el',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'π.μ.',
          pm: 'μ.μ.',
          morning1: 'πρωί',
          afternoon1: 'μεσημ.',
          evening1: 'απόγ.',
          night1: 'βράδυ'
        },
        narrow: {
          am: 'πμ',
          pm: 'μμ',
          morning1: 'πρωί',
          afternoon1: 'μεσημ.',
          evening1: 'απόγ.',
          night1: 'βράδυ'
        },
        wide: {
          am: 'π.μ.',
          pm: 'μ.μ.',
          morning1: 'πρωί',
          afternoon1: 'μεσημέρι',
          evening1: 'απόγευμα',
          night1: 'βράδυ'
        }
      },
      standalone: {
        abbreviated: {
          am: 'π.μ.',
          pm: 'μ.μ.',
          morning1: 'πρωί',
          afternoon1: 'μεσημ.',
          evening1: 'απόγ.',
          night1: 'βράδυ'
        },
        narrow: {
          am: 'π.μ.',
          pm: 'μ.μ.',
          morning1: 'πρωί',
          afternoon1: 'μεσημ.',
          evening1: 'απόγ.',
          night1: 'βράδυ'
        },
        wide: {
          am: 'π.μ.',
          pm: 'μ.μ.',
          morning1: 'πρωί',
          afternoon1: 'μεσημέρι',
          evening1: 'απόγευμα',
          night1: 'βράδυ'
        }
      }
    },
    days: {
      format: {
        narrow: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
        short: ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πέ', 'Πα', 'Σά'],
        abbreviated: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
        wide: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
      },
      standalone: {
        narrow: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
        short: ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πέ', 'Πα', 'Σά'],
        abbreviated: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
        wide: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
      }
    },
    months: {
      format: {
        narrow: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'Δ'],
        abbreviated:
            ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
        wide: [
          'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου',
          'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'
        ]
      },
      standalone: {
        narrow: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'Δ'],
        abbreviated:
            ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'],
        wide: [
          'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος',
          'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
        ]
      }
    },
    eras: {
      abbreviated: ['π.Χ.', 'μ.Χ.'],
      narrow: ['π.Χ.', 'μ.Χ.'],
      wide: ['προ Χριστού', 'μετά Χριστόν']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} - {0}', long: '{1} - {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '17:00'},
      evening1: {from: '17:00', to: '20:00'},
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '20:00', to: '04:00'}
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
      exponential: 'e',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Ευρώ'},
  getPluralCase: getPluralCase
};
