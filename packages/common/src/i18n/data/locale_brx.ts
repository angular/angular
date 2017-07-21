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
export const NgLocaleBrx: NgLocale = {
  localeId: 'brx',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'फुं', pm: 'बेलासे'},
        narrow: {am: 'फुं', pm: 'बेलासे'},
        wide: {am: 'फुं', pm: 'बेलासे'}
      },
      standalone: {
        abbreviated: {am: 'फुं', pm: 'बेलासे'},
        narrow: {am: 'फुं', pm: 'बेलासे'},
        wide: {am: 'फुं', pm: 'बेलासे'}
      }
    },
    days: {
      format: {
        narrow: ['र', 'स', 'मं', 'बु', 'बि', 'सु', 'सु'],
        short: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
        abbreviated: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
        wide: ['रबिबार', 'समबार', 'मंगलबार', 'बुदबार', 'बिसथिबार', 'सुखुरबार', 'सुनिबार']
      },
      standalone: {
        narrow: ['र', 'स', 'मं', 'बु', 'बि', 'सु', 'सु'],
        short: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
        abbreviated: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
        wide: ['रबिबार', 'समबार', 'मंगलबार', 'बुदबार', 'बिसथिबार', 'सुखुरबार', 'सुनिबार']
      }
    },
    months: {
      format: {
        narrow: ['ज', 'फे', 'मा', 'ए', 'मे', 'जु', 'जु', 'आ', 'से', 'अ', 'न', 'दि'],
        abbreviated: [
          'जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर',
          'नबेज्ब़र', 'दिसेज्ब़र'
        ],
        wide: [
          'जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर',
          'नबेज्ब़र', 'दिसेज्ब़र'
        ]
      },
      standalone: {
        narrow: ['ज', 'फे', 'मा', 'ए', 'मे', 'जु', 'जु', 'आ', 'से', 'अ', 'न', 'दि'],
        abbreviated: [
          'जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर',
          'नबेज्ब़र', 'दिसेज्ब़र'
        ],
        wide: [
          'जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर',
          'नबेज्ब़र', 'दिसेज्ब़र'
        ]
      }
    },
    eras: {abbreviated: ['ईसा.पूर्व', 'सन'], narrow: ['ईसा.पूर्व', 'सन'], wide: ['ईसा.पूर्व', 'सन']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'M/d/yy'},
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
  currencySettings: {symbol: '₹', name: 'रां'},
  getPluralCase: getPluralCase
};
