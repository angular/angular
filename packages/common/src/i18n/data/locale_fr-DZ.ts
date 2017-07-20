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
export const NgLocaleFrDZ: NgLocale = {
  localeId: 'fr-DZ',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'mat.',
          afternoon1: 'ap.m.',
          evening1: 'soir',
          night1: 'nuit'
        },
        narrow: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'mat.',
          afternoon1: 'ap.m.',
          evening1: 'soir',
          night1: 'nuit'
        },
        wide: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'du matin',
          afternoon1: 'de l’après-midi',
          evening1: 'du soir',
          night1: 'de nuit'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'mat.',
          afternoon1: 'ap.m.',
          evening1: 'soir',
          night1: 'nuit'
        },
        narrow: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'mat.',
          afternoon1: 'ap.m.',
          evening1: 'soir',
          night1: 'nuit'
        },
        wide: {
          midnight: 'minuit',
          am: 'AM',
          noon: 'midi',
          pm: 'PM',
          morning1: 'matin',
          afternoon1: 'après-midi',
          evening1: 'soir',
          night1: 'nuit'
        }
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        short: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
        abbreviated: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        wide: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        short: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
        abbreviated: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        wide: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      }
    },
    months: {
      format: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.',
          'déc.'
        ],
        wide: [
          'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
          'octobre', 'novembre', 'décembre'
        ]
      },
      standalone: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: [
          'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.',
          'déc.'
        ],
        wide: [
          'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
          'octobre', 'novembre', 'décembre'
        ]
      }
    },
    eras: {
      abbreviated: ['av. J.-C.', 'ap. J.-C.'],
      narrow: ['av. J.-C.', 'ap. J.-C.'],
      wide: ['avant Jésus-Christ', 'après Jésus-Christ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 6,
    weekendRange: [5, 6],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {
        full: '{1} \'à\' {0}',
        long: '{1} \'à\' {0}',
        medium: '{1} \'à\' {0}',
        short: '{1} {0}'
      }
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '24:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '12:00'},
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
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'DA', name: 'dinar algérien'},
  getPluralCase: getPluralCase
};
