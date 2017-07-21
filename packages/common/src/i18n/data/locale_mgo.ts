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
export const NgLocaleMgo: NgLocale = {
  localeId: 'mgo',
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
        narrow: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
        short: ['1', '2', '3', '4', '5', '6', '7'],
        abbreviated: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
        wide: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7']
      },
      standalone: {
        narrow: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
        short: ['1', '2', '3', '4', '5', '6', '7'],
        abbreviated: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
        wide: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7']
      }
    },
    months: {
      format: {
        narrow: ['M1', 'A2', 'M3', 'N4', 'F5', 'I6', 'A7', 'I8', 'K9', '10', '11', '12'],
        abbreviated: [
          'mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
          'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
        ],
        wide: [
          'iməg mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
          'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
        ]
      },
      standalone: {
        narrow: ['M1', 'A2', 'M3', 'N4', 'F5', 'I6', 'A7', 'I8', 'K9', '10', '11', '12'],
        abbreviated: [
          'mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
          'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
        ],
        wide: [
          'iməg mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd',
          'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, y MMMM dd', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'shirè'},
  getPluralCase: getPluralCase
};
