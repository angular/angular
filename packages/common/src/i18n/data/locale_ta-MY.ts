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
export const NgLocaleTaMY: NgLocale = {
  localeId: 'ta-MY',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'நள்ளிரவு',
          am: 'முற்பகல்',
          noon: 'நண்பகல்',
          pm: 'பிற்பகல்',
          morning1: 'அதிகாலை',
          morning2: 'காலை',
          afternoon1: 'மதியம்',
          afternoon2: 'பிற்பகல்',
          evening1: 'மாலை',
          evening2: 'அந்தி மாலை',
          night1: 'இரவு'
        },
        narrow: {
          midnight: 'நள்.',
          am: 'மு.ப',
          noon: 'நண்.',
          pm: 'பி.ப',
          morning1: 'அதி.',
          morning2: 'கா.',
          afternoon1: 'மதி.',
          afternoon2: 'பிற்.',
          evening1: 'மா.',
          evening2: 'அந்தி மா.',
          night1: 'இர.'
        },
        wide: {
          midnight: 'நள்ளிரவு',
          am: 'முற்பகல்',
          noon: 'நண்பகல்',
          pm: 'பிற்பகல்',
          morning1: 'அதிகாலை',
          morning2: 'காலை',
          afternoon1: 'மதியம்',
          afternoon2: 'பிற்பகல்',
          evening1: 'மாலை',
          evening2: 'அந்தி மாலை',
          night1: 'இரவு'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'நள்ளிரவு',
          am: 'முற்பகல்',
          noon: 'நண்பகல்',
          pm: 'பிற்பகல்',
          morning1: 'அதிகாலை',
          morning2: 'காலை',
          afternoon1: 'மதியம்',
          afternoon2: 'பிற்பகல்',
          evening1: 'மாலை',
          evening2: 'அந்தி மாலை',
          night1: 'இரவு'
        },
        narrow: {
          midnight: 'நள்.',
          am: 'மு.ப',
          noon: 'நண்.',
          pm: 'பி.ப',
          morning1: 'அதி.',
          morning2: 'கா.',
          afternoon1: 'மதி.',
          afternoon2: 'பிற்.',
          evening1: 'மா.',
          evening2: 'அந்தி மா.',
          night1: 'இ.'
        },
        wide: {
          midnight: 'நள்ளிரவு',
          am: 'முற்பகல்',
          noon: 'நண்பகல்',
          pm: 'பிற்பகல்',
          morning1: 'அதிகாலை',
          morning2: 'காலை',
          afternoon1: 'மதியம்',
          afternoon2: 'பிற்பகல்',
          evening1: 'மாலை',
          evening2: 'அந்தி மாலை',
          night1: 'இரவு'
        }
      }
    },
    days: {
      format: {
        narrow: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
        short: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
        abbreviated: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
        wide: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
      },
      standalone: {
        narrow: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
        short: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
        abbreviated: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
        wide: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
      }
    },
    months: {
      format: {
        narrow: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
        abbreviated: [
          'ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'
        ],
        wide: [
          'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்',
          'நவம்பர்', 'டிசம்பர்'
        ]
      },
      standalone: {
        narrow: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
        abbreviated: [
          'ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'
        ],
        wide: [
          'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்',
          'நவம்பர்', 'டிசம்பர்'
        ]
      }
    },
    eras: {
      abbreviated: ['கி.மு.', 'கி.பி.'],
      narrow: ['கி.மு.', 'கி.பி.'],
      wide: ['கிறிஸ்துவுக்கு முன்', 'அன்னோ டோமினி']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, d MMMM, y', long: 'd MMMM, y', medium: 'd MMM, y', short: 'd/M/yy'},
      time: {full: 'a h:mm:ss zzzz', long: 'a h:mm:ss z', medium: 'a h:mm:ss', short: 'a h:mm'},
      dateTime:
          {full: '{1} ’அன்று’ {0}', long: '{1} ’அன்று’ {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '14:00'},
      afternoon2: {from: '14:00', to: '16:00'},
      evening1: {from: '16:00', to: '18:00'},
      evening2: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '03:00', to: '05:00'},
      morning2: {from: '05:00', to: '12:00'},
      night1: {from: '21:00', to: '03:00'},
      noon: '12:00'
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
    formats: {currency: '¤ #,##0.00', decimal: '#,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: 'RM', name: 'மலேஷியன் ரிங்கிட்'},
  getPluralCase: getPluralCase
};
