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
  let i = Math.floor(Math.abs(n));
  if (i === 0 || i === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleHy: NgLocale = {
  localeId: 'hy',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'կեսգիշեր',
          am: 'ԿԱ',
          noon: 'կեսօր',
          pm: 'ԿՀ',
          morning1: 'առավոտյան',
          afternoon1: 'ցերեկը',
          evening1: 'երեկոյան',
          night1: 'գիշերը'
        },
        narrow: {
          midnight: 'կգ․',
          am: 'ա',
          noon: 'կօ․',
          pm: 'հ',
          morning1: 'առվ',
          afternoon1: 'ցրկ',
          evening1: 'երկ',
          night1: 'գշր'
        },
        wide: {
          midnight: 'կեսգիշեր',
          am: 'AM',
          noon: 'կեսօր',
          pm: 'PM',
          morning1: 'առավոտյան',
          afternoon1: 'ցերեկը',
          evening1: 'երեկոյան',
          night1: 'գիշերը'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'կեսգիշեր',
          am: 'ԿԱ',
          noon: 'կեսօր',
          pm: 'ԿՀ',
          morning1: 'առավոտ',
          afternoon1: 'ցերեկ',
          evening1: 'երեկո',
          night1: 'գիշեր'
        },
        narrow: {
          midnight: 'կեսգիշեր',
          am: 'ԿԱ',
          noon: 'կեսօր',
          pm: 'ԿՀ',
          morning1: 'առավոտ',
          afternoon1: 'ցերեկ',
          evening1: 'երեկո',
          night1: 'գիշեր'
        },
        wide: {
          midnight: 'կեսգիշեր',
          am: 'AM',
          noon: 'կեսօր',
          pm: 'PM',
          morning1: 'առավոտ',
          afternoon1: 'ցերեկ',
          evening1: 'երեկո',
          night1: 'գիշեր'
        }
      }
    },
    days: {
      format: {
        narrow: ['Կ', 'Ե', 'Ե', 'Չ', 'Հ', 'Ո', 'Շ'],
        short: ['կր', 'եկ', 'եք', 'չք', 'հգ', 'ու', 'շբ'],
        abbreviated: ['կիր', 'երկ', 'երք', 'չրք', 'հնգ', 'ուր', 'շբթ'],
        wide: ['կիրակի', 'երկուշաբթի', 'երեքշաբթի', 'չորեքշաբթի', 'հինգշաբթի', 'ուրբաթ', 'շաբաթ']
      },
      standalone: {
        narrow: ['Կ', 'Ե', 'Ե', 'Չ', 'Հ', 'Ո', 'Շ'],
        short: ['կր', 'եկ', 'եք', 'չք', 'հգ', 'ու', 'շբ'],
        abbreviated: ['կիր', 'երկ', 'երք', 'չրք', 'հնգ', 'ուր', 'շբթ'],
        wide: ['կիրակի', 'երկուշաբթի', 'երեքշաբթի', 'չորեքշաբթի', 'հինգշաբթի', 'ուրբաթ', 'շաբաթ']
      }
    },
    months: {
      format: {
        narrow: ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
        abbreviated:
            ['հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ', 'հոկ', 'նոյ', 'դեկ'],
        wide: [
          'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի',
          'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'
        ]
      },
      standalone: {
        narrow: ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
        abbreviated:
            ['հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ', 'հոկ', 'նոյ', 'դեկ'],
        wide: [
          'հունվար', 'փետրվար', 'մարտ', 'ապրիլ', 'մայիս', 'հունիս', 'հուլիս', 'օգոստոս',
          'սեպտեմբեր', 'հոկտեմբեր', 'նոյեմբեր', 'դեկտեմբեր'
        ]
      }
    },
    eras: {
      abbreviated: ['մ.թ.ա.', 'մ.թ.'],
      narrow: ['մ.թ.ա.', 'մ.թ.'],
      wide: ['Քրիստոսից առաջ', 'Քրիստոսից հետո']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'y թ. MMMM d, EEEE',
        long: 'dd MMMM, y թ.',
        medium: 'dd MMM, y թ.',
        short: 'dd.MM.yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
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
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'ՈչԹ',
      timeSeparator: ':'
    },
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '֏', name: 'Հայկական դրամ'},
  getPluralCase: getPluralCase
};
