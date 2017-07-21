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
export const NgLocaleKkj: NgLocale = {
  localeId: 'kkj',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['so', 'lu', 'ma', 'mɛ', 'ye', 'va', 'ms'],
        short: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
        abbreviated: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
        wide: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi']
      },
      standalone: {
        narrow: ['so', 'lu', 'ma', 'mɛ', 'ye', 'va', 'ms'],
        short: ['so', 'lu', 'ma', 'mɛ', 'ye', 'va', 'ms'],
        abbreviated: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
        wide: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja',
          'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'
        ],
        wide: [
          'pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja',
          'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja',
          'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'
        ],
        wide: [
          'pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja',
          'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE dd MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'Franc CFA'},
  getPluralCase: getPluralCase
};
