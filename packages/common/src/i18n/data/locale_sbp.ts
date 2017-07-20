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
export const NgLocaleSbp: NgLocale = {
  localeId: 'sbp',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Lwamilawu', pm: 'Pashamihe'},
        narrow: {am: 'Lwamilawu', pm: 'Pashamihe'},
        wide: {am: 'Lwamilawu', pm: 'Pashamihe'}
      },
      standalone: {
        abbreviated: {am: 'Lwamilawu', pm: 'Pashamihe'},
        narrow: {am: 'Lwamilawu', pm: 'Pashamihe'},
        wide: {am: 'Lwamilawu', pm: 'Pashamihe'}
      }
    },
    days: {
      format: {
        narrow: ['M', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        abbreviated: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        wide: ['Mulungu', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alahamisi', 'Ijumaa', 'Jumamosi']
      },
      standalone: {
        narrow: ['M', 'J', 'J', 'J', 'A', 'I', 'J'],
        short: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        abbreviated: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
        wide: ['Mulungu', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alahamisi', 'Ijumaa', 'Jumamosi']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Mup', 'Mwi', 'Msh', 'Mun', 'Mag', 'Muj', 'Msp', 'Mpg', 'Mye', 'Mok', 'Mus', 'Muh'],
        wide: [
          'Mupalangulwa', 'Mwitope', 'Mushende', 'Munyi', 'Mushende Magali', 'Mujimbi', 'Mushipepo',
          'Mupuguto', 'Munyense', 'Mokhu', 'Musongandembwe', 'Muhaano'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Mup', 'Mwi', 'Msh', 'Mun', 'Mag', 'Muj', 'Msp', 'Mpg', 'Mye', 'Mok', 'Mus', 'Muh'],
        wide: [
          'Mupalangulwa', 'Mwitope', 'Mushende', 'Munyi', 'Mushende Magali', 'Mujimbi', 'Mushipepo',
          'Mupuguto', 'Munyense', 'Mokhu', 'Musongandembwe', 'Muhaano'
        ]
      }
    },
    eras: {
      abbreviated: ['AK', 'PK'],
      narrow: ['AK', 'PK'],
      wide: ['Ashanali uKilisito', 'Pamwandi ya Kilisto']
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
    formats: {currency: '#,##0.00¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'TSh', name: 'Ihela ya Tansaniya'},
  getPluralCase: getPluralCase
};
