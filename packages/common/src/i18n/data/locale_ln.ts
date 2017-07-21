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
  if (n === Math.floor(n) && n >= 0 && n <= 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleLn: NgLocale = {
  localeId: 'ln',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'},
        narrow: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'},
        wide: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'}
      },
      standalone: {
        abbreviated: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'},
        narrow: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'},
        wide: {am: 'ntɔ́ngɔ́', pm: 'mpókwa'}
      }
    },
    days: {
      format: {
        narrow: ['e', 'y', 'm', 'm', 'm', 'm', 'p'],
        short: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
        abbreviated: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
        wide: [
          'eyenga', 'mokɔlɔ mwa yambo', 'mokɔlɔ mwa míbalé', 'mokɔlɔ mwa mísáto', 'mokɔlɔ ya mínéi',
          'mokɔlɔ ya mítáno', 'mpɔ́sɔ'
        ]
      },
      standalone: {
        narrow: ['e', 'y', 'm', 'm', 'm', 'm', 'p'],
        short: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
        abbreviated: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
        wide: [
          'eyenga', 'mokɔlɔ mwa yambo', 'mokɔlɔ mwa míbalé', 'mokɔlɔ mwa mísáto', 'mokɔlɔ ya mínéi',
          'mokɔlɔ ya mítáno', 'mpɔ́sɔ'
        ]
      }
    },
    months: {
      format: {
        narrow: ['y', 'f', 'm', 'a', 'm', 'y', 'y', 'a', 's', 'ɔ', 'n', 'd'],
        abbreviated:
            ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul', 'agt', 'stb', 'ɔtb', 'nvb', 'dsb'],
        wide: [
          'sánzá ya yambo', 'sánzá ya míbalé', 'sánzá ya mísáto', 'sánzá ya mínei',
          'sánzá ya mítáno', 'sánzá ya motóbá', 'sánzá ya nsambo', 'sánzá ya mwambe',
          'sánzá ya libwa', 'sánzá ya zómi', 'sánzá ya zómi na mɔ̌kɔ́', 'sánzá ya zómi na míbalé'
        ]
      },
      standalone: {
        narrow: ['y', 'f', 'm', 'a', 'm', 'y', 'y', 'a', 's', 'ɔ', 'n', 'd'],
        abbreviated:
            ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul', 'agt', 'stb', 'ɔtb', 'nvb', 'dsb'],
        wide: [
          'sánzá ya yambo', 'sánzá ya míbalé', 'sánzá ya mísáto', 'sánzá ya mínei',
          'sánzá ya mítáno', 'sánzá ya motóbá', 'sánzá ya nsambo', 'sánzá ya mwambe',
          'sánzá ya libwa', 'sánzá ya zómi', 'sánzá ya zómi na mɔ̌kɔ́', 'sánzá ya zómi na míbalé'
        ]
      }
    },
    eras: {
      abbreviated: ['libóso ya', 'nsima ya Y'],
      narrow: ['libóso ya', 'nsima ya Y'],
      wide: ['Yambo ya Yézu Krís', 'Nsima ya Yézu Krís']
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FC', name: 'Falánga ya Kongó'},
  getPluralCase: getPluralCase
};
