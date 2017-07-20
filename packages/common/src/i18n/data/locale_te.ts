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
export const NgLocaleTe: NgLocale = {
  localeId: 'te',
  dateTimeTranslations: {
    dayPeriods: {
      format: {
        abbreviated: {
          midnight: 'అర్థరాత్రి',
          am: 'AM',
          pm: 'PM',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        },
        narrow: {
          midnight: 'అర్థరాత్రి',
          am: 'ఉ',
          pm: 'సా',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        },
        wide: {
          midnight: 'అర్థరాత్రి',
          am: 'AM',
          pm: 'PM',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        }
      },
      standalone: {
        abbreviated: {
          midnight: 'అర్థరాత్రి',
          am: 'AM',
          pm: 'PM',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        },
        narrow: {
          midnight: 'అర్థరాత్రి',
          am: 'AM',
          pm: 'PM',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        },
        wide: {
          midnight: 'అర్థరాత్రి',
          am: 'AM',
          pm: 'PM',
          morning1: 'ఉదయం',
          afternoon1: 'మధ్యాహ్నం',
          evening1: 'సాయంత్రం',
          night1: 'రాత్రి'
        }
      }
    },
    days: {
      format: {
        narrow: ['ఆ', 'సో', 'మ', 'బు', 'గు', 'శు', 'శ'],
        short: ['ఆది', 'సోమ', 'మం', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
        abbreviated: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
        wide: ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం']
      },
      standalone: {
        narrow: ['ఆ', 'సో', 'మ', 'బు', 'గు', 'శు', 'శ'],
        short: ['ఆది', 'సోమ', 'మం', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
        abbreviated: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
        wide: ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం']
      }
    },
    months: {
      format: {
        narrow: ['జ', 'ఫి', 'మా', 'ఏ', 'మే', 'జూ', 'జు', 'ఆ', 'సె', 'అ', 'న', 'డి'],
        abbreviated:
            ['జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్', 'జులై', 'ఆగ', 'సెప్టెం', 'అక్టో', 'నవం', 'డిసెం'],
        wide: [
          'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్',
          'డిసెంబర్'
        ]
      },
      standalone: {
        narrow: ['జ', 'ఫి', 'మా', 'ఏ', 'మే', 'జూ', 'జు', 'ఆ', 'సె', 'అ', 'న', 'డి'],
        abbreviated:
            ['జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెం', 'అక్టో', 'నవం', 'డిసెం'],
        wide: [
          'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్',
          'డిసెంబర్'
        ]
      }
    },
    eras: {
      abbreviated: ['క్రీపూ', 'క్రీశ'],
      narrow: ['క్రీపూ', 'క్రీశ'],
      wide: ['క్రీస్తు పూర్వం', 'క్రీస్తు శకం']
    }
  },
  dateTimeSettings: {
    firstDayOfWeek: 0,
    weekendRange: [0, 0],
    formats: {
      date: {full: 'd, MMMM y, EEEE', long: 'd MMMM, y', medium: 'd MMM, y', short: 'dd-MM-yy'},
      time: {full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a'},
      dateTime: {full: '{1} {0}', long: '{1} {0}', medium: '{1} {0}', short: '{1} {0}'}
    },
    dayPeriodRules: {
      afternoon1: {from: '12:00', to: '18:00'},
      evening1: {from: '18:00', to: '21:00'},
      midnight: '00:00',
      morning1: {from: '06:00', to: '12:00'},
      night1: {from: '21:00', to: '06:00'}
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
    formats:
        {currency: '¤#,##,##0.00', decimal: '#,##,##0.###', percent: '#,##0%', scientific: '#E0'}
  },
  currencySettings: {symbol: '₹', name: 'రూపాయి'},
  getPluralCase: getPluralCase
};
