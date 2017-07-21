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
export const NgLocaleEwo: NgLocale = {
  localeId: 'ewo',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'kíkíríg', pm: 'ngəgógəle'},
        narrow: {am: 'kíkíríg', pm: 'ngəgógəle'},
        wide: {am: 'kíkíríg', pm: 'ngəgógəle'}
      },
      standalone: {
        abbreviated: {am: 'kíkíríg', pm: 'ngəgógəle'},
        narrow: {am: 'kíkíríg', pm: 'ngəgógəle'},
        wide: {am: 'kíkíríg', pm: 'ngəgógəle'}
      }
    },
    days: {
      format: {
        narrow: ['s', 'm', 's', 's', 's', 'f', 's'],
        short: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
        abbreviated: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
        wide: [
          'sɔ́ndɔ', 'mɔ́ndi', 'sɔ́ndɔ məlú mə́bɛ̌', 'sɔ́ndɔ məlú mə́lɛ́', 'sɔ́ndɔ məlú mə́nyi', 'fúladé',
          'séradé'
        ]
      },
      standalone: {
        narrow: ['s', 'm', 's', 's', 's', 'f', 's'],
        short: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
        abbreviated: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
        wide: [
          'sɔ́ndɔ', 'mɔ́ndi', 'sɔ́ndɔ məlú mə́bɛ̌', 'sɔ́ndɔ məlú mə́lɛ́', 'sɔ́ndɔ məlú mə́nyi', 'fúladé',
          'séradé'
        ]
      }
    },
    months: {
      format: {
        narrow: ['o', 'b', 'l', 'n', 't', 's', 'z', 'm', 'e', 'a', 'd', 'b'],
        abbreviated:
            ['ngo', 'ngb', 'ngl', 'ngn', 'ngt', 'ngs', 'ngz', 'ngm', 'nge', 'nga', 'ngad', 'ngab'],
        wide: [
          'ngɔn osú', 'ngɔn bɛ̌', 'ngɔn lála', 'ngɔn nyina', 'ngɔn tána', 'ngɔn saməna',
          'ngɔn zamgbála', 'ngɔn mwom', 'ngɔn ebulú', 'ngɔn awóm', 'ngɔn awóm ai dziá',
          'ngɔn awóm ai bɛ̌'
        ]
      },
      standalone: {
        narrow: ['o', 'b', 'l', 'n', 't', 's', 'z', 'm', 'e', 'a', 'd', 'b'],
        abbreviated:
            ['ngo', 'ngb', 'ngl', 'ngn', 'ngt', 'ngs', 'ngz', 'ngm', 'nge', 'nga', 'ngad', 'ngab'],
        wide: [
          'ngɔn osú', 'ngɔn bɛ̌', 'ngɔn lála', 'ngɔn nyina', 'ngɔn tána', 'ngɔn saməna',
          'ngɔn zamgbála', 'ngɔn mwom', 'ngɔn ebulú', 'ngɔn awóm', 'ngɔn awóm ai dziá',
          'ngɔn awóm ai bɛ̌'
        ]
      }
    },
    eras: {
      abbreviated: ['oyk', 'ayk'],
      narrow: ['oyk', 'ayk'],
      wide: ['osúsúa Yésus kiri', 'ámvus Yésus Kirís']
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'Fəláŋ CFA (BEAC)'},
  getPluralCase: getPluralCase
};
