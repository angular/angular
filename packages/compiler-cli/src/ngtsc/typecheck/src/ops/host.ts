/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstHostElement} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {tsCreateElement, tsCreateVariable} from '../ts_util';
import {addParseSpanInfo} from '../diagnostics';

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
    private element: TmplAstHostElement,
  ) {
    super();
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const initializer = tsCreateElement(...this.element.tagNames);
    addParseSpanInfo(initializer, this.element.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}
