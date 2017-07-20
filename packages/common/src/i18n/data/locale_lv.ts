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
  let v = n.toString().replace(/^[^.]*\.?/, '').length,
      f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
  if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
      v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
    return Plural.Zero;
  if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
      !(v === 2) && f % 10 === 1)
    return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleLv: NgLocale = {
  localeId: 'lv',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'pusnaktī',
          am: 'priekšp.',
          noon: 'pusd.',
          pm: 'pēcp.',
          morning1: 'no rīta',
          afternoon1: 'pēcpusd.',
          evening1: 'vakarā',
          night1: 'naktī'
        },
        narrow: {
          midnight: 'pusnaktī',
          am: 'priekšp.',
          noon: 'pusd.',
          pm: 'pēcp.',
          morning1: 'no rīta',
          afternoon1: 'pēcpusdienā',
          evening1: 'vakarā',
          night1: 'naktī'
        },
        wide: {
          midnight: 'pusnaktī',
          am: 'priekšpusdienā',
          noon: 'pusdienlaikā',
          pm: 'pēcpusdienā',
          morning1: 'no rīta',
          afternoon1: 'pēcpusdienā',
          evening1: 'vakarā',
          night1: 'naktī'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'pusnakts',
          am: 'priekšp.',
          noon: 'pusd.',
          pm: 'pēcpusd.',
          morning1: 'rīts',
          afternoon1: 'pēcpusdiena',
          evening1: 'vakars',
          night1: 'nakts'
        },
        narrow: {
          midnight: 'pusnakts',
          am: 'priekšp.',
          noon: 'pusd.',
          pm: 'pēcp.',
          morning1: 'rīts',
          afternoon1: 'pēcpusd.',
          evening1: 'vakars',
          night1: 'nakts'
        },
        wide: {
          midnight: 'pusnakts',
          am: 'priekšpusdiena',
          noon: 'pusdienlaiks',
          pm: 'pēcpusdiena',
          morning1: 'rīts',
          afternoon1: 'pēcpusdiena',
          evening1: 'vakars',
          night1: 'nakts'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
        short: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
        abbreviated: ['svētd.', 'pirmd.', 'otrd.', 'trešd.', 'ceturtd.', 'piektd.', 'sestd.'],
        wide: [
          'svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena', 'ceturtdiena', 'piektdiena',
          'sestdiena'
        ]
      },
      standalone: {
        narrow: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
        short: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
        abbreviated: ['Svētd.', 'Pirmd.', 'Otrd.', 'Trešd.', 'Ceturtd.', 'Piektd.', 'Sestd.'],
        wide: [
          'Svētdiena', 'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena',
          'Sestdiena'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.',
          'nov.', 'dec.'
        ],
        wide: [
          'janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts',
          'septembris', 'oktobris', 'novembris', 'decembris'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.',
          'nov.', 'dec.'
        ],
        wide: [
          'janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts',
          'septembris', 'oktobris', 'novembris', 'decembris'
        ]
      }
    },
    eras: {
      abbreviated: ['p.m.ē.', 'm.ē.'],
      narrow: ['p.m.ē.', 'm.ē.'],
      wide: ['pirms mūsu ēras', 'mūsu ērā']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE, y. \'gada\' d. MMMM',
        long: 'y. \'gada\' d. MMMM',
        medium: 'y. \'gada\' d. MMM',
        short: 'dd.MM.yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '23:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '23:00', to: '06:00'},
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
      nan: 'NS',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'eiro'},
  getPluralCase: getPluralCase
};
