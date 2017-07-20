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
export const NgLocaleSqMK: NgLocale = {
  localeId: 'sq-MK',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'e mesnatës',
          am: 'e paradites',
          noon: 'e mesditës',
          pm: 'e pasdites',
          morning1: 'e mëngjesit',
          morning2: 'e paradites',
          afternoon1: 'e pasdites',
          evening1: 'e mbrëmjes',
          night1: 'e natës'
        },
        narrow: {
          midnight: 'e mesnatës',
          am: 'e paradites',
          noon: 'e mesditës',
          pm: 'e pasdites',
          morning1: 'e mëngjesit',
          morning2: 'e paradites',
          afternoon1: 'e pasdites',
          evening1: 'e mbrëmjes',
          night1: 'e natës'
        },
        wide: {
          midnight: 'e mesnatës',
          am: 'e paradites',
          noon: 'e mesditës',
          pm: 'e pasdites',
          morning1: 'e mëngjesit',
          morning2: 'e paradites',
          afternoon1: 'e pasdites',
          evening1: 'e mbrëmjes',
          night1: 'e natës'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'mesnatë',
          am: 'paradite',
          noon: 'mesditë',
          pm: 'pasdite',
          morning1: 'mëngjes',
          morning2: 'paradite',
          afternoon1: 'pasdite',
          evening1: 'mbrëmje',
          night1: 'natë'
        },
        narrow: {
          midnight: 'mesnatë',
          am: 'paradite',
          noon: 'mesditë',
          pm: 'pasdite',
          morning1: 'mëngjes',
          morning2: 'paradite',
          afternoon1: 'pasdite',
          evening1: 'mbrëmje',
          night1: 'natë'
        },
        wide: {
          midnight: 'mesnatë',
          am: 'paradite',
          noon: 'mesditë',
          pm: 'pasdite',
          morning1: 'mëngjes',
          morning2: 'paradite',
          afternoon1: 'pasdite',
          evening1: 'mbrëmje',
          night1: 'natë'
        }
      }
    },
    days: {
      format: {
        narrow: ['D', 'H', 'M', 'M', 'E', 'P', 'S'],
        short: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
        abbreviated: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
        wide: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë']
      },
      standalone: {
        narrow: ['D', 'H', 'M', 'M', 'E', 'P', 'S'],
        short: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
        abbreviated: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
        wide: ['E diel', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë']
      }
    },
    months: {
      format: {
        narrow: ['j', 's', 'm', 'p', 'm', 'q', 'k', 'g', 's', 't', 'n', 'd'],
        abbreviated:
            ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'kor', 'gsh', 'sht', 'tet', 'nën', 'dhj'],
        wide: [
          'janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator',
          'tetor', 'nëntor', 'dhjetor'
        ]
      },
      standalone: {
        narrow: ['J', 'S', 'M', 'P', 'M', 'Q', 'K', 'G', 'S', 'T', 'N', 'D'],
        abbreviated:
            ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gsh', 'Sht', 'Tet', 'Nën', 'Dhj'],
        wide: [
          'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator',
          'Tetor', 'Nëntor', 'Dhjetor'
        ]
      }
    },
    eras: {
      abbreviated: ['p.K.', 'mb.K.'],
      narrow: ['p.K.', 'mb.K.'],
      wide: ['para Krishtit', 'mbas Krishtit']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd.M.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime:
          {full: '{1} \'në\' {0}', long: '{1} \'në\' {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '09:00'},
      morning2: {from: '09:00', to: '12:00'},
      night1: {from: '00:00', to: '04:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'den', name: 'Denari maqedonas'},
  getPluralCase: getPluralCase
};
