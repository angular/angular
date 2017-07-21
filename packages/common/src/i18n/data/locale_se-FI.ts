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
  if (n === 2) return Plural.Two;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSeFI: NgLocale = {
  localeId: 'se-FI',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'i.b.', pm: 'e.b.'},
        narrow: {am: 'i.b.', pm: 'e.b.'},
        wide: {am: 'iđitbeaivet', pm: 'eahketbeaivet'}
      },
      standalone: {
        abbreviated: {am: 'i.b.', pm: 'e.b.'},
        narrow: {am: 'i.b.', pm: 'e.b.'},
        wide: {am: 'iđitbeaivi', pm: 'eahketbeaivi'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'D', 'G', 'D', 'B', 'L'],
        short: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
        abbreviated: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
        wide: [
          'sotnabeaivi', 'vuossárgga', 'maŋŋebárgga', 'gaskavahku', 'duorastaga', 'bearjadaga',
          'lávvardaga'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'D', 'G', 'D', 'B', 'L'],
        short: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
        abbreviated: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
        wide: [
          'sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat',
          'lávvardat'
        ]
      }
    },
    months: {
      format: {
        narrow: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
        abbreviated: [
          'ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb',
          'juov'
        ],
        wide: [
          'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu',
          'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'
        ]
      },
      standalone: {
        narrow: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
        abbreviated: [
          'ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb',
          'juov'
        ],
        wide: [
          'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu',
          'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'
        ]
      }
    },
    eras: {
      abbreviated: ['o.Kr.', 'm.Kr.'],
      narrow: ['o.Kr.', 'm.Kr.'],
      wide: ['ovdal Kristtusa', 'maŋŋel Kristtusa']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
      exponential: '·10^',
      superscriptingExponent: '·',
      perMille: '‰',
      infinity: '∞',
      nan: '¤¤¤',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
