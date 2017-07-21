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
export const NgLocaleEnMY: NgLocale = {
  localeId: 'en-MY',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'midnight',
          am: 'AM',
          noon: 'noon',
          pm: 'PM',
          morning1: 'in the morning',
          afternoon1: 'in the afternoon',
          evening1: 'in the evening',
          night1: 'at night'
        },
        narrow: {
          midnight: 'mi',
          am: 'a',
          noon: 'n',
          pm: 'p',
          morning1: 'in the morning',
          afternoon1: 'in the afternoon',
          evening1: 'in the evening',
          night1: 'at night'
        },
        wide: {
          midnight: 'midnight',
          am: 'AM',
          noon: 'noon',
          pm: 'PM',
          morning1: 'in the morning',
          afternoon1: 'in the afternoon',
          evening1: 'in the evening',
          night1: 'at night'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'midnight',
          am: 'AM',
          noon: 'noon',
          pm: 'PM',
          morning1: 'morning',
          afternoon1: 'afternoon',
          evening1: 'evening',
          night1: 'night'
        },
        narrow: {
          midnight: 'midnight',
          am: 'AM',
          noon: 'noon',
          pm: 'PM',
          morning1: 'morning',
          afternoon1: 'afternoon',
          evening1: 'evening',
          night1: 'night'
        },
        wide: {
          midnight: 'midnight',
          am: 'AM',
          noon: 'noon',
          pm: 'PM',
          morning1: 'morning',
          afternoon1: 'afternoon',
          evening1: 'evening',
          night1: 'night'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: [
          'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
          'October', 'November', 'December'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: [
          'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
          'October', 'November', 'December'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['B', 'A'], wide: ['Before Christ', 'Anno Domini']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime:
          {full: '{1} \'at\' {0}', long: '{1} \'at\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'},
      noon: '12:00'
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
  currencySettings: {symbol: 'RM', name: 'Malaysian Ringgit'},
  getPluralCase: getPluralCase
};
