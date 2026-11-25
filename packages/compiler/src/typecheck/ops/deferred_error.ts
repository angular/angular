/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DeferredBlockError} from '../../render3/r3_ast';
import {TcbOp} from './base';
import {getStatementsBlock, TcbExpr} from './codegen';
import type {Scope} from './scope';

/**
 * A `TcbOp` which renders the `@error` block of a `@defer` block.
 */
export class TcbDeferredErrorOp extends TcbOp {
  constructor(
    private scope: Scope,
    private block: DeferredBlockError,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const errorScope = this.scope.createChildScope(
      this.scope,
      this.block,
      this.block.children,
      null,
    );
    this.scope.addStatement(new TcbExpr(`{\n${getStatementsBlock(errorScope.render())}}`));
    return null;
  }
}
