/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

export default [
  'fi',
  [
    ['ap.', 'ip.'],
    ,
  ],
  ,
  [
    ['S', 'M', 'T', 'K', 'T', 'P', 'L'], ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
    [
      'sunnuntaina', 'maanantaina', 'tiistaina', 'keskiviikkona', 'torstaina', 'perjantaina',
      'lauantaina'
    ],
    ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la']
  ],
  [
    ['S', 'M', 'T', 'K', 'T', 'P', 'L'], ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
    ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
    ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la']
  ],
  [
    ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
    [
      'tammik.', 'helmik.', 'maalisk.', 'huhtik.', 'toukok.', 'kesäk.', 'heinäk.', 'elok.',
      'syysk.', 'lokak.', 'marrask.', 'jouluk.'
    ],
    [
      'tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta',
      'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'
    ]
  ],
  [
    ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
    [
      'tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka',
      'marras', 'joulu'
    ],
    [
      'tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu',
      'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'
    ]
  ],
  [['eKr', 'jKr'], ['eKr.', 'jKr.'], ['ennen Kristuksen syntymää', 'jälkeen Kristuksen syntymän']],
  1, [6, 0], ['d.M.y', , 'd. MMMM y', 'cccc d. MMMM y'],
  ['H.mm', 'H.mm.ss', 'H.mm.ss z', 'H.mm.ss zzzz'],
  [
    '{1} {0}',
    '{1} \'klo\' {0}',
    ,
  ],
  [',', ' ', ';', '%', '+', '−', 'E', '×', '‰', '∞', 'epäluku', '.'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], '€', 'euro',
  function(n: number):
      number {
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        return 5;
      }
];
