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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleDua: NgLocale = {
  localeId: 'dua',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'idiɓa', pm: 'ebyámu'},
        narrow: {am: 'idiɓa', pm: 'ebyámu'},
        wide: {am: 'idiɓa', pm: 'ebyámu'}
      },
      standalone: {
        abbreviated: {am: 'idiɓa', pm: 'ebyámu'},
        narrow: {am: 'idiɓa', pm: 'ebyámu'},
        wide: {am: 'idiɓa', pm: 'ebyámu'}
      }
    },
    days: {
      format: {
        narrow: ['e', 'm', 'k', 'm', 'ŋ', 'ɗ', 'e'],
        short: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
        abbreviated: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
        wide: ['éti', 'mɔ́sú', 'kwasú', 'mukɔ́sú', 'ŋgisú', 'ɗónɛsú', 'esaɓasú']
      },
      standalone: {
        narrow: ['e', 'm', 'k', 'm', 'ŋ', 'ɗ', 'e'],
        short: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
        abbreviated: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
        wide: ['éti', 'mɔ́sú', 'kwasú', 'mukɔ́sú', 'ŋgisú', 'ɗónɛsú', 'esaɓasú']
      }
    },
    months: {
      format: {
        narrow: ['d', 'ŋ', 's', 'd', 'e', 'e', 'm', 'd', 'n', 'm', 't', 'e'],
        abbreviated:
            ['di', 'ŋgɔn', 'sɔŋ', 'diɓ', 'emi', 'esɔ', 'mad', 'diŋ', 'nyɛt', 'may', 'tin', 'elá'],
        wide: [
          'dimɔ́di', 'ŋgɔndɛ', 'sɔŋɛ', 'diɓáɓá', 'emiasele', 'esɔpɛsɔpɛ', 'madiɓɛ́díɓɛ́', 'diŋgindi',
          'nyɛtɛki', 'mayésɛ́', 'tiníní', 'eláŋgɛ́'
        ]
      },
      standalone: {
        narrow: ['d', 'ŋ', 's', 'd', 'e', 'e', 'm', 'd', 'n', 'm', 't', 'e'],
        abbreviated:
            ['di', 'ŋgɔn', 'sɔŋ', 'diɓ', 'emi', 'esɔ', 'mad', 'diŋ', 'nyɛt', 'may', 'tin', 'elá'],
        wide: [
          'dimɔ́di', 'ŋgɔndɛ', 'sɔŋɛ', 'diɓáɓá', 'emiasele', 'esɔpɛsɔpɛ', 'madiɓɛ́díɓɛ́', 'diŋgindi',
          'nyɛtɛki', 'mayésɛ́', 'tiníní', 'eláŋgɛ́'
        ]
      }
    },
    eras: {
      abbreviated: ['ɓ.Ys', 'mb.Ys'],
      narrow: ['ɓ.Ys', 'mb.Ys'],
      wide: ['ɓoso ɓwá yáɓe lá', 'mbúsa kwédi a Yés']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: 'FCFA', name: 'XAF'},
  getPluralCase: getPluralCase
};
