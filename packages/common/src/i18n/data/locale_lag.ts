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
  let i = Math.floor(Math.abs(n));
  if (n === 0) return Plural.Zero;
  if ((i === 0 || i === 1) && !(n === 0)) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleLag: NgLocale = {
  localeId: 'lag',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'TOO', pm: 'MUU'},
        narrow: {am: 'TOO', pm: 'MUU'},
        wide: {am: 'TOO', pm: 'MUU'}
      },
      standalone: {
        abbreviated: {am: 'TOO', pm: 'MUU'},
        narrow: {am: 'TOO', pm: 'MUU'},
        wide: {am: 'TOO', pm: 'MUU'}
      }
    },
    days: {
      format: {
        narrow: ['P', 'T', 'E', 'O', 'A', 'I', 'M'],
        short: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
        abbreviated: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
        wide: ['Jumapíiri', 'Jumatátu', 'Jumaíne', 'Jumatáano', 'Alamíisi', 'Ijumáa', 'Jumamóosi']
      },
      standalone: {
        narrow: ['P', 'T', 'E', 'O', 'A', 'I', 'M'],
        short: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
        abbreviated: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
        wide:
            ['Jumapíiri', 'Jumatátu', 'Jumaíne', 'Jumatáano', 'Alamíisi', 'Ijumáa', 'Jumamóosi']
      }
    },
    months: {
      format: {
        narrow: ['F', 'N', 'K', 'I', 'I', 'I', 'M', 'V', 'S', 'I', 'S', 'S'],
        abbreviated: [
          'Fúngatɨ', 'Naanɨ', 'Keenda', 'Ikúmi', 'Inyambala', 'Idwaata', 'Mʉʉnchɨ', 'Vɨɨrɨ',
          'Saatʉ', 'Inyi', 'Saano', 'Sasatʉ'
        ],
        wide: [
          'Kʉfúngatɨ', 'Kʉnaanɨ', 'Kʉkeenda', 'Kwiikumi', 'Kwiinyambála', 'Kwiidwaata', 'Kʉmʉʉnchɨ',
          'Kʉvɨɨrɨ', 'Kʉsaatʉ', 'Kwiinyi', 'Kʉsaano', 'Kʉsasatʉ'
        ]
      },
      standalone: {
        narrow: ['F', 'N', 'K', 'I', 'I', 'I', 'M', 'V', 'S', 'I', 'S', 'S'],
        abbreviated: [
          'Fúngatɨ', 'Naanɨ', 'Keenda', 'Ikúmi', 'Inyambala', 'Idwaata', 'Mʉʉnchɨ', 'Vɨɨrɨ',
          'Saatʉ', 'Inyi', 'Saano', 'Sasatʉ'
        ],
        wide: [
          'Kʉfúngatɨ', 'Kʉnaanɨ', 'Kʉkeenda', 'Kwiikumi', 'Kwiinyambála', 'Kwiidwaata', 'Kʉmʉʉnchɨ',
          'Kʉvɨɨrɨ', 'Kʉsaatʉ', 'Kwiinyi', 'Kʉsaano', 'Kʉsasatʉ'
        ]
      }
    },
    eras: {
      abbreviated: ['KSA', 'KA'],
      narrow: ['KSA', 'KA'],
      wide: ['Kɨrɨsitʉ sɨ anavyaal', 'Kɨrɨsitʉ akavyaalwe']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'TSh', name: 'Shilíingi ya Taansanía'},
  getPluralCase: getPluralCase
};
