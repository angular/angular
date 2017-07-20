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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSg: NgLocale = {
  localeId: 'sg',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ND', pm: 'LK'},
        narrow: {am: 'ND', pm: 'LK'},
        wide: {am: 'ND', pm: 'LK'}
      },
      standalone: {
        abbreviated: {am: 'ND', pm: 'LK'},
        narrow: {am: 'ND', pm: 'LK'},
        wide: {am: 'ND', pm: 'LK'}
      }
    },
    days: {
      format: {
        narrow: ['K', 'S', 'T', 'S', 'K', 'P', 'Y'],
        short: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
        abbreviated: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
        wide: [
          'Bikua-ôko', 'Bïkua-ûse', 'Bïkua-ptâ', 'Bïkua-usïö', 'Bïkua-okü', 'Lâpôsö', 'Lâyenga'
        ]
      },
      standalone: {
        narrow: ['K', 'S', 'T', 'S', 'K', 'P', 'Y'],
        short: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
        abbreviated: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
        wide: [
          'Bikua-ôko', 'Bïkua-ûse', 'Bïkua-ptâ', 'Bïkua-usïö', 'Bïkua-okü', 'Lâpôsö', 'Lâyenga'
        ]
      }
    },
    months: {
      format: {
        narrow: ['N', 'F', 'M', 'N', 'B', 'F', 'L', 'K', 'M', 'N', 'N', 'K'],
        abbreviated:
            ['Nye', 'Ful', 'Mbä', 'Ngu', 'Bêl', 'Fön', 'Len', 'Kük', 'Mvu', 'Ngb', 'Nab', 'Kak'],
        wide: [
          'Nyenye', 'Fulundïgi', 'Mbängü', 'Ngubùe', 'Bêläwü', 'Föndo', 'Lengua', 'Kükürü', 'Mvuka',
          'Ngberere', 'Nabändüru', 'Kakauka'
        ]
      },
      standalone: {
        narrow: ['N', 'F', 'M', 'N', 'B', 'F', 'L', 'K', 'M', 'N', 'N', 'K'],
        abbreviated:
            ['Nye', 'Ful', 'Mbä', 'Ngu', 'Bêl', 'Fön', 'Len', 'Kük', 'Mvu', 'Ngb', 'Nab', 'Kak'],
        wide: [
          'Nyenye', 'Fulundïgi', 'Mbängü', 'Ngubùe', 'Bêläwü', 'Föndo', 'Lengua', 'Kükürü', 'Mvuka',
          'Ngberere', 'Nabändüru', 'Kakauka'
        ]
      }
    },
    eras: {
      abbreviated: ['KnK', 'NpK'],
      narrow: ['KnK', 'NpK'],
      wide: ['Kôzo na Krîstu', 'Na pekô tî Krîstu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM, y', short: 'd/M/y'},
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
    formats: {
      currency: '¤#,##0.00;¤-#,##0.00',
      decimal: '#,##0.###',
      percent: '#,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: 'FCFA', name: 'farânga CFA (BEAC)'},
  getPluralCase: getPluralCase
};
