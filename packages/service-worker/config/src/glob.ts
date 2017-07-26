/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const WILD_SINGLE = '[^\\/]+';
const WILD_OPEN = '(?:.+\\/)?';

const TO_ESCAPE = [
  {replace: /\./g, with: '\\.'},
  {replace: /\?/g, with: '\\?'},
  {replace: /\+/g, with: '\\+'},
  {replace: /\*/g, with: WILD_SINGLE},
];

export function globToRegex(glob: string): string {
  const segments = glob.split('/').reverse();
  let regex: string = '';
  while (segments.length > 0) {
    const segment = segments.pop() !;
    if (segment === '**') {
      if (segments.length > 0) {
        regex += WILD_OPEN;
      } else {
        regex += '.*';
      }
    } else {
      const processed = TO_ESCAPE.reduce(
          (segment, escape) => segment.replace(escape.replace, escape.with), segment);
      regex += processed;
      if (segments.length > 0) {
        regex += '\\/';
      }
    }
  }
  return regex;
}
