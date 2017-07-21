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
export const NgLocaleVai: NgLocale = {
  localeId: 'vai',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      },
      standalone: {
        abbreviated: {am: 'AM', pm: 'PM'},
        narrow: {am: 'AM', pm: 'PM'},
        wide: {am: 'AM', pm: 'PM'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
        abbreviated: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
        wide: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
        abbreviated: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
        wide: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['ꖨꕪꖃ ꔞꕮ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', '6', '7', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꕪꕱ ꗏꕮ'],
        wide:
            ['ꖨꕪꖃ ꔞꕮ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', '6', '7', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꕪꕱ ꗏꕮ']
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['ꖨꕪꖃ ꔞꕮ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', '6', '7', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꕪꕱ ꗏꕮ'],
        wide: [
          'ꖨꕪꖃ ꔞꕮ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', '6', '7', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꕪꕱ ꗏꕮ'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤#,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '$', name: 'ꕞꔤꔫꕩ ꕜꕞꕌ'},
  getPluralCase: getPluralCase
};
