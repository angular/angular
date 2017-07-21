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
export const NgLocaleShiLatn: NgLocale = {
  localeId: 'shi-Latn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'tifawt', pm: 'tadggʷat'},
        narrow: {am: 'tifawt', pm: 'tadggʷat'},
        wide: {am: 'tifawt', pm: 'tadggʷat'}
      },
      standalone: {
        abbreviated: {am: 'tifawt', pm: 'tadggʷat'},
        narrow: {am: 'tifawt', pm: 'tadggʷat'},
        wide: {am: 'tifawt', pm: 'tadggʷat'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
        abbreviated: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
        wide: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
        abbreviated: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
        wide: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas']
      }
    },
    months: {
      format: {
        narrow: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
        abbreviated:
            ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
        wide: [
          'innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir',
          'ktubr', 'nuwanbir', 'dujanbir'
        ]
      },
      standalone: {
        narrow: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
        abbreviated:
            ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
        wide: [
          'innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir',
          'ktubr', 'nuwanbir', 'dujanbir'
        ]
      }
    },
    eras: {
      abbreviated: ['daɛ', 'dfɛ'],
      narrow: ['daɛ', 'dfɛ'],
      wide: ['dat n ɛisa', 'dffir n ɛisa']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 6],
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
  currencySettings: {symbol: 'MAD', name: 'adrim n lmɣrib'},
  getPluralCase: getPluralCase
};
