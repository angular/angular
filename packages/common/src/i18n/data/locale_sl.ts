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
  if (v === 0 && i % 100 === 1) return Plural.One;
  if (v === 0 && i % 100 === 2) return Plural.Two;
  if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
    return Plural.Few;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSl: NgLocale = {
  localeId: 'sl',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'opoln.',
          am: 'dop.',
          noon: 'opold.',
          pm: 'pop.',
          morning1: 'zjut.',
          morning2: 'dop.',
          afternoon1: 'pop.',
          evening1: 'zveč.',
          night1: 'noč'
        },
        narrow: {
          midnight: '24.00',
          am: 'd',
          noon: '12.00',
          pm: 'p',
          morning1: 'zj',
          morning2: 'd',
          afternoon1: 'p',
          evening1: 'zv',
          night1: 'po'
        },
        wide: {
          midnight: 'opolnoči',
          am: 'dop.',
          noon: 'opoldne',
          pm: 'pop.',
          morning1: 'zjutraj',
          morning2: 'dopoldan',
          afternoon1: 'popoldan',
          evening1: 'zvečer',
          night1: 'ponoči'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'poln.',
          am: 'dop.',
          noon: 'pold.',
          pm: 'pop.',
          morning1: 'jut.',
          morning2: 'dop.',
          afternoon1: 'pop.',
          evening1: 'zveč.',
          night1: 'noč'
        },
        narrow: {
          midnight: '24.00',
          am: 'd',
          noon: '12.00',
          pm: 'p',
          morning1: 'j',
          morning2: 'd',
          afternoon1: 'p',
          evening1: 'v',
          night1: 'n'
        },
        wide: {
          midnight: 'polnoč',
          am: 'dopoldne',
          noon: 'poldne',
          pm: 'popoldne',
          morning1: 'jutro',
          morning2: 'dopoldne',
          afternoon1: 'popoldne',
          evening1: 'večer',
          night1: 'noč'
        }
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 't', 's', 'č', 'p', 's'],
        short: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        abbreviated: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        wide: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
      },
      standalone: {
        narrow: ['n', 'p', 't', 's', 'č', 'p', 's'],
        short: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        abbreviated: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        wide: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september',
          'oktober', 'november', 'december'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.', 'sep.', 'okt.', 'nov.',
          'dec.'
        ],
        wide: [
          'januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september',
          'oktober', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['pr. Kr.', 'po Kr.'],
      narrow: ['pr. Kr.', 'po Kr.'],
      wide: ['pred Kristusom', 'po Kristusu']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd. MMMM y', long: 'dd. MMMM y', medium: 'd. MMM y', short: 'd. MM. yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '22:00', to: '06:00'},
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
      minusSign: '−',
      exponential: 'e',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'evro'},
  getPluralCase: getPluralCase
};
