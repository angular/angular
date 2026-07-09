/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HostElement} from '../../render3/r3_ast';
import {TcbOp} from './base';
import {TcbExpr} from './codegen';
import type {Context} from './context';
import type {Scope} from './scope';

/**
 * A `TcbOp` which creates an expression for a the host element of a directive.
 *
 * Executing this operation returns a reference to the element variable.
 */
export class TcbHostElementOp extends TcbOp {
  override readonly optional = true;

  constructor(
    private tcb: Context,
    private scope: Scope,
    private element: HostElement,
  ) {
    super();
  }

  override execute(): TcbExpr {
    const id = this.tcb.allocateId();
    let tagNames: string;

    if (this.element.tagNames.length === 1) {
      tagNames = `"${this.element.tagNames[0]}"`;
    } else {
      tagNames = `null! as ${this.element.tagNames.map((t) => `"${t}"`).join(' | ')}`;
    }

    const initializer = new TcbExpr(`document.createElement(${tagNames})`);
    initializer.addParseSpanInfo(this.element.sourceSpan);
    this.scope.addStatement(new TcbExpr(`var ${id} = ${initializer.print()}`));
    return new TcbExpr(id);
  }
}
