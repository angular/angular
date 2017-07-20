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
export const NgLocaleCgg: NgLocale = {
  localeId: 'cgg',
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
        narrow: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
        short: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
        abbreviated: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
        wide: [
          'Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano',
          'Orwamukaaga'
        ]
      },
      standalone: {
        narrow: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
        short: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
        abbreviated: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
        wide: [
          'Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano',
          'Orwamukaaga'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
        wide: [
          'Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga',
          'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe',
          'Okwaikumi na ibiri'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
        wide: [
          'Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga',
          'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe',
          'Okwaikumi na ibiri'
        ]
      }
    },
    eras: {
      abbreviated: ['BC', 'AD'],
      narrow: ['BC', 'AD'],
      wide: ['Kurisito Atakaijire', 'Kurisito Yaijire']
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
  currencySettings: {symbol: 'USh', name: 'Eshiringi ya Uganda'},
  getPluralCase: getPluralCase
};
