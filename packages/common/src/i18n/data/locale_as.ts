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
  if (i === 0 || n === 1) return Plural.One;
  return Plural.Other;
}

/** @experimental */
export const NgLocaleAs: NgLocale = {
  localeId: 'as',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'},
        narrow: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'},
        wide: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'}
      },
      standalone: {
        abbreviated: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'},
        narrow: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'},
        wide: {am: 'পূৰ্বাহ্ণ', pm: 'অপৰাহ্ণ'}
      }
    },
    days: {
      format: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি'],
        abbreviated: ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি'],
        wide: ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহষ্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ']
      },
      standalone: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি'],
        abbreviated: ['ৰবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহষ্পতি', 'শুক্ৰ', 'শনি'],
        wide: ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহষ্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ']
      }
    },
    months: {
      format: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'
        ],
        wide: [
          'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ',
          'নৱেম্বৰ', 'ডিচেম্বৰ'
        ]
      },
      standalone: {
        narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        abbreviated: [
          'জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'
        ],
        wide: [
          'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ',
          'নৱেম্বৰ', 'ডিচেম্বৰ'
        ]
      }
    },
    eras: {abbreviated: ['BCE', 'CE'], narrow: ['BCE', 'CE'], wide: ['BCE', 'CE']}
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'y MMMM d, EEEE', long: 'y MMMM d', medium: 'y MMM d', short: 'y-MM-dd'},
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
    formats: {
      currency: '¤ #,##,##0.00',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₹', name: 'INR'},
  getPluralCase: getPluralCase
};
