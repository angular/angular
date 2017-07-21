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
  if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
    return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleTzm: NgLocale = {
  localeId: 'tzm',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Zdat azal', pm: 'Ḍeffir aza'},
        narrow: {am: 'Zdat azal', pm: 'Ḍeffir aza'},
        wide: {am: 'Zdat azal', pm: 'Ḍeffir aza'}
      },
      standalone: {
        abbreviated: {am: 'Zdat azal', pm: 'Ḍeffir aza'},
        narrow: {am: 'Zdat azal', pm: 'Ḍeffir aza'},
        wide: {am: 'Zdat azal', pm: 'Ḍeffir aza'}
      }
    },
    days: {
      format: {
        narrow: ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
        short: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
        abbreviated: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
        wide: ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas']
      },
      standalone: {
        narrow: ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
        short: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
        abbreviated: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
        wide: ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas']
      }
    },
    months: {
      format: {
        narrow: ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
        abbreviated:
            ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
        wide: [
          'Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir',
          'Kṭuber', 'Nwanbir', 'Dujanbir'
        ]
      },
      standalone: {
        narrow: ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
        abbreviated:
            ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
        wide: [
          'Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir',
          'Kṭuber', 'Nwanbir', 'Dujanbir'
        ]
      }
    },
    eras: {
      abbreviated: ['ZƐ', 'ḌƐ'],
      narrow: ['ZƐ', 'ḌƐ'],
      wide: ['Zdat Ɛisa (TAƔ)', 'Ḍeffir Ɛisa (TAƔ)']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 6],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
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
  currencySettings: {symbol: 'MAD', name: 'Derhem Umeṛṛuki'},
  getPluralCase: getPluralCase
};
