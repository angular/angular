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
  if (n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSn: NgLocale = {
  localeId: 'sn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'a', pm: 'p'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'C', 'C', 'C', 'C', 'M'],
        short: ['Sv', 'Mu', 'Cp', 'Ct', 'Cn', 'Cs', 'Mg'],
        abbreviated: ['Svo', 'Muv', 'Chp', 'Cht', 'Chn', 'Chs', 'Mug'],
        wide: ['Svondo', 'Muvhuro', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugovera']
      },
      standalone: {
        narrow: ['S', 'M', 'C', 'C', 'C', 'C', 'M'],
        short: ['Sv', 'Mu', 'Cp', 'Ct', 'Cn', 'Cs', 'Mg'],
        abbreviated: ['Svo', 'Muv', 'Chp', 'Cht', 'Chn', 'Chs', 'Mug'],
        wide: ['Svondo', 'Muvhuro', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugovera']
      }
    },
    months: {
      format: {
        narrow: ['N', 'K', 'K', 'K', 'C', 'C', 'C', 'N', 'G', 'G', 'M', 'Z'],
        abbreviated:
            ['Ndi', 'Kuk', 'Kur', 'Kub', 'Chv', 'Chk', 'Chg', 'Nya', 'Gun', 'Gum', 'Mbu', 'Zvi'],
        wide: [
          'Ndira', 'Kukadzi', 'Kurume', 'Kubvumbi', 'Chivabvu', 'Chikumi', 'Chikunguru',
          'Nyamavhuvhu', 'Gunyana', 'Gumiguru', 'Mbudzi', 'Zvita'
        ]
      },
      standalone: {
        narrow: ['N', 'K', 'K', 'K', 'C', 'C', 'C', 'N', 'G', 'G', 'M', 'Z'],
        abbreviated:
            ['Ndi', 'Kuk', 'Kur', 'Kub', 'Chv', 'Chk', 'Chg', 'Nya', 'Gun', 'Gum', 'Mbu', 'Zvi'],
        wide: [
          'Ndira', 'Kukadzi', 'Kurume', 'Kubvumbi', 'Chivabvu', 'Chikumi', 'Chikunguru',
          'Nyamavhuvhu', 'Gunyana', 'Gumiguru', 'Mbudzi', 'Zvita'
        ]
      }
    },
    eras: {
      abbreviated: ['BC', 'AD'],
      narrow: ['BC', 'AD'],
      wide: ['Kristo asati auya', 'mugore ramambo vedu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
  currencySettings: {symbol: 'US$', name: 'Dora re Amerika'},
  getPluralCase: getPluralCase
};
