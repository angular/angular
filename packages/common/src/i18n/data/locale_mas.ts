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
export const NgLocaleMas: NgLocale = {
  localeId: 'mas',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'},
        narrow: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'},
        wide: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'}
      },
      standalone: {
        abbreviated: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'},
        narrow: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'},
        wide: {am: 'Ɛnkakɛnyá', pm: 'Ɛndámâ'}
      }
    },
    days: {
      format: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        abbreviated: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        wide: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi']
      },
      standalone: {
        narrow: ['2', '3', '4', '5', '6', '7', '1'],
        short: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        abbreviated: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        wide: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
        wide: [
          'Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk',
          'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
        wide: [
          'Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk',
          'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'
        ]
      }
    },
    eras: {abbreviated: ['MY', 'EY'], narrow: ['MY', 'EY'], wide: ['Meínō Yɛ́sʉ', 'Eínō Yɛ́sʉ']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
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
  currencySettings: {symbol: 'Ksh', name: 'Iropiyianí e Kenya'},
  getPluralCase: getPluralCase
};
