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
export const NgLocaleYav: NgLocale = {
  localeId: 'yav',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'},
        narrow: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'},
        wide: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'}
      },
      standalone: {
        abbreviated: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'},
        narrow: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'},
        wide: {am: 'kiɛmɛ́ɛm', pm: 'kisɛ́ndɛ'}
      }
    },
    days: {
      format: {
        narrow: ['s', 'm', 'm', 'e', 'k', 'f', 's'],
        short: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
        abbreviated: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
        wide: [
          'sɔ́ndiɛ', 'móndie', 'muányáŋmóndie', 'metúkpíápɛ', 'kúpélimetúkpiapɛ', 'feléte', 'séselé'
        ]
      },
      standalone: {
        narrow: ['s', 'm', 'm', 'e', 'k', 'f', 's'],
        short: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
        abbreviated: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
        wide: [
          'sɔ́ndiɛ', 'móndie', 'muányáŋmóndie', 'metúkpíápɛ', 'kúpélimetúkpiapɛ', 'feléte', 'séselé'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['o.1', 'o.2', 'o.3', 'o.4', 'o.5', 'o.6', 'o.7', 'o.8', 'o.9', 'o.10', 'o.11', 'o.12'],
        wide: [
          'pikítíkítie, oólí ú kutúan', 'siɛyɛ́, oóli ú kándíɛ', 'ɔnsúmbɔl, oóli ú kátátúɛ',
          'mesiŋ, oóli ú kénie', 'ensil, oóli ú kátánuɛ', 'ɔsɔn', 'efute', 'pisuyú', 'imɛŋ i puɔs',
          'imɛŋ i putúk,oóli ú kátíɛ', 'makandikɛ', 'pilɔndɔ́'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['o.1', 'o.2', 'o.3', 'o.4', 'o.5', 'o.6', 'o.7', 'o.8', 'o.9', 'o.10', 'o.11', 'o.12'],
        wide: [
          'pikítíkítie, oólí ú kutúan', 'siɛyɛ́, oóli ú kándíɛ', 'ɔnsúmbɔl, oóli ú kátátúɛ',
          'mesiŋ, oóli ú kénie', 'ensil, oóli ú kátánuɛ', 'ɔsɔn', 'efute', 'pisuyú', 'imɛŋ i puɔs',
          'imɛŋ i putúk,oóli ú kátíɛ', 'makandikɛ', 'pilɔndɔ́'
        ]
      }
    },
    eras: {
      abbreviated: ['k.Y.', '+J.C.'],
      narrow: ['k.Y.', '+J.C.'],
      wide: ['katikupíen Yésuse', 'ékélémkúnupíén n']
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
  currencySettings: {symbol: 'FCFA', name: 'XAF'},
  getPluralCase: getPluralCase
};
