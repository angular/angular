/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {OpKind} from '../enums';
import {Op} from '../operations';

/**
 * A special `Op` which is used internally in the `OpList` linked list to represent the head and
 * tail nodes of the list.
 *
 * `ListEndOp` is created internally in the `OpList` and should not be instantiated directly.
 */
export interface ListEndOp<OpT extends Op<OpT>> extends Op<OpT> {
  kind: OpKind.ListEnd;
}

/**
 * An `Op` which directly wraps an output `Statement`.
 *
 * Often `StatementOp`s are the final result of IR processing.
 */
export interface StatementOp<OpT extends Op<OpT>> extends Op<OpT> {
  kind: OpKind.Statement;

  /**
   * The output statement.
   */
  statement: o.Statement;
}

/**
 * Create a `StatementOp`.
 */
export function createStatementOp<OpT extends Op<OpT>>(statement: o.Statement): StatementOp<OpT> {
  return {
    kind: OpKind.Statement,
    statement,
    ...NEW_OP,
  };
}

/**
 * Static structure shared by all operations.
 *
 * Used as a convenience via the spread operator (`...NEW_OP`) when creating new operations, and
 * ensures the fields are always in the same order.
 */
export const NEW_OP: Pick<Op<any>, 'debugListId'|'prev'|'next'> = {
  debugListId: null,
  prev: null,
  next: null,
};
