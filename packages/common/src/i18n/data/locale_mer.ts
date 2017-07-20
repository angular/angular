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
export const NgLocaleMer: NgLocale = {
  localeId: 'mer',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'RŨ', pm: 'ŨG'},
        narrow: {am: 'RŨ', pm: 'ŨG'},
        wide: {am: 'RŨ', pm: 'ŨG'}
      },
      standalone: {
        abbreviated: {am: 'RŨ', pm: 'ŨG'},
        narrow: {am: 'RŨ', pm: 'ŨG'},
        wide: {am: 'RŨ', pm: 'ŨG'}
      }
    },
    days: {
      format: {
        narrow: ['K', 'M', 'W', 'W', 'W', 'W', 'J'],
        short: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
        abbreviated: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
        wide: ['Kiumia', 'Muramuko', 'Wairi', 'Wethatu', 'Wena', 'Wetano', 'Jumamosi']
      },
      standalone: {
        narrow: ['K', 'M', 'W', 'W', 'W', 'W', 'J'],
        short: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
        abbreviated: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
        wide: ['Kiumia', 'Muramuko', 'Wairi', 'Wethatu', 'Wena', 'Wetano', 'Jumamosi']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'Ĩ', 'M', 'N', 'N', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['JAN', 'FEB', 'MAC', 'ĨPU', 'MĨĨ', 'NJU', 'NJR', 'AGA', 'SPT', 'OKT', 'NOV', 'DEC'],
        wide: [
          'Januarĩ', 'Feburuarĩ', 'Machi', 'Ĩpurũ', 'Mĩĩ', 'Njuni', 'Njuraĩ', 'Agasti', 'Septemba',
          'Oktũba', 'Novemba', 'Dicemba'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'Ĩ', 'M', 'N', 'N', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['JAN', 'FEB', 'MAC', 'ĨPU', 'MĨĨ', 'NJU', 'NJR', 'AGA', 'SPT', 'OKT', 'NOV', 'DEC'],
        wide: [
          'Januarĩ', 'Feburuarĩ', 'Machi', 'Ĩpurũ', 'Mĩĩ', 'Njuni', 'Njuraĩ', 'Agasti', 'Septemba',
          'Oktũba', 'Novemba', 'Dicemba'
        ]
      }
    },
    eras: {
      abbreviated: ['MK', 'NK'],
      narrow: ['MK', 'NK'],
      wide: ['Mbere ya Kristũ', 'Nyuma ya Kristũ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Ksh', name: 'Shilingi ya Kenya'},
  getPluralCase: getPluralCase
};
