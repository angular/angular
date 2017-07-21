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
export const NgLocaleDyo: NgLocale = {
  localeId: 'dyo',
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
        narrow: ['D', 'T', 'T', 'A', 'A', 'A', 'S'],
        short: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
        abbreviated: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
        wide: ['Dimas', 'Teneŋ', 'Talata', 'Alarbay', 'Aramisay', 'Arjuma', 'Sibiti']
      },
      standalone: {
        narrow: ['D', 'T', 'T', 'A', 'A', 'A', 'S'],
        short: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
        abbreviated: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
        wide: ['Dimas', 'Teneŋ', 'Talata', 'Alarbay', 'Aramisay', 'Arjuma', 'Sibiti']
      }
    },
    months: {
      format: {
        narrow: ['S', 'F', 'M', 'A', 'M', 'S', 'S', 'U', 'S', 'O', 'N', 'D'],
        abbreviated: ['Sa', 'Fe', 'Ma', 'Ab', 'Me', 'Su', 'Sú', 'Ut', 'Se', 'Ok', 'No', 'De'],
        wide: [
          'Sanvie', 'Fébirie', 'Mars', 'Aburil', 'Mee', 'Sueŋ', 'Súuyee', 'Ut', 'Settembar',
          'Oktobar', 'Novembar', 'Disambar'
        ]
      },
      standalone: {
        narrow: ['S', 'F', 'M', 'A', 'M', 'S', 'S', 'U', 'S', 'O', 'N', 'D'],
        abbreviated: ['Sa', 'Fe', 'Ma', 'Ab', 'Me', 'Su', 'Sú', 'Ut', 'Se', 'Ok', 'No', 'De'],
        wide: [
          'Sanvie', 'Fébirie', 'Mars', 'Aburil', 'Mee', 'Sueŋ', 'Súuyee', 'Ut', 'Settembar',
          'Oktobar', 'Novembar', 'Disambar'
        ]
      }
    },
    eras: {
      abbreviated: ['ArY', 'AtY'],
      narrow: ['ArY', 'AtY'],
      wide: ['Ariŋuu Yeesu', 'Atooŋe Yeesu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/y'},
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
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'CFA', name: 'seefa yati BCEAO'},
  getPluralCase: getPluralCase
};
