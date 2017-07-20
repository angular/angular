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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleYi: NgLocale = {
  localeId: 'yi',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'},
        narrow: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'},
        wide: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'}
      },
      standalone: {
        abbreviated: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'},
        narrow: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'},
        wide: {am: 'פֿאַרמיטאָג', pm: 'נאָכמיטאָג'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
        abbreviated: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
        wide: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
        abbreviated: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
        wide: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער',
          'אקטאבער', 'נאוועמבער', 'דעצעמבער'
        ],
        wide: [
          'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער',
          'אקטאבער', 'נאוועמבער', 'דעצעמבער'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'יאַנ', 'פֿעב', 'מערץ', 'אַפּר', 'מיי', 'יוני', 'יולי', 'אויג', 'סעפּ', 'אקט', 'נאוו', 'דעצ'
        ],
        wide: [
          'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער',
          'אקטאבער', 'נאוועמבער', 'דעצעמבער'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dטן MMMM y', long: 'dטן MMMM y', medium: 'dטן MMM y', short: 'dd/MM/yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1}, {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: '.',
      group: ',',
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {},
  getPluralCase: getPluralCase
};
