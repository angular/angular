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
export const NgLocaleQu: NgLocale = {
  localeId: 'qu',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a.m.', pm: 'p.m.'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      },
      standalone: {
        abbreviated: {am: 'a.m.', pm: 'p.m.'},
        narrow: {am: 'a.m.', pm: 'p.m.'},
        wide: {am: 'a.m.', pm: 'p.m.'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
        abbreviated: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
        wide: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
        abbreviated: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
        wide: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Qul', 'Hat', 'Pau', 'Ayr', 'Aym', 'Int', 'Ant', 'Qha', 'Uma', 'Kan', 'Aya', 'Kap'],
        wide: [
          'Qulla puquy', 'Hatun puquy', 'Pauqar waray', 'Ayriwa', 'Aymuray', 'Inti raymi',
          'Anta Sitwa', 'Qhapaq Sitwa', 'Uma raymi', 'Kantaray', 'Ayamarqʼa', 'Kapaq Raymi'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['Qul', 'Hat', 'Pau', 'Ayr', 'Aym', 'Int', 'Ant', 'Qha', 'Uma', 'Kan', 'Aya', 'Kap'],
        wide: [
          'Qulla puquy', 'Hatun puquy', 'Pauqar waray', 'Ayriwa', 'Aymuray', 'Inti raymi',
          'Anta Sitwa', 'Qhapaq Sitwa', 'Uma raymi', 'Kantaray', 'Ayamarqʼa', 'Kapaq Raymi'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'd.C.'], narrow: ['BCE', 'dC'], wide: ['BCE', 'd.C.']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{0} {1}', medium: '{1} {0}', short: '{1} {0}'}
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: 'S/', name: 'PEN'},
  getPluralCase: getPluralCase
};
