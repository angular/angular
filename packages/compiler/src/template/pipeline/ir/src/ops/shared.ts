/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {VariableFlags} from '../enums';
import {Op, XrefId} from '../operations';
import {SemanticVariable} from '../variable';

export abstract class SharedOp extends Op<SharedOp> {}
/**
 * An `Op` which directly wraps an output `Statement`.
 *
 * Often `StatementOp`s are the final result of IR processing.
 */
export class StatementOp<OpT extends Op<OpT>> extends SharedOp {
  /**
   * The output statement.
   */
  statement: o.Statement;

  constructor(statement: o.Statement) {
    super();
    this.statement = statement;
  }
}

/**
 * Operation which declares and initializes a `SemanticVariable`, that is valid either in create or
 * update IR.
 */
export class VariableOp<OpT extends Op<OpT>> extends SharedOp {
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

  flags: VariableFlags;

  constructor(
      xref: XrefId, variable: SemanticVariable, initializer: o.Expression, flags: VariableFlags) {
    super();
    this.xref = xref;
    this.variable = variable;
    this.initializer = initializer;
    this.flags = flags;
  }
}
