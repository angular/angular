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
  let i = Math.floor(Math.abs(n)),
      t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
  if (t === 0 && i % 10 === 1 && !(i % 100 === 11) || !(t === 0)) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleIs: NgLocale = {
  localeId: 'is',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'miðn.',
          am: 'f.h.',
          noon: 'hád.',
          pm: 'e.h.',
          morning1: 'að morgni',
          afternoon1: 'síðd.',
          evening1: 'að kv.',
          night1: 'að nóttu'
        },
        narrow: {
          midnight: 'mn.',
          am: 'f.',
          noon: 'h.',
          pm: 'e.',
          morning1: 'mrg.',
          afternoon1: 'sd.',
          evening1: 'kv.',
          night1: 'n.'
        },
        wide: {
          midnight: 'miðnætti',
          am: 'f.h.',
          noon: 'hádegi',
          pm: 'e.h.',
          morning1: 'að morgni',
          afternoon1: 'síðdegis',
          evening1: 'að kvöldi',
          night1: 'að nóttu'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'miðn.',
          am: 'f.h.',
          noon: 'hád.',
          pm: 'e.h.',
          morning1: 'morg.',
          afternoon1: 'síðd.',
          evening1: 'kv.',
          night1: 'nótt'
        },
        narrow: {
          midnight: 'mn.',
          am: 'f.h.',
          noon: 'hd.',
          pm: 'e.h.',
          morning1: 'mrg.',
          afternoon1: 'sd.',
          evening1: 'kv.',
          night1: 'n.'
        },
        wide: {
          midnight: 'miðnætti',
          am: 'f.h.',
          noon: 'hádegi',
          pm: 'e.h.',
          morning1: 'morgunn',
          afternoon1: 'eftir hádegi',
          evening1: 'kvöld',
          night1: 'nótt'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'Þ', 'M', 'F', 'F', 'L'],
        short: ['su.', 'má.', 'þr.', 'mi.', 'fi.', 'fö.', 'la.'],
        abbreviated: ['sun.', 'mán.', 'þri.', 'mið.', 'fim.', 'fös.', 'lau.'],
        wide: [
          'sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur', 'fimmtudagur', 'föstudagur',
          'laugardagur'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'Þ', 'M', 'F', 'F', 'L'],
        short: ['su.', 'má.', 'þr.', 'mi.', 'fi.', 'fö.', 'la.'],
        abbreviated: ['sun.', 'mán.', 'þri.', 'mið.', 'fim.', 'fös.', 'lau.'],
        wide: [
          'sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur', 'fimmtudagur', 'föstudagur',
          'laugardagur'
        ]
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'Á', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maí', 'jún.', 'júl.', 'ágú.', 'sep.', 'okt.', 'nóv.',
          'des.'
        ],
        wide: [
          'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september',
          'október', 'nóvember', 'desember'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'Á', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'jan.', 'feb.', 'mar.', 'apr.', 'maí', 'jún.', 'júl.', 'ágú.', 'sep.', 'okt.', 'nóv.',
          'des.'
        ],
        wide: [
          'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september',
          'október', 'nóvember', 'desember'
        ]
      }
    },
    eras: {
      abbreviated: ['f.Kr.', 'e.Kr.'],
      narrow: ['f.k.', 'e.k.'],
      wide: ['fyrir Krist', 'eftir Krist']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd. MMM y', short: 'd.M.y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {
        full: '{1} \'kl\'. {0}',
        long: '{1} \'kl\'. {0}',
        medium: '{1}, {0}',
        short: '{1}, {0}'
      }
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'ISK', name: 'íslensk króna'},
  getPluralCase: getPluralCase
};
