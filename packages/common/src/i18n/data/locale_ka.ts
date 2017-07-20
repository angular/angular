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
export const NgLocaleKa: NgLocale = {
  localeId: 'ka',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'შუაღამეს',
          am: 'AM',
          noon: 'შუადღ.',
          pm: 'PM',
          morning1: 'დილ.',
          afternoon1: 'ნაშუადღ.',
          evening1: 'საღ.',
          night1: 'ღამ.'
        },
        narrow: {
          midnight: 'შუაღამეს',
          am: 'a',
          noon: 'შუადღ.',
          pm: 'p',
          morning1: 'დილ.',
          afternoon1: 'ნაშუადღ.',
          evening1: 'საღ.',
          night1: 'ღამ.'
        },
        wide: {
          midnight: 'შუაღამეს',
          am: 'AM',
          noon: 'შუადღეს',
          pm: 'PM',
          morning1: 'დილით',
          afternoon1: 'ნაშუადღევს',
          evening1: 'საღამოს',
          night1: 'ღამით'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'შუაღამე',
          am: 'AM',
          noon: 'შუადღე',
          pm: 'PM',
          morning1: 'დილა',
          afternoon1: 'ნაშუადღევი',
          evening1: 'საღამო',
          night1: 'ღამე'
        },
        narrow: {
          midnight: 'შუაღამე',
          am: 'AM',
          noon: 'შუადღე',
          pm: 'PM',
          morning1: 'დილა',
          afternoon1: 'ნაშუადღევი',
          evening1: 'საღამო',
          night1: 'ღამე'
        },
        wide: {
          midnight: 'შუაღამე',
          am: 'AM',
          noon: 'შუადღე',
          pm: 'შუადღ. შემდეგ',
          morning1: 'დილა',
          afternoon1: 'ნაშუადღევი',
          evening1: 'საღამო',
          night1: 'ღამე'
        }
      }
    },
    days: {
      format: {
        narrow: ['კ', 'ო', 'ს', 'ო', 'ხ', 'პ', 'შ'],
        short: ['კვ', 'ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ'],
        abbreviated: ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
        wide: ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი']
      },
      standalone: {
        narrow: ['კ', 'ო', 'ს', 'ო', 'ხ', 'პ', 'შ'],
        short: ['კვ', 'ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ'],
        abbreviated: ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
        wide: ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი']
      }
    },
    months: {
      format: {
        narrow: ['ი', 'თ', 'მ', 'ა', 'მ', 'ი', 'ი', 'ა', 'ს', 'ო', 'ნ', 'დ'],
        abbreviated:
            ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
        wide: [
          'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
          'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
        ]
      },
      standalone: {
        narrow: ['ი', 'თ', 'მ', 'ა', 'მ', 'ი', 'ი', 'ა', 'ს', 'ო', 'ნ', 'დ'],
        abbreviated:
            ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
        wide: [
          'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
          'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
        ]
      }
    },
    eras: {
      abbreviated: ['ძვ. წ.', 'ახ. წ.'],
      narrow: ['ძვ. წ.', 'ახ. წ.'],
      wide: ['ძველი წელთაღრიცხვით', 'ახალი წელთაღრიცხვით']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 1,
    weekendRange: [6, 0],
    formats: {
      date: {full: 'EEEE, dd MMMM, y', long: 'd MMMM, y', medium: 'd MMM. y', short: 'dd.MM.yy'},
      time: {full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm'},
      dateTime: {full: '{1}, {0}', long: '{1}, {0}', medium: '{1}, {0}', short: '{1}, {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '05:00', to: '12:00'},
      night1: {from: '21:00', to: '05:00'},
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
      nan: 'არ არის რიცხვი',
      timeSeparator: ':'
    },
    formats: {currency: '#,##0.00 ¤', decimal: '#,##0.###', percent: '#,##0 %', scientific: '#E0'}
  },
  currencySettings: {symbol: '₾', name: 'ქართული ლარი'},
  getPluralCase: getPluralCase
};
