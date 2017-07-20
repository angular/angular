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
export const NgLocaleSoDJ: NgLocale = {
  localeId: 'so-DJ',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'sn.', pm: 'gn.'},
        narrow: {am: 'sn.', pm: 'gn.'},
        wide: {am: 'sn.', pm: 'gn.'}
      },
      standalone: {
        abbreviated: {am: 'sn.', pm: 'gn.'},
        narrow: {am: 'sn.', pm: 'gn.'},
        wide: {am: 'sn.', pm: 'gn.'}
      }
    },
    days: {
      format: {
        narrow: ['A', 'I', 'T', 'A', 'Kh', 'J', 'S'],
        short: ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'],
        abbreviated: ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'],
        wide: ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti']
      },
      standalone: {
        narrow: ['A', 'I', 'T', 'A', 'Kh', 'J', 'S'],
        short: ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'],
        abbreviated: ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'],
        wide: ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti']
      }
    },
    months: {
      format: {
        narrow: ['K', 'L', 'S', 'A', 'S', 'L', 'T', 'S', 'S', 'T', 'K', 'L'],
        abbreviated:
            ['Kob', 'Lab', 'Sad', 'Afr', 'Sha', 'Lix', 'Tod', 'Sid', 'Sag', 'Tob', 'KIT', 'LIT'],
        wide: [
          'Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad',
          'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad',
          'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Kob', 'Lab', 'Sad', 'Afr', 'Sha', 'Lix', 'Tod', 'Sid', 'Sag', 'Tob', 'KIT', 'LIT'],
        wide: [
          'Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad',
          'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad',
          'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'
        ]
      }
    },
    eras: {abbreviated: ['CK', 'CD'], narrow: ['CK', 'CD'], wide: ['CK', 'CD']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, MMMM dd, y', long: 'dd MMMM y', medium: 'dd-MMM-y', short: 'dd/MM/yy'},
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
  currencySettings: {symbol: 'Fdj', name: 'Faran Jabbuuti'},
  getPluralCase: getPluralCase
};
