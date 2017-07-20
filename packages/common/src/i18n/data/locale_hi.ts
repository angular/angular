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
export const NgLocaleHi: NgLocale = {
  localeId: 'hi',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'मध्यरात्रि',
          am: 'पूर्वाह्न',
          pm: 'अपराह्न',
          morning1: 'सुबह',
          afternoon1: 'अपराह्न',
          evening1: 'शाम',
          night1: 'रात'
        },
        narrow: {
          midnight: 'मध्यरात्रि',
          am: 'पू',
          pm: 'अ',
          morning1: 'सुबह',
          afternoon1: 'अपराह्न',
          evening1: 'शाम',
          night1: 'शाम'
        },
        wide: {
          midnight: 'मध्यरात्रि',
          am: 'पूर्वाह्न',
          pm: 'अपराह्न',
          morning1: 'सुबह',
          afternoon1: 'अपराह्न',
          evening1: 'शाम',
          night1: 'रात'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'मध्यरात्रि',
          am: 'पूर्वाह्न',
          pm: 'अपराह्न',
          morning1: 'सुबह',
          afternoon1: 'दोपहर',
          evening1: 'शाम',
          night1: 'रात'
        },
        narrow: {
          midnight: 'आधी रात',
          am: 'पू',
          pm: 'अ',
          morning1: 'सुबह',
          afternoon1: 'अपराह्न',
          evening1: 'शाम',
          night1: 'रात'
        },
        wide: {
          midnight: 'मध्यरात्रि',
          am: 'पूर्वाह्न',
          pm: 'अपराह्न',
          morning1: 'सुबह',
          afternoon1: 'दोपहर',
          evening1: 'शाम',
          night1: 'रात'
        }
      }
    },
    days: {
      format: {
        narrow: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        short: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        abbreviated: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      },
      standalone: {
        narrow: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        short: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
        abbreviated: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      }
    },
    months: {
      format: {
        narrow: ['ज', 'फ़', 'मा', 'अ', 'म', 'जू', 'जु', 'अ', 'सि', 'अ', 'न', 'दि'],
        abbreviated:
            ['जन॰', 'फ़र॰', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल॰', 'अग॰', 'सित॰', 'अक्तू॰', 'नव॰', 'दिस॰'],
        wide: [
          'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर',
          'दिसंबर'
        ]
      },
      standalone: {
        narrow: ['ज', 'फ़', 'मा', 'अ', 'म', 'जू', 'जु', 'अ', 'सि', 'अ', 'न', 'दि'],
        abbreviated:
            ['जन॰', 'फ़र॰', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल॰', 'अग॰', 'सित॰', 'अक्तू॰', 'नव॰', 'दिस॰'],
        wide: [
          'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर',
          'दिसंबर'
        ]
      }
    },
    eras: {
      abbreviated: ['ईसा-पूर्व', 'ईस्वी'],
      narrow: ['ईसा-पूर्व', 'ईस्वी'],
      wide: ['ईसा-पूर्व', 'ईसवी सन']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'dd/MM/y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} को {0}', long: '{1} को {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      evening1: {from: '16:00', to: '20:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
      night1: {from: '20:00', to: '04:00'}
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
      currency: '¤#,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '[#E0]'
    }
  },
  currencySettings: {symbol: '₹', name: 'भारतीय रुपया'},
  getPluralCase: getPluralCase
};
