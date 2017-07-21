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
export const NgLocaleFy: NgLocale = {
  localeId: 'fy',
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
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
        abbreviated: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
        wide: ['snein', 'moandei', 'tiisdei', 'woansdei', 'tongersdei', 'freed', 'sneon']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
        abbreviated: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
        wide: ['snein', 'moandei', 'tiisdei', 'woansdei', 'tongersdei', 'freed', 'sneon']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mrt', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Jannewaris', 'Febrewaris', 'Maart', 'April', 'Maaie', 'Juny', 'July', 'Augustus',
          'Septimber', 'Oktober', 'Novimber', 'Desimber'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mrt', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Jannewaris', 'Febrewaris', 'Maart', 'April', 'Maaie', 'Juny', 'July', 'Augustus',
          'Septimber', 'Oktober', 'Novimber', 'Desimber'
        ]
      }
    },
    eras: {
      abbreviated: ['f.Kr.', 'n.Kr.'],
      narrow: ['f.K.', 'n.K.'],
      wide: ['Foar Kristus', 'nei Kristus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd-MM-yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'om\' {0}', long: '{1} \'om\' {0}', medium: '{1} {0}', short: '{1} {0}'}
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
      currency: '¤ #,##0.00;¤ #,##0.00-',
      decimal: '#,##0.###',
      percent: '#,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
