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
export const NgLocaleTr: NgLocale = {
  localeId: 'tr',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'gece yarısı',
          am: 'ÖÖ',
          noon: 'öğle',
          pm: 'ÖS',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        },
        narrow: {
          midnight: 'gece',
          am: 'öö',
          noon: 'ö',
          pm: 'ös',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        },
        wide: {
          midnight: 'gece yarısı',
          am: 'ÖÖ',
          noon: 'öğle',
          pm: 'ÖS',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'gece yarısı',
          am: 'ÖÖ',
          noon: 'öğle',
          pm: 'ÖS',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        },
        narrow: {
          midnight: 'gece yarısı',
          am: 'ÖÖ',
          noon: 'öğle',
          pm: 'ÖS',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        },
        wide: {
          midnight: 'gece yarısı',
          am: 'ÖÖ',
          noon: 'öğle',
          pm: 'ÖS',
          morning1: 'sabah',
          morning2: 'öğleden önce',
          afternoon1: 'öğleden sonra',
          afternoon2: 'akşamüstü',
          evening1: 'akşam',
          night1: 'gece'
        }
      }
    },
    days: {
      format: {
        narrow: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
        short: ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        abbreviated: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        wide: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      },
      standalone: {
        narrow: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
        short: ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        abbreviated: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        wide: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      }
    },
    months: {
      format: {
        narrow: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
        abbreviated:
            ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        wide: [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül',
          'Ekim', 'Kasım', 'Aralık'
        ]
      },
      standalone: {
        narrow: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
        abbreviated:
            ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        wide: [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül',
          'Ekim', 'Kasım', 'Aralık'
        ]
      }
    },
    eras: {
      abbreviated: ['MÖ', 'MS'],
      narrow: ['MÖ', 'MS'],
      wide: ['Milattan Önce', 'Milattan Sonra']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'd MMMM y EEEE', long: 'd MMMM y', medium: 'd MMM y', short: 'd.MM.y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      afternoon2: {from: '18:00', to: '19:00'},
      evening1: {from: '19:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '11:00'},
      morning2: {from: '11:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'},
      noon: '12:00'
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '%#,##0', scientific: '#E0'}
  },
  currencySettings: {symbol: '₺', name: 'Türk Lirası'},
  getPluralCase: getPluralCase
};
