/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {addParseSpanInfo, wrapForTypeChecker} from '../diagnostics';
import {tsCreateVariable, tsDeclareVariable} from '../ts_util';

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
    private type: ts.TypeNode,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override readonly optional = true;

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsDeclareVariable(id, this.type);
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
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

  override execute(): ts.Identifier {
    // Look for a context variable for the template.
    const ctx = this.scope.resolve(this.template);

    // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable
    // on the template context.
    const id = this.tcb.allocateId();
    const initializer = ts.factory.createPropertyAccessExpression(
      /* expression */ ctx,
      /* name */ this.variable.value || '$implicit',
    );
    addParseSpanInfo(id, this.variable.keySpan);

    // Declare the variable, and return its identifier.
    let variable: ts.VariableStatement;
    if (this.variable.valueSpan !== undefined) {
      addParseSpanInfo(initializer, this.variable.valueSpan);
      variable = tsCreateVariable(id, wrapForTypeChecker(initializer));
    } else {
      variable = tsCreateVariable(id, initializer);
    }
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
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
    private initializer: ts.Expression,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsCreateVariable(id, wrapForTypeChecker(this.initializer));
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}
