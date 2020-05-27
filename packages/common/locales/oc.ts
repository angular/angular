// This code is not generated
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  let i = Math.floor(Math.abs(n));
  if (i === 0 || i === 1) return 1;
  return 5;
}

export default [
  'oc',
  [['a. m.', 'p. m.'], u, u],
  u,
  [
    ['dg', 'dl', 'dm', 'dc', 'dj', 'dv', 'ds'], ['dg.', 'dl.', 'dm.', 'dc.', 'dj.', 'dv.', 'ds.'],
    ['dimenge', 'diluns', 'dimars', 'dimècres', 'dijòus', 'divendres', 'dissabte'],
    ['dg.', 'dl.', 'dm.', 'dc.', 'dj.', 'dv.', 'ds.']
  ],
  u,
  [
    ['GN', 'FB', 'MÇ', 'AB', 'MA', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DC'],
    [
      'de gen.', 'de febr.', 'de març', 'd’abr.', 'de mai', 'de junh', 'de jul.', 'd’ag.',
      'de set.', 'd’oct.', 'de nov.', 'de dec.'
    ],
    [
      'de genièr', 'de febrièr', 'de març', 'd’abril', 'de mai', 'de junh', 'de julhet',
      'd’agòst', 'de setembre', 'd’octòbre', 'de novembre', 'de decembre'
    ]
  ],
  [
    ['GN', 'FB', 'MÇ', 'AB', 'MA', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DC'],
    [
      'gen.', 'febr.', 'març', 'abr.', 'mai', 'junh', 'jul.', 'ag.', 'set.', 'oct.', 'nov.',
      'dec.'
    ],
    [
      'genièr', 'febrièr', 'març', 'abril', 'mai', 'junh', 'julhet', 'agòst', 'setembre', 'octòbre',
      'novembre', 'decembre'
    ]
  ],
  [['aC', 'dC'], u, ['abans Jèsus-Crist', 'aprèp Jèsus-Crist']],
  1,
  [6, 0],
  ['d/M/yy', 'd MMM y', 'd MMMM \'de\' y', 'EEEE, d MMMM \'de\' y'],
  ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
  ['{1} {0}', '{1}, {0}', '{1} \'a\' \'les\' {0}', u],
  [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
  'EUR',
  '€',
  'euro',
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
