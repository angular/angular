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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleEt: NgLocale = {
  localeId: 'et',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'keskööl',
          am: 'AM',
          noon: 'keskpäeval',
          pm: 'PM',
          morning1: 'hommikul',
          afternoon1: 'pärastlõunal',
          evening1: 'õhtul',
          night1: 'öösel'
        },
        narrow: {
          midnight: 'keskööl',
          am: 'AM',
          noon: 'keskpäeval',
          pm: 'PM',
          morning1: 'hommikul',
          afternoon1: 'pärastlõunal',
          evening1: 'õhtul',
          night1: 'öösel'
        },
        wide: {
          midnight: 'keskööl',
          am: 'AM',
          noon: 'keskpäeval',
          pm: 'PM',
          morning1: 'hommikul',
          afternoon1: 'pärastlõunal',
          evening1: 'õhtul',
          night1: 'öösel'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'kesköö',
          am: 'AM',
          noon: 'keskpäev',
          pm: 'PM',
          morning1: 'hommik',
          afternoon1: 'pärastlõuna',
          evening1: 'õhtu',
          night1: 'öö'
        },
        narrow: {
          midnight: 'kesköö',
          am: 'AM',
          noon: 'keskpäev',
          pm: 'PM',
          morning1: 'hommik',
          afternoon1: 'pärastlõuna',
          evening1: 'õhtu',
          night1: 'öö'
        },
        wide: {
          midnight: 'kesköö',
          am: 'AM',
          noon: 'keskpäev',
          pm: 'PM',
          morning1: 'hommik',
          afternoon1: 'pärastlõuna',
          evening1: 'õhtu',
          night1: 'öö'
        }
      }
    },
    days: {
      format: {
        narrow: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        short: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        abbreviated: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        wide: ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev']
      },
      standalone: {
        narrow: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        short: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        abbreviated: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
        wide:
            ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev']
      }
    },
    months: {
      format: {
        narrow: ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov',
          'dets'
        ],
        wide: [
          'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september',
          'oktoober', 'november', 'detsember'
        ]
      },
      standalone: {
        narrow: ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov',
          'dets'
        ],
        wide: [
          'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september',
          'oktoober', 'november', 'detsember'
        ]
      }
    },
    eras: {
      abbreviated: ['eKr', 'pKr'],
      narrow: ['eKr', 'pKr'],
      wide: ['enne Kristust', 'pärast Kristust']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'dd.MM.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '23:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '12:00'},
      night1: {from: '23:00', to: '05:00'},
      noon: '12:00'
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
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
