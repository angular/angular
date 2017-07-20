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
export const NgLocaleUz: NgLocale = {
  localeId: 'uz',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        },
        narrow: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        },
        wide: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        },
        narrow: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        },
        wide: {
          midnight: 'yarim tun',
          am: 'TO',
          noon: 'tush payti',
          pm: 'TK',
          morning1: 'ertalab',
          afternoon1: 'kunduzi',
          evening1: 'kechqurun',
          night1: 'kechasi'
        }
      }
    },
    days: {
      format: {
        narrow: ['Y', 'D', 'S', 'C', 'P', 'J', 'S'],
        short: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'],
        abbreviated: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
        wide: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba']
      },
      standalone: {
        narrow: ['Y', 'D', 'S', 'C', 'P', 'J', 'S'],
        short: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'],
        abbreviated: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
        wide: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba']
      }
    },
    months: {
      format: {
        narrow: ['Y', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
        wide: [
          'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr',
          'noyabr', 'dekabr'
        ]
      },
      standalone: {
        narrow: ['Y', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
        wide: [
          'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr',
          'Noyabr', 'Dekabr'
        ]
      }
    },
    eras: {
      abbreviated: ['m.a.', 'milodiy'],
      narrow: ['m.a.', 'milodiy'],
      wide: ['miloddan avvalgi', 'milodiy']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d-MMMM, y', long: 'd-MMMM, y', medium: 'd-MMM, y', short: 'dd/MM/yy'},
      time: {full: 'H:mm:ss (zzzz)', long: 'H:mm:ss (z)', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '11:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '11:00'},
      night1: {from: '22:00', to: '06:00'},
      noon: '12:00'
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
      nan: 'haqiqiy son emas',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'soʻm', name: 'O‘zbekiston so‘mi'},
  getPluralCase: getPluralCase
};
