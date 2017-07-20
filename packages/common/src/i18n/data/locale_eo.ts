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
export const NgLocaleEo: NgLocale = {
  localeId: 'eo',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'atm', pm: 'ptm'},
        narrow: {am: 'atm', pm: 'ptm'},
        wide: {am: 'atm', pm: 'ptm'}
      },
      standalone: {
        abbreviated: {am: 'atm', pm: 'ptm'},
        narrow: {am: 'atm', pm: 'ptm'},
        wide: {am: 'atm', pm: 'ptm'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
        abbreviated: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
        wide: ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
        abbreviated: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
        wide: ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto',
          'septembro', 'oktobro', 'novembro', 'decembro'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto',
          'septembro', 'oktobro', 'novembro', 'decembro'
        ]
      }
    },
    eras: {abbreviated: ['aK', 'pK'], narrow: ['aK', 'pK'], wide: ['aK', 'pK']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, d-\'a\' \'de\' MMMM y',
        long: 'y-MMMM-dd',
        medium: 'y-MMM-dd',
        short: 'yy-MM-dd'
      },
      time: {
        full: 'H-\'a\' \'horo\' \'kaj\' m:ss zzzz',
        long: 'HH:mm:ss z',
        medium: 'HH:mm:ss',
        short: 'HH:mm'
      },
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {},
  getPluralCase: getPluralCase
};
