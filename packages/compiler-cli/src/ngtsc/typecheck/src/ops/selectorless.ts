/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstComponent} from '@angular/compiler';
import ts from 'typescript';
import {addParseSpanInfo} from '../diagnostics';
import {tsCreateElement, tsCreateVariable} from '../ts_util';
import {TcbOp} from './base';
import {Context} from './context';
import type {Scope} from './scope';

// TODO(crisbeto): the logic for determining the fallback tag name of a Component node is
// still being designed. For now fall back to `ng-component`, but this will have to be
// revisited once the design is finalized.
export function getComponentTagName(node: TmplAstComponent): string {
  return node.tagName || 'ng-component';
}

/**
 * A `TcbOp` which creates an expression for a native DOM element from a `TmplAstComponent`.
 *
 * Executing this operation returns a reference to the element variable.
 */
export class TcbComponentNodeOp extends TcbOp {
  override readonly optional = true;

  constructor(
    private tcb: Context,
    private scope: Scope,
    private component: TmplAstComponent,
  ) {
    super();
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const initializer = tsCreateElement(getComponentTagName(this.component));
    addParseSpanInfo(initializer, this.component.startSourceSpan || this.component.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}
