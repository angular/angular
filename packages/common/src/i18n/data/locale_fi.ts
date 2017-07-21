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
export const NgLocaleFi: NgLocale = {
  localeId: 'fi',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'keskiyöllä',
          am: 'ap.',
          noon: 'keskip.',
          pm: 'ip.',
          morning1: 'aamulla',
          morning2: 'aamup.',
          afternoon1: 'iltap.',
          evening1: 'illalla',
          night1: 'yöllä'
        },
        narrow: {
          midnight: 'ky.',
          am: 'ap.',
          noon: 'kp.',
          pm: 'ip.',
          morning1: 'aamulla',
          morning2: 'ap.',
          afternoon1: 'ip.',
          evening1: 'illalla',
          night1: 'yöllä'
        },
        wide: {
          midnight: 'keskiyöllä',
          am: 'ap.',
          noon: 'keskipäivällä',
          pm: 'ip.',
          morning1: 'aamulla',
          morning2: 'aamupäivällä',
          afternoon1: 'iltapäivällä',
          evening1: 'illalla',
          night1: 'yöllä'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'keskiyö',
          am: 'ap.',
          noon: 'keskip.',
          pm: 'ip.',
          morning1: 'aamu',
          morning2: 'aamup.',
          afternoon1: 'iltap.',
          evening1: 'ilta',
          night1: 'yö'
        },
        narrow: {
          midnight: 'ky.',
          am: 'ap.',
          noon: 'kp.',
          pm: 'ip.',
          morning1: 'aamu',
          morning2: 'ap.',
          afternoon1: 'ip.',
          evening1: 'ilta',
          night1: 'yö'
        },
        wide: {
          midnight: 'keskiyö',
          am: 'ap.',
          noon: 'keskipäivä',
          pm: 'ip.',
          morning1: 'aamu',
          morning2: 'aamupäivä',
          afternoon1: 'iltapäivä',
          evening1: 'ilta',
          night1: 'yö'
        }
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'K', 'T', 'P', 'L'],
        short: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
        abbreviated: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
        wide: [
          'sunnuntaina', 'maanantaina', 'tiistaina', 'keskiviikkona', 'torstaina', 'perjantaina',
          'lauantaina'
        ]
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'K', 'T', 'P', 'L'],
        short: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
        abbreviated: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
        wide: [
          'sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'
        ]
      }
    },
    months: {
      format: {
        narrow: ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
        abbreviated: [
          'tammik.', 'helmik.', 'maalisk.', 'huhtik.', 'toukok.', 'kesäk.', 'heinäk.', 'elok.',
          'syysk.', 'lokak.', 'marrask.', 'jouluk.'
        ],
        wide: [
          'tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta',
          'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'
        ]
      },
      standalone: {
        narrow: ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
        abbreviated: [
          'tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka',
          'marras', 'joulu'
        ],
        wide: [
          'tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu',
          'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'
        ]
      }
    },
    eras: {
      abbreviated: ['eKr.', 'jKr.'],
      narrow: ['eKr', 'jKr'],
      wide: ['ennen Kristuksen syntymää', 'jälkeen Kristuksen syntymän']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'cccc d. MMMM y', long: 'd. MMMM y', medium: 'd.M.y', short: 'd.M.y'},
      time: {full: 'H.mm.ss zzzz', long: 'H.mm.ss z', medium: 'H.mm.ss', short: 'H.mm'},
      dateTime: {
        full: '{1} \'klo\' {0}',
        long: '{1} \'klo\' {0}',
        medium: '{1} \'klo\' {0}',
        short: '{1} {0}'
      }
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '23:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '10:00'},
      morning2: {from: '10:00', to: '12:00'},
      night1: {from: '23:00', to: '05:00'},
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
      minusSign: '−',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'epäluku',
      timeSeparator: '.'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '€', name: 'euro'},
  getPluralCase: getPluralCase
};
