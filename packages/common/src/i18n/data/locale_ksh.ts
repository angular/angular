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
  if (n === 0) return Plural.Zero;
  if (n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleKsh: NgLocale = {
  localeId: 'ksh',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'v.M.', pm: 'n.M.'},
        narrow: {am: 'v.M.', pm: 'n.M.'},
        wide: {am: 'Uhr vörmiddaachs', pm: 'Uhr nommendaachs'}
      },
      standalone: {
        abbreviated: {am: 'v.M.', pm: 'n.M.'},
        narrow: {am: 'v.M.', pm: 'n.M.'},
        wide: {am: 'Vörmeddaach', pm: 'Nommendaach'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['Su', 'Mo', 'Di', 'Me', 'Du', 'Fr', 'Sa'],
        abbreviated: ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
        wide: [
          'Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach',
          'Samsdaach'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
        short: ['Su', 'Mo', 'Di', 'Me', 'Du', 'Fr', 'Sa'],
        abbreviated: ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
        wide: [
          'Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach',
          'Samsdaach'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Fäb', 'Mäz', 'Apr', 'Mai', 'Jun', 'Jul', 'Ouj', 'Säp', 'Okt', 'Nov', 'Dez'],
        wide: [
          'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
          'Oktohber', 'Novämber', 'Dezämber'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'Jan.', 'Fäb.', 'Mäz.', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Ouj.', 'Säp.', 'Okt.', 'Nov.',
          'Dez.'
        ],
        wide: [
          'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
          'Oktohber', 'Novämber', 'Dezämber'
        ]
      }
    },
    eras: {
      abbreviated: ['v. Chr.', 'n. Chr.'],
      narrow: ['vC', 'nC'],
      wide: ['vür Krestos', 'noh Krestos']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, \'dä\' d. MMMM y',
        long: 'd. MMMM y',
        medium: 'd. MMM. y',
        short: 'd. M. y'
      },
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
      minusSign: '−',
      exponential: '×10^',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: '¤¤¤',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Euro'},
  getPluralCase: getPluralCase
};
