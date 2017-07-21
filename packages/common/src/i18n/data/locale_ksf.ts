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
export const NgLocaleKsf: NgLocale = {
  localeId: 'ksf',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'sárúwá', pm: 'cɛɛ́nko'},
        narrow: {am: 'sárúwá', pm: 'cɛɛ́nko'},
        wide: {am: 'sárúwá', pm: 'cɛɛ́nko'}
      },
      standalone: {
        abbreviated: {am: 'sárúwá', pm: 'cɛɛ́nko'},
        narrow: {am: 'sárúwá', pm: 'cɛɛ́nko'},
        wide: {am: 'sárúwá', pm: 'cɛɛ́nko'}
      }
    },
    days: {
      format: {
        narrow: ['s', 'l', 'm', 'm', 'j', 'j', 's'],
        short: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
        abbreviated: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
        wide: ['sɔ́ndǝ', 'lǝndí', 'maadí', 'mɛkrɛdí', 'jǝǝdí', 'júmbá', 'samdí']
      },
      standalone: {
        narrow: ['s', 'l', 'm', 'm', 'j', 'j', 's'],
        short: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
        abbreviated: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
        wide: ['sɔ́ndǝ', 'lǝndí', 'maadí', 'mɛkrɛdí', 'jǝǝdí', 'júmbá', 'samdí']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: ['ŋ1', 'ŋ2', 'ŋ3', 'ŋ4', 'ŋ5', 'ŋ6', 'ŋ7', 'ŋ8', 'ŋ9', 'ŋ10', 'ŋ11', 'ŋ12'],
        wide: [
          'ŋwíí a ntɔ́ntɔ', 'ŋwíí akǝ bɛ́ɛ', 'ŋwíí akǝ ráá', 'ŋwíí akǝ nin', 'ŋwíí akǝ táan',
          'ŋwíí akǝ táafɔk', 'ŋwíí akǝ táabɛɛ', 'ŋwíí akǝ táaraa', 'ŋwíí akǝ táanin',
          'ŋwíí akǝ ntɛk', 'ŋwíí akǝ ntɛk di bɔ́k', 'ŋwíí akǝ ntɛk di bɛ́ɛ'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: ['ŋ1', 'ŋ2', 'ŋ3', 'ŋ4', 'ŋ5', 'ŋ6', 'ŋ7', 'ŋ8', 'ŋ9', 'ŋ10', 'ŋ11', 'ŋ12'],
        wide: [
          'ŋwíí a ntɔ́ntɔ', 'ŋwíí akǝ bɛ́ɛ', 'ŋwíí akǝ ráá', 'ŋwíí akǝ nin', 'ŋwíí akǝ táan',
          'ŋwíí akǝ táafɔk', 'ŋwíí akǝ táabɛɛ', 'ŋwíí akǝ táaraa', 'ŋwíí akǝ táanin',
          'ŋwíí akǝ ntɛk', 'ŋwíí akǝ ntɛk di bɔ́k', 'ŋwíí akǝ ntɛk di bɛ́ɛ'
        ]
      }
    },
    eras: {
      abbreviated: ['d.Y.', 'k.Y.'],
      narrow: ['d.Y.', 'k.Y.'],
      wide: ['di Yɛ́sus aká yálɛ', 'cámɛɛn kǝ kǝbɔpka Y']
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'FCFA', name: 'fráŋ'},
  getPluralCase: getPluralCase
};
