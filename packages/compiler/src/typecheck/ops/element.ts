/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Element} from '../../render3/r3_ast';
import {TcbOp} from './base';
import {TcbExpr} from './codegen';
import type {Context} from './context';
import type {Scope} from './scope';

/**
 * Returns whether a tag name is a candidate custom element (has a dash, not an Angular built-in).
 */
export function isCustomElementTag(tagName: string): boolean {
  const name = tagName.replace(/^:xhtml:/, '').toLowerCase();
  return (
    /^[a-z].*-/.test(name) &&
    name !== 'ng-container' &&
    name !== 'ng-content' &&
    name !== 'ng-template'
  );
}

/**
 * A `TcbOp` which creates an expression for a native DOM element (or web component) from a
 * `Element`.
 *
 * Executing this operation returns a reference to the element variable.
 */
export class TcbElementOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private element: Element,
  ) {
    super();
  }

  private get isCustomElement(): boolean {
    return isCustomElementTag(this.element.name);
  }

  override get optional() {
    return true;
  }

  override execute(): TcbExpr {
    const rawTagName = this.element.name.replace(/^:xhtml:/, '');
    const lowerTagName = rawTagName.toLowerCase();

    const id = this.tcb.allocateId();
    const idNode = new TcbExpr(id);
    idNode.addParseSpanInfo(this.element.startSourceSpan || this.element.sourceSpan);

    let initializer: TcbExpr;
    if (this.isCustomElement) {
      const ngElementType = this.tcb.env.referenceExternalSymbol('@angular/core', 'ɵNgElementType');
      const castType = `${ngElementType.print()}<${TcbExpr.quoteAndEscape(lowerTagName)}>`;
      initializer = new TcbExpr(
        `(document.createElement(${TcbExpr.quoteAndEscape(lowerTagName)}) as unknown as ${castType})`,
      );
    } else {
      initializer = new TcbExpr(`document.createElement(${TcbExpr.quoteAndEscape(rawTagName)})`);
    }

    initializer.addParseSpanInfo(this.element.startSourceSpan || this.element.sourceSpan);
    const stmt = new TcbExpr(`var ${idNode.print()} = ${initializer.print()}`);
    stmt.addParseSpanInfo(this.element.startSourceSpan || this.element.sourceSpan);
    this.scope.addStatement(stmt);
    return idNode;
  }
}
