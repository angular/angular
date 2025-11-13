/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {TcbOp} from './base';
import type {Scope} from './scope';
import {addExpressionIdentifier, ExpressionIdentifier, markIgnoreDiagnostics} from '../comments';

/**
 * A `TcbOp` which generates a completion point for the component context.
 *
 * This completion point looks like `this. ;` in the TCB output, and does not produce diagnostics.
 * TypeScript autocompletion APIs can be used at this completion point (after the '.') to produce
 * autocompletion results of properties and methods from the template's component context.
 */
export class TcbComponentContextCompletionOp extends TcbOp {
  constructor(private scope: Scope) {
    super();
  }

  override readonly optional = false;

  override execute(): null {
    const ctx = ts.factory.createThis();
    const ctxDot = ts.factory.createPropertyAccessExpression(ctx, '');
    markIgnoreDiagnostics(ctxDot);
    addExpressionIdentifier(ctxDot, ExpressionIdentifier.COMPONENT_COMPLETION);
    this.scope.addStatement(ts.factory.createExpressionStatement(ctxDot));
    return null;
  }
}
