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
export const NgLocaleWae: NgLocale = {
  localeId: 'wae',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
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
        narrow: ['S', 'M', 'Z', 'M', 'F', 'F', 'S'],
        short: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
        abbreviated: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
        wide: ['Sunntag', 'Mäntag', 'Zištag', 'Mittwuč', 'Fróntag', 'Fritag', 'Samštag']
      },
      standalone: {
        narrow: ['S', 'M', 'Z', 'M', 'F', 'F', 'S'],
        short: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
        abbreviated: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
        wide: ['Sunntag', 'Mäntag', 'Zištag', 'Mittwuč', 'Fróntag', 'Fritag', 'Samštag']
      }
    },
    months: {
      format: {
        narrow: ['J', 'H', 'M', 'A', 'M', 'B', 'H', 'Ö', 'H', 'W', 'W', 'C'],
        abbreviated:
            ['Jen', 'Hor', 'Mär', 'Abr', 'Mei', 'Brá', 'Hei', 'Öig', 'Her', 'Wím', 'Win', 'Chr'],
        wide: [
          'Jenner', 'Hornig', 'Märze', 'Abrille', 'Meije', 'Bráčet', 'Heiwet', 'Öigšte',
          'Herbštmánet', 'Wímánet', 'Wintermánet', 'Chrištmánet'
        ]
      },
      standalone: {
        narrow: ['J', 'H', 'M', 'A', 'M', 'B', 'H', 'Ö', 'H', 'W', 'W', 'C'],
        abbreviated:
            ['Jen', 'Hor', 'Mär', 'Abr', 'Mei', 'Brá', 'Hei', 'Öig', 'Her', 'Wím', 'Win', 'Chr'],
        wide: [
          'Jenner', 'Hornig', 'Märze', 'Abrille', 'Meije', 'Bráčet', 'Heiwet', 'Öigšte',
          'Herbštmánet', 'Wímánet', 'Wintermánet', 'Chrištmánet'
        ]
      }
    },
    eras: {
      abbreviated: ['v. Chr.', 'n. Chr'],
      narrow: ['v. Chr.', 'n. Chr'],
      wide: ['v. Chr.', 'n. Chr']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'y-MM-dd'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '’',
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'CHF', name: 'CHF'},
  getPluralCase: getPluralCase
};
