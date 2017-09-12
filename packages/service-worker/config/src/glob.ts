/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const WILD_SINGLE = '[^\\/]+';
const WILD_OPEN = '(?:.+\\/)?';

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
      continue;
    } else {
      const processed = segment.replace(/\./g, '\\.').replace(/\*/g, WILD_SINGLE);
      regex += processed;
      if (segments.length > 0) {
        regex += '\\/';
      }
    }
  }
  return regex;
}
