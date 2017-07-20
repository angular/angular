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
  if (n === 2) return Plural.Two;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSmn: NgLocale = {
  localeId: 'smn',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ip.', pm: 'ep.'},
        narrow: {am: 'ip.', pm: 'ep.'},
        wide: {am: 'ip.', pm: 'ep.'}
      },
      standalone: {
        abbreviated: {am: 'ip.', pm: 'ep.'},
        narrow: {am: 'ip.', pm: 'ep.'},
        wide: {am: 'ip.', pm: 'ep.'}
      }
    },
    days: {
      format: {
        narrow: ['p', 'V', 'M', 'K', 'T', 'V', 'L'],
        short: ['pa', 'vu', 'ma', 'ko', 'tu', 'vá', 'lá'],
        abbreviated: ['pas', 'vuo', 'maj', 'kos', 'tuo', 'vás', 'láv'],
        wide: [
          'pasepeeivi', 'vuossaargâ', 'majebaargâ', 'koskoho', 'tuorâstuv', 'vástuppeeivi',
          'lávurduv'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['pa', 'vu', 'ma', 'ko', 'tu', 'vá', 'lá'],
        abbreviated: ['pas', 'vuo', 'maj', 'kos', 'tuo', 'vás', 'láv'],
        wide: [
          'pasepeivi', 'vuossargâ', 'majebargâ', 'koskokko', 'tuorâstâh', 'vástuppeivi', 'lávurdâh'
        ]
      }
    },
    months: {
      format: {
        narrow: ['U', 'K', 'NJ', 'C', 'V', 'K', 'S', 'P', 'Č', 'R', 'S', 'J'],
        abbreviated: [
          'uđiv', 'kuovâ', 'njuhčâ', 'cuáŋui', 'vyesi', 'kesi', 'syeini', 'porge', 'čohčâ',
          'roovvâd', 'skammâ', 'juovlâ'
        ],
        wide: [
          'uđđâivemáánu', 'kuovâmáánu', 'njuhčâmáánu', 'cuáŋuimáánu', 'vyesimáánu', 'kesimáánu',
          'syeinimáánu', 'porgemáánu', 'čohčâmáánu', 'roovvâdmáánu', 'skammâmáánu', 'juovlâmáánu'
        ]
      },
      standalone: {
        narrow: ['U', 'K', 'NJ', 'C', 'V', 'K', 'S', 'P', 'Č', 'R', 'S', 'J'],
        abbreviated: [
          'uđiv', 'kuovâ', 'njuhčâ', 'cuáŋui', 'vyesi', 'kesi', 'syeini', 'porge', 'čohčâ',
          'roovvâd', 'skammâ', 'juovlâ'
        ],
        wide: [
          'uđđâivemáánu', 'kuovâmáánu', 'njuhčâmáánu', 'cuáŋuimáánu', 'vyesimáánu', 'kesimáánu',
          'syeinimáánu', 'porgemáánu', 'čohčâmáánu', 'roovvâdmáánu', 'skammâmáánu', 'juovlâmáánu'
        ]
      }
    },
    eras: {
      abbreviated: ['oKr.', 'mKr.'],
      narrow: ['oKr.', 'mKr.'],
      wide: ['Ovdil Kristus šoddâm', 'maŋa Kristus šoddâm']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'cccc, MMMM d. y', long: 'MMMM d. y', medium: 'MMM d. y', short: 'd.M.y'},
      time: {full: 'H.mm.ss zzzz', long: 'H.mm.ss z', medium: 'H.mm.ss', short: 'H.mm'},
      dateTime: {
        full: '{1} \'tme\' {0}',
        long: '{1} \'tme\' {0}',
        medium: '{1} \'tme\' {0}',
        short: '{1} {0}'
      }
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
      nan: 'epiloho',
      timeSeparator: '.'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
