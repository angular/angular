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
export const NgLocaleLuo: NgLocale = {
  localeId: 'luo',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'OD', pm: 'OT'},
        narrow: {am: 'OD', pm: 'OT'},
        wide: {am: 'OD', pm: 'OT'}
      },
      standalone: {
        abbreviated: {am: 'OD', pm: 'OT'},
        narrow: {am: 'OD', pm: 'OT'},
        wide: {am: 'OD', pm: 'OT'}
      }
    },
    days: {
      format: {
        narrow: ['J', 'W', 'T', 'T', 'T', 'T', 'N'],
        short: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
        abbreviated: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
        wide: [
          'Jumapil', 'Wuok Tich', 'Tich Ariyo', 'Tich Adek', 'Tich Ang’wen', 'Tich Abich', 'Ngeso'
        ]
      },
      standalone: {
        narrow: ['J', 'W', 'T', 'T', 'T', 'T', 'N'],
        short: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
        abbreviated: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
        wide: [
          'Jumapil', 'Wuok Tich', 'Tich Ariyo', 'Tich Adek', 'Tich Ang’wen', 'Tich Abich', 'Ngeso'
        ]
      }
    },
    months: {
      format: {
        narrow: ['C', 'R', 'D', 'N', 'B', 'U', 'B', 'B', 'C', 'P', 'C', 'P'],
        abbreviated:
            ['DAC', 'DAR', 'DAD', 'DAN', 'DAH', 'DAU', 'DAO', 'DAB', 'DOC', 'DAP', 'DGI', 'DAG'],
        wide: [
          'Dwe mar Achiel', 'Dwe mar Ariyo', 'Dwe mar Adek', 'Dwe mar Ang’wen', 'Dwe mar Abich',
          'Dwe mar Auchiel', 'Dwe mar Abiriyo', 'Dwe mar Aboro', 'Dwe mar Ochiko', 'Dwe mar Apar',
          'Dwe mar gi achiel', 'Dwe mar Apar gi ariyo'
        ]
      },
      standalone: {
        narrow: ['C', 'R', 'D', 'N', 'B', 'U', 'B', 'B', 'C', 'P', 'C', 'P'],
        abbreviated:
            ['DAC', 'DAR', 'DAD', 'DAN', 'DAH', 'DAU', 'DAO', 'DAB', 'DOC', 'DAP', 'DGI', 'DAG'],
        wide: [
          'Dwe mar Achiel', 'Dwe mar Ariyo', 'Dwe mar Adek', 'Dwe mar Ang’wen', 'Dwe mar Abich',
          'Dwe mar Auchiel', 'Dwe mar Abiriyo', 'Dwe mar Aboro', 'Dwe mar Ochiko', 'Dwe mar Apar',
          'Dwe mar gi achiel', 'Dwe mar Apar gi ariyo'
        ]
      }
    },
    eras: {
      abbreviated: ['BC', 'AD'],
      narrow: ['BC', 'AD'],
      wide: ['Kapok Kristo obiro', 'Ka Kristo osebiro']
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
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Ksh', name: 'Siling mar Kenya'},
  getPluralCase: getPluralCase
};
