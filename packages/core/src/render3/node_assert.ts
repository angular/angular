/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertDefined, throwError} from '../util/assert';
import {TNode, TNodeType, toTNodeTypeAsString} from './interfaces/node';

export function assertTNodeType(
  tNode: TNode | null,
  expectedTypes: TNodeType,
  message?: string,
): void {
  assertDefined(tNode, 'should be called with a TNode');
  if ((tNode.type & expectedTypes) === 0) {
    throwError(
      message ||
        `Expected [${toTNodeTypeAsString(expectedTypes)}] but got ${toTNodeTypeAsString(
          tNode.type,
        )}.`,
    );
  }
}

export function assertPureTNodeType(type: TNodeType) {
  if (
    !(
      type === TNodeType.Element ||
      type === TNodeType.Text ||
      type === TNodeType.Container ||
      type === TNodeType.ElementContainer ||
      type === TNodeType.Icu ||
      type === TNodeType.Projection ||
      type === TNodeType.Placeholder ||
      type === TNodeType.LetDeclaration
    )
  ) {
    throwError(
      `Expected TNodeType to have only a single type selected, but got ${toTNodeTypeAsString(
        type,
      )}.`,
    );
  }
}
