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
  'fr-GA',
  [['AM', 'PM'], u, u],
  u,
  [
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
  ],
  u,
  [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    [
      'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.',
      'déc.'
    ],
    [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
      'octobre', 'novembre', 'décembre'
    ]
  ],
  u,
  [['av. J.-C.', 'ap. J.-C.'], u, ['avant Jésus-Christ', 'après Jésus-Christ']],
  1,
  [6, 0],
  ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
  ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
  ['{1} {0}', '{1} \'à\' {0}', u, u],
  [',', '\u202f', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
  'XAF',
  'FCFA',
  'franc CFA (BEAC)',
  {
    'ARS': ['$AR', '$'],
    'AUD': ['$AU', '$'],
    'BEF': ['FB'],
    'BMD': ['$BM', '$'],
    'BND': ['$BN', '$'],
    'BZD': ['$BZ', '$'],
    'CAD': ['$CA', '$'],
    'CLP': ['$CL', '$'],
    'CNY': [u, '¥'],
    'COP': ['$CO', '$'],
    'CYP': ['£CY'],
    'EGP': [u, '£E'],
    'FJD': ['$FJ', '$'],
    'FKP': ['£FK', '£'],
    'FRF': ['F'],
    'GBP': ['£GB', '£'],
    'GIP': ['£GI', '£'],
    'HKD': [u, '$'],
    'IEP': ['£IE'],
    'ILP': ['£IL'],
    'ITL': ['₤IT'],
    'JPY': [u, '¥'],
    'KMF': [u, 'FC'],
    'LBP': ['£LB', '£L'],
    'MTP': ['£MT'],
    'MXN': ['$MX', '$'],
    'NAD': ['$NA', '$'],
    'NIO': [u, '$C'],
    'NZD': ['$NZ', '$'],
    'RHD': ['$RH'],
    'RON': [u, 'L'],
    'RWF': [u, 'FR'],
    'SBD': ['$SB', '$'],
    'SGD': ['$SG', '$'],
    'SRD': ['$SR', '$'],
    'TOP': [u, '$T'],
    'TTD': ['$TT', '$'],
    'TWD': [u, 'NT$'],
    'USD': ['$US', '$'],
    'UYU': ['$UY', '$'],
    'WST': ['$WS'],
    'XCD': [u, '$'],
    'XPF': ['FCFP'],
    'ZMW': [u, 'Kw']
  },
  'ltr',
  plural
];
