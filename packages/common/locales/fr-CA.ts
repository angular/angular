/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  let i = Math.floor(Math.abs(n));
  if (i === 0 || i === 1) return 1;
  return 5;
}

export default [
  'fr-CA',
  [['a', 'p'], ['a.m.', 'p.m.'], u],
  [['a.m.', 'p.m.'], u, u],
  [
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    [
      'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.',
      'déc.'
    ],
    [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
      'octobre', 'novembre', 'décembre'
    ]
  ],
  u,
  [['av. J.-C.', 'ap. J.-C.'], u, ['avant Jésus-Christ', 'après Jésus-Christ']],
  0,
  [6, 0],
  ['y-MM-dd', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  [
    'HH \'h\' mm', 'HH \'h\' mm \'min\' ss \'s\'', 'HH \'h\' mm \'min\' ss \'s\' z',
    'HH \'h\' mm \'min\' ss \'s\' zzzz'
  ],
  ['{1} {0}', u, '{1} \'à\' {0}', u],
  [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'CAD',
  '$',
  'dollar canadien',
  {
    'AUD': ['$ AU', '$'],
    'BEF': ['FB'],
    'BYN': [u, 'Br'],
    'CAD': ['$'],
    'CYP': ['£CY'],
    'EGP': [u, '£E'],
    'FRF': ['F'],
    'GEL': [],
    'HKD': ['$ HK', '$'],
    'IEP': ['£IE'],
    'ILP': ['£IL'],
    'ILS': [u, '₪'],
    'INR': [u, '₹'],
    'ITL': ['₤IT'],
    'KRW': [u, '₩'],
    'LBP': [u, '£L'],
    'MTP': ['£MT'],
    'MXN': [u, '$'],
    'NZD': ['$ NZ', '$'],
    'RHD': ['$RH'],
    'RON': [u, 'L'],
    'RWF': [u, 'FR'],
    'SGD': ['$ SG', '$'],
    'TOP': [u, '$T'],
    'TWD': [u, 'NT$'],
    'USD': ['$ US', '$'],
    'VND': [u, '₫'],
    'XAF': [],
    'XCD': [u, '$'],
    'XOF': [],
    'XPF': []
  },
  'ltr',
  plural
];
