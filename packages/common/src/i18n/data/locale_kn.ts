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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleKn: NgLocale = {
  localeId: 'kn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'ಮಧ್ಯ ರಾತ್ರಿ',
          am: 'ಪೂರ್ವಾಹ್ನ',
          pm: 'ಅಪರಾಹ್ನ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        },
        narrow: {
          midnight: 'ಮಧ್ಯರಾತ್ರಿ',
          am: 'ಪೂ',
          pm: 'ಅ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        },
        wide: {
          midnight: 'ಮಧ್ಯ ರಾತ್ರಿ',
          am: 'ಪೂರ್ವಾಹ್ನ',
          pm: 'ಅಪರಾಹ್ನ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'ಮಧ್ಯರಾತ್ರಿ',
          am: 'ಪೂರ್ವಾಹ್ನ',
          pm: 'ಅಪರಾಹ್ನ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        },
        narrow: {
          midnight: 'ಮಧ್ಯರಾತ್ರಿ',
          am: 'ಪೂರ್ವಾಹ್ನ',
          pm: 'ಅಪರಾಹ್ನ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        },
        wide: {
          midnight: 'ಮಧ್ಯರಾತ್ರಿ',
          am: 'ಪೂರ್ವಾಹ್ನ',
          pm: 'ಅಪರಾಹ್ನ',
          morning1: 'ಬೆಳಗ್ಗೆ',
          afternoon1: 'ಮಧ್ಯಾಹ್ನ',
          evening1: 'ಸಂಜೆ',
          night1: 'ರಾತ್ರಿ'
        }
      }
    },
    days: {
      format: {
        narrow: ['ಭಾ', 'ಸೋ', 'ಮಂ', 'ಬು', 'ಗು', 'ಶು', 'ಶ'],
        short: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
        abbreviated: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
        wide: ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ']
      },
      standalone: {
        narrow: ['ಭಾ', 'ಸೋ', 'ಮಂ', 'ಬು', 'ಗು', 'ಶು', 'ಶ'],
        short: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
        abbreviated: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
        wide: ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ']
      }
    },
    months: {
      format: {
        narrow: ['ಜ', 'ಫೆ', 'ಮಾ', 'ಏ', 'ಮೇ', 'ಜೂ', 'ಜು', 'ಆ', 'ಸೆ', 'ಅ', 'ನ', 'ಡಿ'],
        abbreviated:
            ['ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ', 'ಮೇ', 'ಜೂನ್', 'ಜು���ೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'],
        wide: [
          'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
          'ಡಿಸೆಂಬರ್'
        ]
      },
      standalone: {
        narrow: ['ಜ', 'ಫೆ', 'ಮಾ', 'ಏ', 'ಮೇ', 'ಜೂ', 'ಜು', 'ಆ', 'ಸೆ', 'ಅ', 'ನ', 'ಡಿ'],
        abbreviated:
            ['ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'],
        wide: [
          'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
          'ಡಿಸೆಂಬರ್'
        ]
      }
    },
    eras: {
      abbreviated: ['ಕ್ರಿ.ಪೂ', 'ಕ್ರಿ.ಶ'],
      narrow: ['ಕ್ರಿ.ಪೂ', 'ಕ್ರಿ.ಶ'],
      wide: ['ಕ್ರಿಸ್ತ ಪೂರ್ವ', 'ಕ್ರಿಸ್ತ ಶಕ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'd/M/yy'},
      time: {full: 'hh:mm:ss a zzzz', long: 'hh:mm:ss a z', medium: 'hh:mm:ss a', short: 'hh:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'}
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
  currencySettings: {symbol: '₹', name: 'ಭಾರತೀಯ ರೂಪಾಯಿ'},
  getPluralCase: getPluralCase
};
