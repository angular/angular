/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 * Translation: Ander Uraga Real https://github.com/anderuraga
 * es-EU: EUskara from Vasque Country - Euskal Herria
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  if (n === 1) return 1;
  return 5;
}

export default [
  'es-EU', [['a. m.', 'p. m.'], u, u], u,
  [
    ['ig', 'al', 'ar', 'az', 'os', 'ol', 'lr'], ['ig.', 'al.', 'ar.', 'az.', 'og.', 'ol.', 'lr.'],
    ['igandea', 'astelehena', 'asteartea', 'asteazkena', 'osteguna', 'ostirala', 'larunbata'],
    ['IG', 'AL', 'AR', 'AZ', 'OG', 'OL', 'LR']
  ],
  [
    ['IG', 'AL', 'AR', 'AZ', 'OS', 'OL', 'LR'], ['ig.', 'al.', 'ar.', 'az.', 'og.', 'ol.', 'lr.'],
    ['igandea', 'astelehena', 'asteartea', 'asteazkena', 'osteguna', 'ostirala', 'larunbata'],
    ['IG', 'AL', 'AR', 'AZ', 'OS', 'OL', 'LR']
  ],
  [
    ['URT', 'OTS', 'MAR', 'API', 'MAI', 'EKA', 'UZT', 'ABU', 'IRA', 'URRI', 'AZA', 'ABE'],
    [
      'urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abu.', 'ira.', 'urr.', 'aza.', 'abe.'
    ],
    [
      'urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua', 'iraila',
      'urria', 'azaroa', 'abendua'
    ]
  ],
  [
    ['URT', 'OTS', 'MAR', 'API', 'MAI', 'EKA', 'UZT', 'ABU', 'IRA', 'URRI', 'AZA', 'ABE'],
    [
      'Urt.', 'Ots.', 'Mar.', 'Api.', 'Mai.', 'Eka.', 'Uzt.', 'Abu.', 'Ira.', 'Urr.', 'Aza.', 'Abe.'
    ],
    [
      'urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua', 'iraila',
      'urria', 'azaroa', 'abendua'
    ]
  ],
  [['c. a.', 'c. o.'], u, ['Cristo Aurretik', 'Cristo Ondoren']], 0, [6, 0],
  ['yy/MM/dd', 'y MMM d', 'y \'(e)ko\' MMMM \'ren\' y', 'EEEE, y \'(e)ko\' MMMM \'ren\' d'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, '{1}, {0}', u],
  ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '¤#,##0.00', '#E0'], 'S/', 'eguzki peruanoa', {
    'AUD': [u, '$'],
    'BRL': [u, 'R$'],
    'CAD': [u, '$'],
    'CNY': [u, '¥'],
    'ESP': ['₧'],
    'EUR': [u, '€'],
    'FKP': [u, 'FK£'],
    'GBP': [u, '£'],
    'HKD': [u, '$'],
    'ILS': [u, '₪'],
    'INR': [u, '₹'],
    'JPY': [u, '¥'],
    'KRW': [u, '₩'],
    'MXN': [u, '$'],
    'NZD': [u, '$'],
    'PEN': ['S/'],
    'RON': [u, 'L'],
    'SSP': [u, 'SD£'],
    'SYP': [u, 'S£'],
    'TWD': [u, 'NT$'],
    'USD': [u, '$'],
    'VEF': [u, 'BsF'],
    'VND': [u, '₫'],
    'XAF': [],
    'XCD': [u, '$'],
    'XOF': []
  },
  plural
];
