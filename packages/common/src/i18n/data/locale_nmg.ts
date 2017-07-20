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
export const NgLocaleNmg: NgLocale = {
  localeId: 'nmg',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'maná', pm: 'kugú'},
        narrow: {am: 'maná', pm: 'kugú'},
        wide: {am: 'maná', pm: 'kugú'}
      },
      standalone: {
        abbreviated: {am: 'maná', pm: 'kugú'},
        narrow: {am: 'maná', pm: 'kugú'},
        wide: {am: 'maná', pm: 'kugú'}
      }
    },
    days: {
      format: {
        narrow: ['s', 'm', 's', 's', 's', 'm', 's'],
        short: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
        abbreviated: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
        wide: [
          'sɔ́ndɔ', 'mɔ́ndɔ', 'sɔ́ndɔ mafú mába', 'sɔ́ndɔ mafú málal', 'sɔ́ndɔ mafú mána',
          'mabágá má sukul', 'sásadi'
        ]
      },
      standalone: {
        narrow: ['s', 'm', 's', 's', 's', 'm', 's'],
        short: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
        abbreviated: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
        wide: [
          'sɔ́ndɔ', 'mɔ́ndɔ', 'sɔ́ndɔ mafú mába', 'sɔ́ndɔ mafú málal', 'sɔ́ndɔ mafú mána',
          'mabágá má sukul', 'sásadi'
        ]
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['ng1', 'ng2', 'ng3', 'ng4', 'ng5', 'ng6', 'ng7', 'ng8', 'ng9', 'ng10', 'ng11', 'kris'],
        wide: [
          'ngwɛn matáhra', 'ngwɛn ńmba', 'ngwɛn ńlal', 'ngwɛn ńna', 'ngwɛn ńtan', 'ngwɛn ńtuó',
          'ngwɛn hɛmbuɛrí', 'ngwɛn lɔmbi', 'ngwɛn rɛbvuâ', 'ngwɛn wum', 'ngwɛn wum navǔr',
          'krísimin'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated:
            ['ng1', 'ng2', 'ng3', 'ng4', 'ng5', 'ng6', 'ng7', 'ng8', 'ng9', 'ng10', 'ng11', 'kris'],
        wide: [
          'ngwɛn matáhra', 'ngwɛn ńmba', 'ngwɛn ńlal', 'ngwɛn ńna', 'ngwɛn ńtan', 'ngwɛn ńtuó',
          'ngwɛn hɛmbuɛrí', 'ngwɛn lɔmbi', 'ngwɛn rɛbvuâ', 'ngwɛn wum', 'ngwɛn wum navǔr',
          'krísimin'
        ]
      }
    },
    eras: {abbreviated: ['BL', 'PB'], narrow: ['BL', 'PB'], wide: ['Bó Lahlɛ̄', 'Pfiɛ Burī']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'd/M/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
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
  currencySettings: {symbol: 'FCFA', name: 'Fraŋ CFA BEAC'},
  getPluralCase: getPluralCase
};
