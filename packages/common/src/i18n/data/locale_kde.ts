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
export const NgLocaleKde: NgLocale = {
  localeId: 'kde',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Muhi', pm: 'Chilo'},
        narrow: {am: 'Muhi', pm: 'Chilo'},
        wide: {am: 'Muhi', pm: 'Chilo'}
      },
      standalone: {
        abbreviated: {am: 'Muhi', pm: 'Chilo'},
        narrow: {am: 'Muhi', pm: 'Chilo'},
        wide: {am: 'Muhi', pm: 'Chilo'}
      }
    },
    days: {
      format: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
        abbreviated: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
        wide: [
          'Liduva lyapili', 'Liduva lyatatu', 'Liduva lyanchechi', 'Liduva lyannyano',
          'Liduva lyannyano na linji', 'Liduva lyannyano na mavili', 'Liduva litandi'
        ]
      },
      standalone: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
        abbreviated: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
        wide: [
          'Liduva lyapili', 'Liduva lyatatu', 'Liduva lyanchechi', 'Liduva lyannyano',
          'Liduva lyannyano na linji', 'Liduva lyannyano na mavili', 'Liduva litandi'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Mwedi Ntandi', 'Mwedi wa Pili', 'Mwedi wa Tatu', 'Mwedi wa Nchechi', 'Mwedi wa Nnyano',
          'Mwedi wa Nnyano na Umo', 'Mwedi wa Nnyano na Mivili', 'Mwedi wa Nnyano na Mitatu',
          'Mwedi wa Nnyano na Nchechi', 'Mwedi wa Nnyano na Nnyano',
          'Mwedi wa Nnyano na Nnyano na U', 'Mwedi wa Nnyano na Nnyano na M'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
        wide: [
          'Mwedi Ntandi', 'Mwedi wa Pili', 'Mwedi wa Tatu', 'Mwedi wa Nchechi', 'Mwedi wa Nnyano',
          'Mwedi wa Nnyano na Umo', 'Mwedi wa Nnyano na Mivili', 'Mwedi wa Nnyano na Mitatu',
          'Mwedi wa Nnyano na Nchechi', 'Mwedi wa Nnyano na Nnyano',
          'Mwedi wa Nnyano na Nnyano na U', 'Mwedi wa Nnyano na Nnyano na M'
        ]
      }
    },
    eras: {
      abbreviated: ['AY', 'NY'],
      narrow: ['AY', 'NY'],
      wide: ['Akanapawa Yesu', 'Nankuida Yesu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
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
  currencySettings: {symbol: 'TSh', name: 'Shilingi ya Tanzania'},
  getPluralCase: getPluralCase
};
