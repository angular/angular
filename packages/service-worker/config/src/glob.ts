/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const QUESTION_MARK = '[^/]';
const WILD_SINGLE = '[^/]*';
const WILD_OPEN = '(?:.+\\/)?';

const TO_ESCAPE_BASE = [
  {replace: /\./g, with: '\\.'},
  {replace: /\+/g, with: '\\+'},
  {replace: /\*/g, with: WILD_SINGLE},
];
const TO_ESCAPE_WILDCARD_QM = [...TO_ESCAPE_BASE, {replace: /\?/g, with: QUESTION_MARK}];
const TO_ESCAPE_LITERAL_QM = [...TO_ESCAPE_BASE, {replace: /\?/g, with: '\\?'}];

export function globToRegex(glob: string, literalQuestionMark = false): string {
  const toEscape = literalQuestionMark ? TO_ESCAPE_LITERAL_QM : TO_ESCAPE_WILDCARD_QM;
  const segments = glob.split('/').reverse();
  let regex: string = '';
  while (segments.length > 0) {
    const segment = segments.pop()!;
    if (segment === '**') {
      if (segments.length > 0) {
        regex += WILD_OPEN;
      } else {
        regex += '.*';
      }
    } else {
      const processed = toEscape.reduce(
        (segment, escape) => segment.replace(escape.replace, escape.with),
        segment,
      );
      regex += processed;
      if (segments.length > 0) {
        regex += '\\/';
      }
    }
  }
  return regex;
}
