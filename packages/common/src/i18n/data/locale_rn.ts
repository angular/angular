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
export const NgLocaleRn: NgLocale = {
  localeId: 'rn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Z.MU.', pm: 'Z.MW.'},
        narrow: {am: 'Z.MU.', pm: 'Z.MW.'},
        wide: {am: 'Z.MU.', pm: 'Z.MW.'}
      },
      standalone: {
        abbreviated: {am: 'Z.MU.', pm: 'Z.MW.'},
        narrow: {am: 'Z.MU.', pm: 'Z.MW.'},
        wide: {am: 'Z.MU.', pm: 'Z.MW.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        abbreviated: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        wide: [
          'Ku w’indwi', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu',
          'Ku wa gatandatu'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        abbreviated: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        wide: [
          'Ku w’indwi', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu',
          'Ku wa gatandatu'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Mut.', 'Gas.', 'Wer.', 'Mat.', 'Gic.', 'Kam.', 'Nya.', 'Kan.', 'Nze.', 'Ukw.', 'Ugu.',
          'Uku.'
        ],
        wide: [
          'Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro',
          'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'Mut.', 'Gas.', 'Wer.', 'Mat.', 'Gic.', 'Kam.', 'Nya.', 'Kan.', 'Nze.', 'Ukw.', 'Ugu.',
          'Uku.'
        ],
        wide: [
          'Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro',
          'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'
        ]
      }
    },
    eras: {
      abbreviated: ['Mb.Y.', 'Ny.Y'],
      narrow: ['Mb.Y.', 'Ny.Y'],
      wide: ['Mbere ya Yezu', 'Nyuma ya Yezu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/y'},
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
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FBu', name: 'Ifaranga ry’Uburundi'},
  getPluralCase: getPluralCase
};
