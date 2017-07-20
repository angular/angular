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
export const NgLocaleFur: NgLocale = {
  localeId: 'fur',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'a.', pm: 'p.'},
        narrow: {am: 'a.', pm: 'p.'},
        wide: {am: 'a.', pm: 'p.'}
      },
      standalone: {
        abbreviated: {am: 'a.', pm: 'p.'},
        narrow: {am: 'a.', pm: 'p.'},
        wide: {am: 'a.', pm: 'p.'}
      }
    },
    days: {
      format: {
        narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        short: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
        abbreviated: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
        wide: ['domenie', 'lunis', 'martars', 'miercus', 'joibe', 'vinars', 'sabide']
      },
      standalone: {
        narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        short: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
        abbreviated: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
        wide: ['domenie', 'lunis', 'martars', 'miercus', 'joibe', 'vinars', 'sabide']
      }
    },
    months: {
      format: {
        narrow: ['Z', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Zen', 'Fev', 'Mar', 'Avr', 'Mai', 'Jug', 'Lui', 'Avo', 'Set', 'Otu', 'Nov', 'Dic'],
        wide: [
          'Zenâr', 'Fevrâr', 'Març', 'Avrîl', 'Mai', 'Jugn', 'Lui', 'Avost', 'Setembar', 'Otubar',
          'Novembar', 'Dicembar'
        ]
      },
      standalone: {
        narrow: ['Z', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D'],
        abbreviated:
            ['Zen', 'Fev', 'Mar', 'Avr', 'Mai', 'Jug', 'Lui', 'Avo', 'Set', 'Otu', 'Nov', 'Dic'],
        wide: [
          'Zenâr', 'Fevrâr', 'Març', 'Avrîl', 'Mai', 'Jugn', 'Lui', 'Avost', 'Setembar', 'Otubar',
          'Novembar', 'Dicembar'
        ]
      }
    },
    eras: {abbreviated: ['pdC', 'ddC'], narrow: ['pdC', 'ddC'], wide: ['pdC', 'ddC']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {
        full: 'EEEE d \'di\' MMMM \'dal\' y',
        long: 'd \'di\' MMMM \'dal\' y',
        medium: 'dd/MM/y',
        short: 'dd/MM/yy'
      },
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    }
  },
  numberSettings: {
    symbols: {
      decimal: ',',
      group: '.',
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
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
