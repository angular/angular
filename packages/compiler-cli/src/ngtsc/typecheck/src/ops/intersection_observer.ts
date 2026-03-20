/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST} from '@angular/compiler';
import {TcbOp} from './base';
import {TcbExpr} from './codegen';
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
    this.scope.addStatement(new TcbExpr(`new IntersectionObserver(null!, ${options.print()})`));
    return null;
  }
}
