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
export const NgLocaleTo: NgLocale = {
  localeId: 'to',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'hengihengi', pm: 'efiafi'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'HH', pm: 'EA'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'P', 'T', 'F', 'T'],
        short: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
        abbreviated: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
        wide: ['Sāpate', 'Mōnite', 'Tūsite', 'Pulelulu', 'Tuʻapulelulu', 'Falaite', 'Tokonaki']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'P', 'T', 'F', 'T'],
        short: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
        abbreviated: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
        wide: ['Sāpate', 'Mōnite', 'Tūsite', 'Pulelulu', 'Tuʻapulelulu', 'Falaite', 'Tokonaki']
      }
    },
    months: {
      format: {
        narrow: ['S', 'F', 'M', 'E', 'M', 'S', 'S', 'A', 'S', 'O', 'N', 'T'],
        abbreviated:
            ['Sān', 'Fēp', 'Maʻa', 'ʻEpe', 'Mē', 'Sun', 'Siu', 'ʻAok', 'Sep', 'ʻOka', 'Nōv', 'Tīs'],
        wide: [
          'Sānuali', 'Fēpueli', 'Maʻasi', 'ʻEpeleli', 'Mē', 'Sune', 'Siulai', 'ʻAokosi', 'Sepitema',
          'ʻOkatopa', 'Nōvema', 'Tīsema'
        ]
      },
      standalone: {
        narrow: ['S', 'F', 'M', 'E', 'M', 'S', 'S', 'A', 'S', 'O', 'N', 'T'],
        abbreviated:
            ['Sān', 'Fēp', 'Maʻa', 'ʻEpe', 'Mē', 'Sun', 'Siu', 'ʻAok', 'Sep', 'ʻOka', 'Nōv', 'Tīs'],
        wide: [
          'Sānuali', 'Fēpueli', 'Maʻasi', 'ʻEpeleli', 'Mē', 'Sune', 'Siulai', 'ʻAokosi', 'Sepitema',
          'ʻOkatopa', 'Nōvema', 'Tīsema'
        ]
      }
    },
    eras: {abbreviated: ['KM', 'TS'], narrow: ['KM', 'TS'], wide: ['ki muʻa', 'taʻu ʻo Sīsū']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1} {0}'}
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
      nan: 'TF',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'T$', name: 'Paʻanga fakatonga'},
  getPluralCase: getPluralCase
};
