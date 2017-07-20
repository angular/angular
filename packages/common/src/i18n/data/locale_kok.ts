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
export const NgLocaleKok: NgLocale = {
  localeId: 'kok',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'म.पू.', pm: 'म.नं.'},
        narrow: {am: 'म.पू.', pm: 'म.नं.'},
        wide: {am: 'म.पू.', pm: 'म.नं.'}
      },
      standalone: {
        abbreviated: {am: 'म.पू.', pm: 'म.नं.'},
        narrow: {am: 'म.पू.', pm: 'म.नं.'},
        wide: {am: 'म.पू.', pm: 'म.नं.'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        abbreviated: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['आदित्यवार', 'सोमवार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        abbreviated: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        wide: ['आदित्यवार', 'सोमवार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ओगस्ट', 'सेप्टेंबर', 'ओक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ],
        wide: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ओगस्ट', 'सेप्टेंबर', 'ओक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ओगस्ट', 'सेप्टेंबर', 'ओक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ],
        wide: [
          'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ओगस्ट', 'सेप्टेंबर', 'ओक्टोबर',
          'नोव्हेंबर', 'डिसेंबर'
        ]
      }
    },
    eras: {
      abbreviated: ['क्रिस्तपूर्व', 'क्रिस्तशखा'],
      narrow: ['क्रिस्तपूर्व', 'क्रिस्तशखा'],
      wide: ['क्रिस्तपूर्व', 'क्रिस्तशखा']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
    formats: {
      currency: '¤ #,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₹', name: 'INR'},
  getPluralCase: getPluralCase
};
