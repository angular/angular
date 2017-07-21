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
export const NgLocaleBnIN: NgLocale = {
  localeId: 'bn-IN',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        },
        narrow: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        },
        wide: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        }
      },
      standalone: {
        abbreviated: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        },
        narrow: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        },
        wide: {
          am: 'AM',
          pm: 'PM',
          morning1: 'ভোর',
          morning2: 'সকাল',
          afternoon1: 'দুপুর',
          afternoon2: 'বিকাল',
          evening1: 'সন্ধ্যা',
          night1: 'রাত্রি'
        }
      }
    },
    days: {
      format: {
        narrow: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
        short: ['রঃ', 'সোঃ', 'মঃ', 'বুঃ', 'বৃঃ', 'শুঃ', 'শোঃ'],
        abbreviated: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
        wide: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
      },
      standalone: {
        narrow: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
        short: ['রঃ', 'সোঃ', 'মঃ', 'বুঃ', 'বৃঃ', 'শুঃ', 'শনি'],
        abbreviated: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
        wide: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহষ্পতিবার', 'শুক্রবার', 'শনিবার']
      }
    },
    months: {
      format: {
        narrow: ['জা', 'ফে', 'মা', 'এ', 'মে', 'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
        abbreviated: [
          'জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর',
          'ডিসেম্বর'
        ],
        wide: [
          'জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর',
          'নভেম্বর', 'ডিসেম্বর'
        ]
      },
      standalone: {
        narrow: ['জা', 'ফে', 'মা', 'এ', 'মে', 'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
        abbreviated: [
          'জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর',
          'নভেম্বর', 'ডিসেম্বর'
        ],
        wide: [
          'জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর',
          'নভেম্বর', 'ডিসেম্বর'
        ]
      }
    },
    eras: {
      abbreviated: ['খ্রিস্টপূর্ব', 'খৃষ্টাব্দ'],
      narrow: ['খ্রিস্টপূর্ব', 'খৃষ্টাব্দ'],
      wide: ['খ্রিস্টপূর্ব', 'খৃষ্টাব্দ']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'd/M/yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '16:00'},
      afternoon2: {from: '16:00', to: '18:00'},
      evening1: {from: '18:00', to: '20:00'},
      morning1: {from: '04:00', to: '06:00'},
      morning2: {from: '06:00', to: '12:00'},
      night1: {from: '20:00', to: '04:00'}
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
      currency: '#,##,##0.00¤',
      decimal: '#,##,##0.###',
      percent: '#,##,##0%',
      scientific: '#E0'
    }
  },
  currencySettings: {symbol: '₹', name: 'ভারতীয় রুপি'},
  getPluralCase: getPluralCase
};
