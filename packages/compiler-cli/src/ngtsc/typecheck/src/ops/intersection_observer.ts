/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import {Context} from './context';
import type {Scope} from './scope';
import {tcbExpression} from './expression';

/**
 * A `TcbOp` which can be used to type check the options of an `IntersectionObserver`.
 */
export class TcbIntersectionObserverOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private options: AST,
  ) {
    super();
  }

  override readonly optional = false;

  override execute(): null {
    const options = tcbExpression(this.options, this.tcb, this.scope);
    const callback = ts.factory.createNonNullExpression(ts.factory.createNull());
    const expression = ts.factory.createNewExpression(
      ts.factory.createIdentifier('IntersectionObserver'),
      undefined,
      [callback, options],
    );

    this.scope.addStatement(ts.factory.createExpressionStatement(expression));
    return null;
  }
}
