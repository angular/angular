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
  return Plural.Other;
}

/** @experimental */
export const NgLocaleChr: NgLocale = {
  localeId: 'chr',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'ᏌᎾᎴ', noon: 'ᎢᎦ', pm: 'ᏒᎯᏱᎢᏗᏢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'},
        narrow: {am: 'Ꮜ', noon: 'Ꭲ', pm: 'Ꮢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'},
        wide: {am: 'ᏌᎾᎴ', noon: 'ᎢᎦ', pm: 'ᏒᎯᏱᎢᏗᏢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'}
      },
      standalone: {
        abbreviated: {am: 'ᏌᎾᎴ', noon: 'ᎢᎦ', pm: 'ᏒᎯᏱᎢᏗᏢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'},
        narrow: {am: 'ᏌᎾᎴ', noon: 'ᎢᎦ', pm: 'ᏒᎯᏱᎢᏗᏢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'},
        wide: {am: 'ᏌᎾᎴ', noon: 'ᎢᎦ', pm: 'ᏒᎯᏱᎢᏗᏢ', morning1: 'ᏌᎾᎴ', afternoon1: 'ᏒᎯᏱᎢᏗᏢ'}
      }
    },
    days: {
      format: {
        narrow: ['Ꮖ', 'Ꮙ', 'Ꮤ', 'Ꮶ', 'Ꮕ', 'Ꮷ', 'Ꭴ'],
        short: ['ᏍᎬ', 'ᏅᎯ', 'ᏔᎵ', 'ᏦᎢ', 'ᏅᎩ', 'ᏧᎾ', 'ᏕᎾ'],
        abbreviated: ['ᏆᏍᎬ', 'ᏉᏅᎯ', 'ᏔᎵᏁ', 'ᏦᎢᏁ', 'ᏅᎩᏁ', 'ᏧᎾᎩ', 'ᏈᏕᎾ'],
        wide: ['ᎤᎾᏙᏓᏆᏍᎬ', 'ᎤᎾᏙᏓᏉᏅᎯ', 'ᏔᎵᏁᎢᎦ', 'ᏦᎢᏁᎢᎦ', 'ᏅᎩᏁᎢᎦ', 'ᏧᎾᎩᎶᏍᏗ', 'ᎤᎾᏙᏓᏈᏕᎾ']
      },
      standalone: {
        narrow: ['Ꮖ', 'Ꮙ', 'Ꮤ', 'Ꮶ', 'Ꮕ', 'Ꮷ', 'Ꭴ'],
        short: ['ᏍᎬ', 'ᏅᎯ', 'ᏔᎵ', 'ᏦᎢ', 'ᏅᎩ', 'ᏧᎾ', 'ᏕᎾ'],
        abbreviated: ['ᏆᏍᎬ', 'ᏉᏅᎯ', 'ᏔᎵᏁ', 'ᏦᎢᏁ', 'ᏅᎩᏁ', 'ᏧᎾᎩ', 'ᏈᏕᎾ'],
        wide: ['ᎤᎾᏙᏓᏆᏍᎬ', 'ᎤᎾᏙᏓᏉᏅᎯ', 'ᏔᎵᏁᎢᎦ', 'ᏦᎢᏁᎢᎦ', 'ᏅᎩᏁᎢᎦ', 'ᏧᎾᎩᎶᏍᏗ', 'ᎤᎾᏙᏓᏈᏕᎾ']
      }
    },
    months: {
      format: {
        narrow: ['Ꭴ', 'Ꭷ', 'Ꭰ', 'Ꭷ', 'Ꭰ', 'Ꮥ', 'Ꭻ', 'Ꭶ', 'Ꮪ', 'Ꮪ', 'Ꮕ', 'Ꭵ'],
        abbreviated: ['ᎤᏃ', 'ᎧᎦ', 'ᎠᏅ', 'ᎧᏬ', 'ᎠᏂ', 'ᏕᎭ', 'ᎫᏰ', 'ᎦᎶ', 'ᏚᎵ', 'ᏚᏂ', 'ᏅᏓ', 'ᎥᏍ'],
        wide: [
          'ᎤᏃᎸᏔᏅ', 'ᎧᎦᎵ', 'ᎠᏅᏱ', 'ᎧᏬᏂ', 'ᎠᏂᏍᎬᏘ', 'ᏕᎭᎷᏱ', 'ᎫᏰᏉᏂ', 'ᎦᎶᏂ', 'ᏚᎵᏍᏗ', 'ᏚᏂᏅᏗ', 'ᏅᏓᏕᏆ',
          'ᎥᏍᎩᏱ'
        ]
      },
      standalone: {
        narrow: ['Ꭴ', 'Ꭷ', 'Ꭰ', 'Ꭷ', 'Ꭰ', 'Ꮥ', 'Ꭻ', 'Ꭶ', 'Ꮪ', 'Ꮪ', 'Ꮕ', 'Ꭵ'],
        abbreviated: ['ᎤᏃ', 'ᎧᎦ', 'ᎠᏅ', 'ᎧᏬ', 'ᎠᏂ', 'ᏕᎭ', 'ᎫᏰ', 'ᎦᎶ', 'ᏚᎵ', 'ᏚᏂ', 'ᏅᏓ', 'ᎥᏍ'],
        wide: [
          'ᎤᏃᎸᏔᏅ', 'ᎧᎦᎵ', 'ᎠᏅᏱ', 'ᎧᏬᏂ', 'ᎠᏂᏍᎬᏘ', 'ᏕᎭᎷᏱ', 'ᎫᏰᏉᏂ', 'ᎦᎶᏂ', 'ᏚᎵᏍᏗ', 'ᏚᏂᏅᏗ', 'ᏅᏓᏕᏆ',
          'ᎥᏍᎩᏱ'
        ]
      }
    },
    eras: {abbreviated: ['BC', 'AD'], narrow: ['BC', 'AD'], wide: ['ᏧᏓᎷᎸ ᎤᎷᎯᏍᏗ ᎦᎶᏁᏛ', 'ᎠᏃ ᏙᎻᏂ']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, MMMM d, y', long: 'MMMM d, y', medium: 'MMM d, y', short: 'M/d/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} ᎤᎾᎢ {0}', long: '{1} ᎤᎾᎢ {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '24:00'},
      morning1: {from: '00:00', to: '12:00'},
      noon: '12:00'
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
  currencySettings: {symbol: '$', name: 'US ᎠᏕᎳ'},
  getPluralCase: getPluralCase
};
