/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {OpKind} from '../enums';
import {Op, XrefId} from '../operations';
import {SemanticVariable} from '../variable';

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
 * Operation which declares and initializes a `SemanticVariable`, that is valid either in create or
 * update IR.
 */
export interface VariableOp<OpT extends Op<OpT>> extends Op<OpT> {
  kind: OpKind.Variable;

  /**
   * `XrefId` which identifies this specific variable, and is used to reference this variable from
   * other parts of the IR.
   */
  xref: XrefId;

  /**
   * The `SemanticVariable` which describes the meaning behind this variable.
   */
  variable: SemanticVariable;

  /**
   * Expression representing the value of the variable.
   */
  initializer: o.Expression;
}

/**
 * Create a `VariableOp`.
 */
export function createVariableOp<OpT extends Op<OpT>>(
    xref: XrefId, variable: SemanticVariable, initializer: o.Expression): VariableOp<OpT> {
  return {
    kind: OpKind.Variable,
    xref,
    variable,
    initializer,
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
