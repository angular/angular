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
export const NgLocaleFoDK: NgLocale = {
  localeId: 'fo-DK',
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
        narrow: ['S', 'M', 'T', 'M', 'H', 'F', 'L'],
        short: ['su.', 'má.', 'tý.', 'mi.', 'hó.', 'fr.', 'le.'],
        abbreviated: ['sun.', 'mán.', 'týs.', 'mik.', 'hós.', 'frí.', 'ley.'],
        wide: [
          'sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur',
          'leygardagur'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'M', 'H', 'F', 'L'],
        short: ['su', 'má', 'tý', 'mi', 'hó', 'fr', 'le'],
        abbreviated: ['sun', 'mán', 'týs', 'mik', 'hós', 'frí', 'ley'],
        wide: [
          'sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur',
          'leygardagur'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.',
          'des.'
        ],
        wide: [
          'januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'desember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
        wide: [
          'januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september',
          'oktober', 'november', 'desember'
        ]
      }
    },
    eras: {
      abbreviated: ['f.Kr.', 'e.Kr.'],
      narrow: ['fKr', 'eKr'],
      wide: ['fyri Krist', 'eftir Krist']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'dd.MM.y', short: 'dd.MM.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {
        full: '{1} \'kl\'. {0}',
        long: '{1} \'kl\'. {0}',
        medium: '{1}, {0}',
        short: '{1}, {0}'
      }
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'kr.', name: 'donsk króna'},
  getPluralCase: getPluralCase
};
