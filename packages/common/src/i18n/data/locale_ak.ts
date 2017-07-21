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
export const NgLocaleAk: NgLocale = {
  localeId: 'ak',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AN', pm: 'EW'},
        narrow: {am: 'AN', pm: 'EW'},
        wide: {am: 'AN', pm: 'EW'}
      },
      standalone: {
        abbreviated: {am: 'AN', pm: 'EW'},
        narrow: {am: 'AN', pm: 'EW'},
        wide: {am: 'AN', pm: 'EW'}
      }
    },
    days: {
      format: {
        narrow: ['K', 'D', 'B', 'W', 'Y', 'F', 'M'],
        short: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
        abbreviated: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
        wide: ['Kwesida', 'Dwowda', 'Benada', 'Wukuda', 'Yawda', 'Fida', 'Memeneda']
      },
      standalone: {
        narrow: ['K', 'D', 'B', 'W', 'Y', 'F', 'M'],
        short: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
        abbreviated: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
        wide: ['Kwesida', 'Dwowda', 'Benada', 'Wukuda', 'Yawda', 'Fida', 'Memeneda']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['S-Ɔ', 'K-Ɔ', 'E-Ɔ', 'E-O', 'E-K', 'O-A', 'A-K', 'D-Ɔ', 'F-Ɛ', 'Ɔ-A', 'Ɔ-O', 'M-Ɔ'],
        wide: [
          'Sanda-Ɔpɛpɔn', 'Kwakwar-Ɔgyefuo', 'Ebɔw-Ɔbenem', 'Ebɔbira-Oforisuo',
          'Esusow Aketseaba-Kɔtɔnimba', 'Obirade-Ayɛwohomumu', 'Ayɛwoho-Kitawonsa', 'Difuu-Ɔsandaa',
          'Fankwa-Ɛbɔ', 'Ɔbɛsɛ-Ahinime', 'Ɔberɛfɛw-Obubuo', 'Mumu-Ɔpɛnimba'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['S-Ɔ', 'K-Ɔ', 'E-Ɔ', 'E-O', 'E-K', 'O-A', 'A-K', 'D-Ɔ', 'F-Ɛ', 'Ɔ-A', 'Ɔ-O', 'M-Ɔ'],
        wide: [
          'Sanda-Ɔpɛpɔn', 'Kwakwar-Ɔgyefuo', 'Ebɔw-Ɔbenem', 'Ebɔbira-Oforisuo',
          'Esusow Aketseaba-Kɔtɔnimba', 'Obirade-Ayɛwohomumu', 'Ayɛwoho-Kitawonsa', 'Difuu-Ɔsandaa',
          'Fankwa-Ɛbɔ', 'Ɔbɛsɛ-Ahinime', 'Ɔberɛfɛw-Obubuo', 'Mumu-Ɔpɛnimba'
        ]
      }
    },
    eras:
        {abbreviated: ['AK', 'KE'], narrow: ['AK', 'KE'], wide: ['Ansa Kristo', 'Kristo Ekyiri']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, y MMMM dd', long: 'y MMMM d', medium: 'y MMM d', short: 'yy/MM/dd'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
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
  currencySettings: {symbol: 'GH₵', name: 'Ghana Sidi'},
  getPluralCase: getPluralCase
};
