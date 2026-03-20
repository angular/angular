/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {declareVariable, TcbExpr} from './codegen';

/**
 * A `TcbOp` which renders a variable that is implicitly available within a block (e.g. `$count`
 * in a `@for` block).
 *
 * Executing this operation returns the identifier which can be used to refer to the variable.
 */
export class TcbBlockImplicitVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private type: TcbExpr,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override readonly optional = true;

  override execute(): TcbExpr {
    const id = new TcbExpr(this.tcb.allocateId());
    id.addParseSpanInfo(this.variable.keySpan);
    const variable = declareVariable(id, this.type);
    variable.addParseSpanInfo(this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}

/**
 * A `TcbOp` which creates an expression for particular let- `TmplAstVariable` on a
 * `TmplAstTemplate`'s context.
 *
 * Executing this operation returns a reference to the variable variable (lol).
 */
export class TcbTemplateVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private template: TmplAstTemplate,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): TcbExpr {
    // Look for a context variable for the template.
    const ctx = this.scope.resolve(this.template);

    // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable
    // on the template context.
    const id = new TcbExpr(this.tcb.allocateId());
    const initializer = new TcbExpr(`${ctx.print()}.${this.variable.value || '$implicit'}`);
    id.addParseSpanInfo(this.variable.keySpan);

    // Declare the variable, and return its identifier.
    if (this.variable.valueSpan !== undefined) {
      initializer.addParseSpanInfo(this.variable.valueSpan).wrapForTypeChecker();
    } else {
    }
    const variable = new TcbExpr(`var ${id.print()} = ${initializer.print()}`);
    variable.addParseSpanInfo(this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}

/**
 * A `TcbOp` which renders a variable defined inside of block syntax (e.g. `@if (expr; as var) {}`).
 *
 * Executing this operation returns the identifier which can be used to refer to the variable.
 */
export class TcbBlockVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private initializer: TcbExpr,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): TcbExpr {
    const id = new TcbExpr(this.tcb.allocateId());
    id.addParseSpanInfo(this.variable.keySpan);
    this.initializer.wrapForTypeChecker();
    const variable = new TcbExpr(`var ${id.print()} = ${this.initializer.print()}`);
    variable.addParseSpanInfo(this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}
