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
  let f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19)) return Plural.One;
  if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 &&
      !(n % 100 >= 11 && n % 100 <= 19))
    return Plural.Few;
  if (!(f === 0)) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleLt: NgLocale = {
  localeId: 'lt',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'vidurnaktis',
          am: 'priešpiet',
          noon: 'perpiet',
          pm: 'popiet',
          morning1: 'rytas',
          afternoon1: 'popietė',
          evening1: 'vakaras',
          night1: 'naktis'
        },
        narrow: {
          midnight: 'vidurnaktis',
          am: 'pr. p.',
          noon: 'perpiet',
          pm: 'pop.',
          morning1: 'rytas',
          afternoon1: 'popietė',
          evening1: 'vakaras',
          night1: 'naktis'
        },
        wide: {
          midnight: 'vidurnaktis',
          am: 'priešpiet',
          noon: 'perpiet',
          pm: 'popiet',
          morning1: 'rytas',
          afternoon1: 'popietė',
          evening1: 'vakaras',
          night1: 'naktis'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'vidurnaktis',
          am: 'priešpiet',
          noon: 'vidurdienis',
          pm: 'popiet',
          morning1: 'rytas',
          afternoon1: 'diena',
          evening1: 'vakaras',
          night1: 'naktis'
        },
        narrow: {
          midnight: 'vidurnaktis',
          am: 'pr. p.',
          noon: 'vidurdienis',
          pm: 'pop.',
          morning1: 'rytas',
          afternoon1: 'diena',
          evening1: 'vakaras',
          night1: 'naktis'
        },
        wide: {
          midnight: 'vidurnaktis',
          am: 'priešpiet',
          noon: 'vidurdienis',
          pm: 'popiet',
          morning1: 'rytas',
          afternoon1: 'diena',
          evening1: 'vakaras',
          night1: 'naktis'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'P', 'A', 'T', 'K', 'P', 'Š'],
        short: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
        abbreviated: ['sk', 'pr', 'an', 'tr', 'kt', 'pn', 'št'],
        wide: [
          'sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis', 'ketvirtadienis',
          'penktadienis', 'šeštadienis'
        ]
      },
      standalone: {
        narrow: ['S', 'P', 'A', 'T', 'K', 'P', 'Š'],
        short: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
        abbreviated: ['sk', 'pr', 'an', 'tr', 'kt', 'pn', 'št'],
        wide: [
          'sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis', 'ketvirtadienis',
          'penktadienis', 'šeštadienis'
        ]
      }
    },
    months: {
      format: {
        narrow: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'],
        abbreviated: [
          'saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.',
          'lapkr.', 'gruod.'
        ],
        wide: [
          'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio',
          'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'
        ]
      },
      standalone: {
        narrow: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'],
        abbreviated: [
          'saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.',
          'lapkr.', 'gruod.'
        ],
        wide: [
          'sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis',
          'rugsėjis', 'spalis', 'lapkritis', 'gruodis'
        ]
      }
    },
    eras: {
      abbreviated: ['pr. Kr.', 'po Kr.'],
      narrow: ['pr. Kr.', 'po Kr.'],
      wide: ['prieš Kristų', 'po Kristaus']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y \'m\'. MMMM d \'d\'., EEEE',
        long: 'y \'m\'. MMMM d \'d\'.',
        medium: 'y-MM-dd',
        short: 'y-MM-dd'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '00:00', to: '06:00'},
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
      minusSign: '−',
      exponential: '×10^',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'Euras'},
  getPluralCase: getPluralCase
};
