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
export const NgLocaleEbu: NgLocale = {
  localeId: 'ebu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'KI', pm: 'UT'},
        narrow: {am: 'KI', pm: 'UT'},
        wide: {am: 'KI', pm: 'UT'}
      },
      standalone: {
        abbreviated: {am: 'KI', pm: 'UT'},
        narrow: {am: 'KI', pm: 'UT'},
        wide: {am: 'KI', pm: 'UT'}
      }
    },
    days: {
      format: {
        narrow: ['K', 'N', 'N', 'N', 'A', 'M', 'N'],
        short: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
        abbreviated: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
        wide:
            ['Kiumia', 'Njumatatu', 'Njumaine', 'Njumatano', 'Aramithi', 'Njumaa', 'NJumamothii']
      },
      standalone: {
        narrow: ['K', 'N', 'N', 'N', 'A', 'M', 'N'],
        short: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
        abbreviated: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
        wide:
            ['Kiumia', 'Njumatatu', 'Njumaine', 'Njumatano', 'Aramithi', 'Njumaa', 'NJumamothii']
      }
    },
    months: {
      format: {
        narrow: ['M', 'K', 'K', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'I'],
        abbreviated:
            ['Mbe', 'Kai', 'Kat', 'Kan', 'Gat', 'Gan', 'Mug', 'Knn', 'Ken', 'Iku', 'Imw', 'Igi'],
        wide: [
          'Mweri wa mbere', 'Mweri wa kaĩri', 'Mweri wa kathatũ', 'Mweri wa kana',
          'Mweri wa gatano', 'Mweri wa gatantatũ', 'Mweri wa mũgwanja', 'Mweri wa kanana',
          'Mweri wa kenda', 'Mweri wa ikũmi', 'Mweri wa ikũmi na ũmwe', 'Mweri wa ikũmi na Kaĩrĩ'
        ]
      },
      standalone: {
        narrow: ['M', 'K', 'K', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'I'],
        abbreviated:
            ['Mbe', 'Kai', 'Kat', 'Kan', 'Gat', 'Gan', 'Mug', 'Knn', 'Ken', 'Iku', 'Imw', 'Igi'],
        wide: [
          'Mweri wa mbere', 'Mweri wa kaĩri', 'Mweri wa kathatũ', 'Mweri wa kana',
          'Mweri wa gatano', 'Mweri wa gatantatũ', 'Mweri wa mũgwanja', 'Mweri wa kanana',
          'Mweri wa kenda', 'Mweri wa ikũmi', 'Mweri wa ikũmi na ũmwe', 'Mweri wa ikũmi na Kaĩrĩ'
        ]
      }
    },
    eras: {
      abbreviated: ['MK', 'TK'],
      narrow: ['MK', 'TK'],
      wide: ['Mbere ya Kristo', 'Thutha wa Kristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
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
  currencySettings: {symbol: 'Ksh', name: 'Shilingi ya Kenya'},
  getPluralCase: getPluralCase
};
