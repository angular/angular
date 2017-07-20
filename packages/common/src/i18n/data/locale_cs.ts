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
  if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return Plural.Few;
  if (!(v === 0)) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleCs: NgLocale = {
  localeId: 'cs',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'půln.',
          am: 'dop.',
          noon: 'pol.',
          pm: 'odp.',
          morning1: 'r.',
          morning2: 'dop.',
          afternoon1: 'odp.',
          evening1: 'več.',
          night1: 'v n.'
        },
        narrow: {
          midnight: 'půl.',
          am: 'dop.',
          noon: 'pol.',
          pm: 'odp.',
          morning1: 'r.',
          morning2: 'd.',
          afternoon1: 'o.',
          evening1: 'v.',
          night1: 'n.'
        },
        wide: {
          midnight: 'půlnoc',
          am: 'dop.',
          noon: 'poledne',
          pm: 'odp.',
          morning1: 'ráno',
          morning2: 'dopoledne',
          afternoon1: 'odpoledne',
          evening1: 'večer',
          night1: 'v noci'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'půlnoc',
          am: 'dop.',
          noon: 'poledne',
          pm: 'odp.',
          morning1: 'ráno',
          morning2: 'dopoledne',
          afternoon1: 'odpoledne',
          evening1: 'večer',
          night1: 'noc'
        },
        narrow: {
          midnight: 'půl.',
          am: 'dop.',
          noon: 'pol.',
          pm: 'odp.',
          morning1: 'ráno',
          morning2: 'dop.',
          afternoon1: 'odp.',
          evening1: 'več.',
          night1: 'noc'
        },
        wide: {
          midnight: 'půlnoc',
          am: 'dop.',
          noon: 'poledne',
          pm: 'odp.',
          morning1: 'ráno',
          morning2: 'dopoledne',
          afternoon1: 'odpoledne',
          evening1: 'večer',
          night1: 'noc'
        }
      }
    },
    days: {
      format: {
        narrow: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
        short: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
        abbreviated: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
        wide: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
      },
      standalone: {
        narrow: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
        short: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
        abbreviated: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
        wide: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
        wide: [
          'ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září',
          'října', 'listopadu', 'prosince'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
        wide: [
          'leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září',
          'říjen', 'listopad', 'prosinec'
        ]
      }
    },
    eras: {
      abbreviated: ['př. n. l.', 'n. l.'],
      narrow: ['př.n.l.', 'n.l.'],
      wide: ['př. n. l.', 'n. l.']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d. MMMM y', long: 'd. MMMM y', medium: 'd. M. y', short: 'dd.MM.yy'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '09:00'},
      morning2: {from: '09:00', to: '12:00'},
      night1: {from: '22:00', to: '04:00'},
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
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'Kč', name: 'česká koruna'},
  getPluralCase: getPluralCase
};
