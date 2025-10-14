/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertDefined, throwError} from '../util/assert';
import {toTNodeTypeAsString} from './interfaces/node';
export function assertTNodeType(tNode, expectedTypes, message) {
  assertDefined(tNode, 'should be called with a TNode');
  if ((tNode.type & expectedTypes) === 0) {
    throwError(
      message ||
        `Expected [${toTNodeTypeAsString(expectedTypes)}] but got ${toTNodeTypeAsString(tNode.type)}.`,
    );
  }
}
export function assertPureTNodeType(type) {
  if (
    !(
      (
        type === 2 /* TNodeType.Element */ ||
        type === 1 /* TNodeType.Text */ ||
        type === 4 /* TNodeType.Container */ ||
        type === 8 /* TNodeType.ElementContainer */ ||
        type === 32 /* TNodeType.Icu */ ||
        type === 16 /* TNodeType.Projection */ ||
        type === 64 /* TNodeType.Placeholder */ ||
        type === 128
      ) /* TNodeType.LetDeclaration */
    )
  ) {
    throwError(
      `Expected TNodeType to have only a single type selected, but got ${toTNodeTypeAsString(type)}.`,
    );
  }
}
//# sourceMappingURL=node_assert.js.map
