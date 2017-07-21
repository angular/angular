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
export const NgLocaleBm: NgLocale = {
  localeId: 'bm',
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
        narrow: ['K', 'N', 'T', 'A', 'A', 'J', 'S'],
        short: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
        abbreviated: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
        wide: ['kari', 'ntɛnɛ', 'tarata', 'araba', 'alamisa', 'juma', 'sibiri']
      },
      standalone: {
        narrow: ['K', 'N', 'T', 'A', 'A', 'J', 'S'],
        short: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
        abbreviated: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
        wide: ['kari', 'ntɛnɛ', 'tarata', 'araba', 'alamisa', 'juma', 'sibiri']
      }
    },
    months: {
      format: {
        narrow: ['Z', 'F', 'M', 'A', 'M', 'Z', 'Z', 'U', 'S', 'Ɔ', 'N', 'D'],
        abbreviated:
            ['zan', 'feb', 'mar', 'awi', 'mɛ', 'zuw', 'zul', 'uti', 'sɛt', 'ɔku', 'now', 'des'],
        wide: [
          'zanwuye', 'feburuye', 'marisi', 'awirili', 'mɛ', 'zuwɛn', 'zuluye', 'uti', 'sɛtanburu',
          'ɔkutɔburu', 'nowanburu', 'desanburu'
        ]
      },
      standalone: {
        narrow: ['Z', 'F', 'M', 'A', 'M', 'Z', 'Z', 'U', 'S', 'Ɔ', 'N', 'D'],
        abbreviated:
            ['zan', 'feb', 'mar', 'awi', 'mɛ', 'zuw', 'zul', 'uti', 'sɛt', 'ɔku', 'now', 'des'],
        wide: [
          'zanwuye', 'feburuye', 'marisi', 'awirili', 'mɛ', 'zuwɛn', 'zuluye', 'uti', 'sɛtanburu',
          'ɔkutɔburu', 'nowanburu', 'desanburu'
        ]
      }
    },
    eras: {
      abbreviated: ['J.-C. ɲɛ', 'ni J.-C.'],
      narrow: ['J.-C. ɲɛ', 'ni J.-C.'],
      wide: ['jezu krisiti ɲɛ', 'jezu krisiti minkɛ']
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
  currencySettings: {symbol: 'CFA', name: 'sefa Fraŋ (BCEAO)'},
  getPluralCase: getPluralCase
};
