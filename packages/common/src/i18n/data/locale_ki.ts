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
export const NgLocaleKi: NgLocale = {
  localeId: 'ki',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'},
        narrow: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'},
        wide: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'}
      },
      standalone: {
        abbreviated: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'},
        narrow: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'},
        wide: {am: 'Kiroko', pm: 'Hwaĩ-inĩ'}
      }
    },
    days: {
      format: {
        narrow: ['K', 'N', 'N', 'N', 'A', 'N', 'N'],
        short: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
        abbreviated: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
        wide: ['Kiumia', 'Njumatatũ', 'Njumaine', 'Njumatana', 'Aramithi', 'Njumaa', 'Njumamothi']
      },
      standalone: {
        narrow: ['K', 'N', 'N', 'N', 'A', 'N', 'N'],
        short: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
        abbreviated: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
        wide:
            ['Kiumia', 'Njumatatũ', 'Njumaine', 'Njumatana', 'Aramithi', 'Njumaa', 'Njumamothi']
      }
    },
    months: {
      format: {
        narrow: ['J', 'K', 'G', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'D'],
        abbreviated:
            ['JEN', 'WKR', 'WGT', 'WKN', 'WTN', 'WTD', 'WMJ', 'WNN', 'WKD', 'WIK', 'WMW', 'DIT'],
        wide: [
          'Njenuarĩ', 'Mwere wa kerĩ', 'Mwere wa gatatũ', 'Mwere wa kana', 'Mwere wa gatano',
          'Mwere wa gatandatũ', 'Mwere wa mũgwanja', 'Mwere wa kanana', 'Mwere wa kenda',
          'Mwere wa ikũmi', 'Mwere wa ikũmi na ũmwe', 'Ndithemba'
        ]
      },
      standalone: {
        narrow: ['J', 'K', 'G', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'D'],
        abbreviated:
            ['JEN', 'WKR', 'WGT', 'WKN', 'WTN', 'WTD', 'WMJ', 'WNN', 'WKD', 'WIK', 'WMW', 'DIT'],
        wide: [
          'Njenuarĩ', 'Mwere wa kerĩ', 'Mwere wa gatatũ', 'Mwere wa kana', 'Mwere wa gatano',
          'Mwere wa gatandatũ', 'Mwere wa mũgwanja', 'Mwere wa kanana', 'Mwere wa kenda',
          'Mwere wa ikũmi', 'Mwere wa ikũmi na ũmwe', 'Ndithemba'
        ]
      }
    },
    eras: {
      abbreviated: ['MK', 'TK'],
      narrow: ['MK', 'TK'],
      wide: ['Mbere ya Kristo', 'Thutha wa Kristo']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM y', long: 'd MMMM y', medium: 'd MMM y', short: 'dd/MM/y'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
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
  currencySettings: {symbol: 'Ksh', name: 'Ciringi ya Kenya'},
  getPluralCase: getPluralCase
};
