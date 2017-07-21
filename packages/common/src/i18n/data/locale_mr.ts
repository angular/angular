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
export const NgLocaleMr: NgLocale = {
  localeId: 'mr',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'मध्यरात्र',
          am: 'म.पू.',
          noon: 'मध्यान्ह',
          pm: 'म.उ.',
          morning1: 'पहाट',
          morning2: 'सकाळ',
          afternoon1: 'दुपार',
          evening1: 'संध्याकाळ',
          evening2: 'सायंकाळ',
          night1: 'रात्र'
        },
        narrow: {
          midnight: 'म.रा.',
          am: 'स',
          noon: 'दु',
          pm: 'सं',
          morning1: 'प',
          morning2: 'स',
          afternoon1: 'दु',
          evening1: 'सं',
          evening2: 'सा',
          night1: 'रा'
        },
        wide: {
          midnight: 'मध्यरात्र',
          am: 'म.पू.',
          noon: 'मध्यान्ह',
          pm: 'म.उ.',
          morning1: 'पहाट',
          morning2: 'सकाळ',
          afternoon1: 'दुपार',
          evening1: 'संध्याकाळ',
          evening2: 'सायंकाळ',
          night1: 'रात्र'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'मध्यरात्र',
          am: 'म.पू.',
          noon: 'मध्यान्ह',
          pm: 'म.उ.',
          morning1: 'पहाट',
          morning2: 'सकाळ',
          afternoon1: 'दुपार',
          evening1: 'संध्याकाळ',
          evening2: 'सायंकाळ',
          night1: 'रात्र'
        },
        narrow: {
          midnight: 'म.रा.',
          am: 'म.पू.',
          noon: 'म',
          pm: 'म.उ.',
          morning1: 'प',
          morning2: 'स',
          afternoon1: 'दु',
          evening1: 'सं',
          evening2: 'सा',
          night1: 'रात्र'
        },
        wide: {
          midnight: 'मध्यरात्र',
          am: 'म.पू.',
          noon: 'मध्यान्ह',
          pm: 'म.उ.',
          morning1: 'पहाट',
          morning2: 'सकाळ',
          afternoon1: 'दुपार',
          evening1: 'संध्याकाळ',
          evening2: 'सायंकाळ',
          night1: 'रात्र'
        }
      }
    },
    days: {
      format: {
        narrow: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        short: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        abbreviated: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      },
      standalone: {
        narrow: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        short: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        abbreviated: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      }
    },
    months: {
      format: {
        narrow: ['जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'],
        abbreviated:
            ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
        wide: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ]
      },
      standalone: {
        narrow: ['जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'],
        abbreviated:
            ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
        wide: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ]
      }
    },
    eras: {
      abbreviated: ['इ. स. पू.', 'इ. स.'],
      narrow: ['इ. स. पू.', 'इ. स.'],
      wide: ['ईसवीसनपूर्व', 'ईसवीसन']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime:
          {full: '{1} रोजी {0}', long: '{1} रोजी {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '18:00'},
      evening2: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '04:00'},
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
    formats:
        {currency: '¤#,##0.00', decimal: '#,##,##0.###', percent: '#,##0%', scientific: '[#E0]'}
  },
  currencySettings: {symbol: '₹', name: 'भारतीय रुपया'},
  getPluralCase: getPluralCase
};
