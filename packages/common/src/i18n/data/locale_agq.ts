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
export const NgLocaleAgq: NgLocale = {
  localeId: 'agq',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'a.g', pm: 'a.k'},
        narrow: {am: 'a.g', pm: 'a.k'},
        wide: {am: 'a.g', pm: 'a.k'}
      },
      standalone: {
        abbreviated: {am: 'a.g', pm: 'a.k'},
        narrow: {am: 'a.g', pm: 'a.k'},
        wide: {am: 'a.g', pm: 'a.k'}
      }
    },
    days: {
      format: {
        narrow: ['n', 'k', 'g', 't', 'u', 'g', 'd'],
        short: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
        abbreviated: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
        wide: [
          'tsuʔntsɨ', 'tsuʔukpà', 'tsuʔughɔe', 'tsuʔutɔ̀mlò', 'tsuʔumè', 'tsuʔughɨ̂m', 'tsuʔndzɨkɔʔɔ'
        ]
      },
      standalone: {
        narrow: ['n', 'k', 'g', 't', 'u', 'g', 'd'],
        short: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
        abbreviated: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
        wide: [
          'tsuʔntsɨ', 'tsuʔukpà', 'tsuʔughɔe', 'tsuʔutɔ̀mlò', 'tsuʔumè', 'tsuʔughɨ̂m', 'tsuʔndzɨkɔʔɔ'
        ]
      }
    },
    months: {
      format: {
        narrow: ['n', 'k', 't', 't', 's', 'z', 'k', 'f', 'd', 'l', 'c', 'f'],
        abbreviated:
            ['nùm', 'kɨz', 'tɨd', 'taa', 'see', 'nzu', 'dum', 'fɔe', 'dzu', 'lɔm', 'kaa', 'fwo'],
        wide: [
          'ndzɔ̀ŋɔ̀nùm', 'ndzɔ̀ŋɔ̀kƗ̀zùʔ', 'ndzɔ̀ŋɔ̀tƗ̀dʉ̀ghà', 'ndzɔ̀ŋɔ̀tǎafʉ̄ghā', 'ndzɔ̀ŋèsèe',
          'ndzɔ̀ŋɔ̀nzùghò', 'ndzɔ̀ŋɔ̀dùmlo', 'ndzɔ̀ŋɔ̀kwîfɔ̀e', 'ndzɔ̀ŋɔ̀tƗ̀fʉ̀ghàdzughù', 'ndzɔ̀ŋɔ̀ghǔuwelɔ̀m',
          'ndzɔ̀ŋɔ̀chwaʔàkaa wo', 'ndzɔ̀ŋèfwòo'
        ]
      },
      standalone: {
        narrow: ['n', 'k', 't', 't', 's', 'z', 'k', 'f', 'd', 'l', 'c', 'f'],
        abbreviated:
            ['nùm', 'kɨz', 'tɨd', 'taa', 'see', 'nzu', 'dum', 'fɔe', 'dzu', 'lɔm', 'kaa', 'fwo'],
        wide: [
          'ndzɔ̀ŋɔ̀nùm', 'ndzɔ̀ŋɔ̀kƗ̀zùʔ', 'ndzɔ̀ŋɔ̀tƗ̀dʉ̀ghà', 'ndzɔ̀ŋɔ̀tǎafʉ̄ghā', 'ndzɔ̀ŋèsèe',
          'ndzɔ̀ŋɔ̀nzùghò', 'ndzɔ̀ŋɔ̀dùmlo', 'ndzɔ̀ŋɔ̀kwîfɔ̀e', 'ndzɔ̀ŋɔ̀tƗ̀fʉ̀ghàdzughù', 'ndzɔ̀ŋɔ̀ghǔuwelɔ̀m',
          'ndzɔ̀ŋɔ̀chwaʔàkaa wo', 'ndzɔ̀ŋèfwòo'
        ]
      }
    },
    eras: {abbreviated: ['SK', 'BK'], narrow: ['SK', 'BK'], wide: ['Sěe Kɨ̀lesto', 'Bǎa Kɨ̀lesto']}
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
  currencySettings: {symbol: 'FCFA', name: 'CFA Fàlâŋ BEAC'},
  getPluralCase: getPluralCase
};
