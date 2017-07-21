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
  if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return Plural.Few;
  if (!(v === 0)) return Plural.Many;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleSk: NgLocale = {
  localeId: 'sk',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'o poln.',
          am: 'AM',
          noon: 'napol.',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dopol.',
          afternoon1: 'popol.',
          evening1: 'večer',
          night1: 'v noci'
        },
        narrow: {
          midnight: 'o poln.',
          am: 'AM',
          noon: 'nap.',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dop.',
          afternoon1: 'pop.',
          evening1: 'več.',
          night1: 'v n.'
        },
        wide: {
          midnight: 'o polnoci',
          am: 'AM',
          noon: 'napoludnie',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dopoludnia',
          afternoon1: 'popoludní',
          evening1: 'večer',
          night1: 'v noci'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'poln.',
          am: 'AM',
          noon: 'pol.',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dopol.',
          afternoon1: 'popol.',
          evening1: 'večer',
          night1: 'noc'
        },
        narrow: {
          midnight: 'poln.',
          am: 'AM',
          noon: 'pol.',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dop.',
          afternoon1: 'pop.',
          evening1: 'več.',
          night1: 'noc'
        },
        wide: {
          midnight: 'polnoc',
          am: 'AM',
          noon: 'poludnie',
          pm: 'PM',
          morning1: 'ráno',
          morning2: 'dopoludnie',
          afternoon1: 'popoludnie',
          evening1: 'večer',
          night1: 'noc'
        }
      }
    },
    days: {
      format: {
        narrow: ['n', 'p', 'u', 's', 'š', 'p', 's'],
        short: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
        abbreviated: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
        wide: ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota']
      },
      standalone: {
        narrow: ['n', 'p', 'u', 's', 'š', 'p', 's'],
        short: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
        abbreviated: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
        wide: ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota']
      }
    },
    months: {
      format: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra',
          'októbra', 'novembra', 'decembra'
        ]
      },
      standalone: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated:
            ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
        wide: [
          'január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september',
          'október', 'november', 'december'
        ]
      }
    },
    eras: {
      abbreviated: ['pred Kr.', 'po Kr.'],
      narrow: ['pred Kr.', 'po Kr.'],
      wide: ['pred Kristom', 'po Kristovi']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d. MMMM y', long: 'd. MMMM y', medium: 'd. M. y', short: 'd. M. y'},
      time: {full: 'H:mm:ss zzzz', long: 'H:mm:ss z', medium: 'H:mm:ss', short: 'H:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '22:00'},
      midnight: '00:00',
      morning1: {from: '04:00', to: '09:00'},
      morning2: {from: '09:00', to: '12:00'},
      night1: {from: '22:00', to: '04:00'},
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
      exponential: 'e',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
