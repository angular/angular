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
export const NgLocaleRw: NgLocale = {
  localeId: 'rw',
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
        short: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        abbreviated: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        wide: [
          'Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu', 'Kuwa kane', 'Kuwa gatanu',
          'Kuwa gatandatu'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        abbreviated: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
        wide: [
          'Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu', 'Kuwa kane', 'Kuwa gatanu',
          'Kuwa gatandatu'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'mut.', 'gas.', 'wer.', 'mat.', 'gic.', 'kam.', 'nya.', 'kan.', 'nze.', 'ukw.', 'ugu.',
          'uku.'
        ],
        wide: [
          'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicuransi', 'Kamena', 'Nyakanga', 'Kanama',
          'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'mut.', 'gas.', 'wer.', 'mat.', 'gic.', 'kam.', 'nya.', 'kan.', 'nze.', 'ukw.', 'ugu.',
          'uku.'
        ],
        wide: [
          'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicuransi', 'Kamena', 'Nyakanga', 'Kanama',
          'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
  currencySettings: {symbol: 'RF', name: 'RWF'},
  getPluralCase: getPluralCase
};
