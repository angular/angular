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
  if (i === 0 || i === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleKab: NgLocale = {
  localeId: 'kab',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'n tufat', pm: 'n tmeddit'},
        narrow: {am: 'n tufat', pm: 'n tmeddit'},
        wide: {am: 'n tufat', pm: 'n tmeddit'}
      },
      standalone: {
        abbreviated: {am: 'n tufat', pm: 'n tmeddit'},
        narrow: {am: 'n tufat', pm: 'n tmeddit'},
        wide: {am: 'n tufat', pm: 'n tmeddit'}
      }
    },
    days: {
      format: {
        narrow: ['Y', 'S', 'K', 'K', 'S', 'S', 'S'],
        short: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
        abbreviated: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
        wide: ['Yanass', 'Sanass', 'Kraḍass', 'Kuẓass', 'Samass', 'Sḍisass', 'Sayass']
      },
      standalone: {
        narrow: ['Y', 'S', 'K', 'K', 'S', 'S', 'S'],
        short: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
        abbreviated: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
        wide: ['Yanass', 'Sanass', 'Kraḍass', 'Kuẓass', 'Samass', 'Sḍisass', 'Sayass']
      }
    },
    months: {
      format: {
        narrow: ['Y', 'F', 'M', 'Y', 'M', 'Y', 'Y', 'Ɣ', 'C', 'T', 'N', 'D'],
        abbreviated:
            ['Yen', 'Fur', 'Meɣ', 'Yeb', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cte', 'Tub', 'Nun', 'Duǧ'],
        wide: [
          'Yennayer', 'Fuṛar', 'Meɣres', 'Yebrir', 'Mayyu', 'Yunyu', 'Yulyu', 'Ɣuct', 'Ctembeṛ',
          'Tubeṛ', 'Nunembeṛ', 'Duǧembeṛ'
        ]
      },
      standalone: {
        narrow: ['Y', 'F', 'M', 'Y', 'M', 'Y', 'Y', 'Ɣ', 'C', 'T', 'N', 'D'],
        abbreviated:
            ['Yen', 'Fur', 'Meɣ', 'Yeb', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cte', 'Tub', 'Nun', 'Duǧ'],
        wide: [
          'Yennayer', 'Fuṛar', 'Meɣres', 'Yebrir', 'Mayyu', 'Yunyu', 'Yulyu', 'Ɣuct', 'Ctembeṛ',
          'Tubeṛ', 'Nunembeṛ', 'Duǧembeṛ'
        ]
      }
    },
    eras: {
      abbreviated: ['snd. T.Ɛ', 'sld. T.Ɛ'],
      narrow: ['snd. T.Ɛ', 'sld. T.Ɛ'],
      wide: ['send talalit n Ɛisa', 'seld talalit n Ɛisa']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 6],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM, y', short: 'd/M/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: ' ',
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
  currencySettings: {symbol: 'DA', name: 'Adinar Azzayri'},
  getPluralCase: getPluralCase
};
