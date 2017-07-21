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
  let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return Plural.One;
  if (i === 2 && v === 0) return Plural.Two;
  if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleHe: NgLocale = {
  localeId: 'he',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        },
        narrow: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        },
        wide: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        },
        narrow: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        },
        wide: {
          midnight: 'חצות',
          am: 'לפנה״צ',
          pm: 'אחה״צ',
          morning1: 'בוקר',
          afternoon1: 'צהריים',
          afternoon2: 'אחר הצהריים',
          evening1: 'ערב',
          night1: 'לילה',
          night2: 'לפנות בוקר'
        }
      }
    },
    days: {
      format: {
        narrow: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
        short: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
        abbreviated: ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
        wide:
            ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת']
      },
      standalone: {
        narrow: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
        short: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
        abbreviated: ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
        wide: [
          'יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳',
          'דצמ׳'
        ],
        wide: [
          'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר',
          'נובמבר', 'דצמבר'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳',
          'דצמ׳'
        ],
        wide: [
          'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר',
          'נובמבר', 'דצמבר'
        ]
      }
    },
    eras: {
      abbreviated: ['לפנה״ס', 'לספירה'],
      narrow: ['לפנה״ס', 'לספירה'],
      wide: ['לפני הספירה', 'לספירה']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [5, 6],
    formats: {
      date: {full: 'EEEE, d בMMMM y', long: 'd בMMMM y', medium: 'd בMMM y', short: 'd.M.y'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime:
          {full: '{1} בשעה {0}', long: '{1} בשעה {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      afternoon2: {from: '16:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '22:00', to: '03:00'},
      night2: {from: '03:00', to: '06:00'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '‎+',
      minusSign: '‎-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {
      currency: '‏#,##0.00 ¤;‏-#,##0.00 ¤',
      decimal: '#,##0.###',
      percent: '#,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₪', name: 'שקל חדש'},
  getPluralCase: getPluralCase
};
