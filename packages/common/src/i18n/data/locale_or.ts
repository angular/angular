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
export const NgLocaleOr: NgLocale = {
  localeId: 'or',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'am', pm: 'pm'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'am', pm: 'pm'}
      },
      standalone: {
        abbreviated: {am: 'am', pm: 'pm'},
        narrow: {am: 'am', pm: 'pm'},
        wide: {am: 'am', pm: 'pm'}
      }
    },
    days: {
      format: {
        narrow: ['ର', 'ସୋ', 'ମ', 'ବୁ', 'ଗୁ', 'ଶୁ', 'ଶ'],
        short: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
        abbreviated: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
        wide: ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର']
      },
      standalone: {
        narrow: ['ର', 'ସୋ', 'ମ', 'ବୁ', 'ଗୁ', 'ଶୁ', 'ଶ'],
        short: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
        abbreviated: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
        wide: ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର']
      }
    },
    months: {
      format: {
        narrow: ['ଜା', 'ଫେ', 'ମା', 'ଅ', 'ମଇ', 'ଜୁ', 'ଜୁ', 'ଅ', 'ସେ', 'ଅ', 'ନ', 'ଡି'],
        abbreviated: [
          'ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମଇ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର',
          'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'
        ],
        wide: [
          'ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମଇ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର',
          'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'
        ]
      },
      standalone: {
        narrow: ['ଜା', 'ଫେ', 'ମା', 'ଅ', 'ମଇ', 'ଜୁ', 'ଜୁ', 'ଅ', 'ସେ', 'ଅ', 'ନ', 'ଡି'],
        abbreviated: [
          'ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମଇ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର',
          'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'
        ],
        wide: [
          'ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମଇ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର',
          'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd-M-yy'},
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
    formats: {
      currency: '¤ #,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₹', name: 'ଟଙକା'},
  getPluralCase: getPluralCase
};
