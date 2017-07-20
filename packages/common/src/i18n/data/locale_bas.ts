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
export const NgLocaleBas: NgLocale = {
  localeId: 'bas',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'},
        narrow: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'},
        wide: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'}
      },
      standalone: {
        abbreviated: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'},
        narrow: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'},
        wide: {am: 'I bikɛ̂glà', pm: 'I ɓugajɔp'}
      }
    },
    days: {
      format: {
        narrow: ['n', 'n', 'u', 'ŋ', 'm', 'k', 'j'],
        short: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
        abbreviated: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
        wide: [
          'ŋgwà nɔ̂y', 'ŋgwà njaŋgumba', 'ŋgwà ûm', 'ŋgwà ŋgê', 'ŋgwà mbɔk', 'ŋgwà kɔɔ', 'ŋgwà jôn'
        ]
      },
      standalone: {
        narrow: ['n', 'n', 'u', 'ŋ', 'm', 'k', 'j'],
        short: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
        abbreviated: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
        wide: [
          'ŋgwà nɔ̂y', 'ŋgwà njaŋgumba', 'ŋgwà ûm', 'ŋgwà ŋgê', 'ŋgwà mbɔk', 'ŋgwà kɔɔ', 'ŋgwà jôn'
        ]
      }
    },
    months: {
      format: {
        narrow: ['k', 'm', 'm', 'm', 'm', 'h', 'n', 'h', 'd', 'b', 'm', 'l'],
        abbreviated:
            ['kɔn', 'mac', 'mat', 'mto', 'mpu', 'hil', 'nje', 'hik', 'dip', 'bio', 'may', 'liɓ'],
        wide: [
          'Kɔndɔŋ', 'Màcɛ̂l', 'Màtùmb', 'Màtop', 'M̀puyɛ', 'Hìlòndɛ̀', 'Njèbà', 'Hìkaŋ', 'Dìpɔ̀s',
          'Bìòôm', 'Màyɛsèp', 'Lìbuy li ńyèe'
        ]
      },
      standalone: {
        narrow: ['k', 'm', 'm', 'm', 'm', 'h', 'n', 'h', 'd', 'b', 'm', 'l'],
        abbreviated:
            ['kɔn', 'mac', 'mat', 'mto', 'mpu', 'hil', 'nje', 'hik', 'dip', 'bio', 'may', 'liɓ'],
        wide: [
          'Kɔndɔŋ', 'Màcɛ̂l', 'Màtùmb', 'Màtop', 'M̀puyɛ', 'Hìlòndɛ̀', 'Njèbà', 'Hìkaŋ', 'Dìpɔ̀s',
          'Bìòôm', 'Màyɛsèp', 'Lìbuy li ńyèe'
        ]
      }
    },
    eras: {
      abbreviated: ['b.Y.K', 'm.Y.K'],
      narrow: ['b.Y.K', 'm.Y.K'],
      wide: ['bisū bi Yesù Krǐstò', 'i mbūs Yesù Krǐstò']
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'Frǎŋ CFA (BEAC)'},
  getPluralCase: getPluralCase
};
