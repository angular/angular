/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Comment, Element, Expansion, ExpansionCase, Node, Text, Visitor, visitAll} from '@angular/compiler/src/ml_parser/ast';

import {AstPath} from './ast_path';
import {inSpan, spanOf} from './utils';

export class HtmlAstPath extends AstPath<Node> {
  constructor(ast: Node[], public position: number) { super(buildPath(ast, position)); }
}

function buildPath(ast: Node[], position: number): Node[] {
  let visitor = new HtmlAstPathBuilder(position);
  visitAll(visitor, ast);
  return visitor.getPath();
}

export class ChildVisitor implements Visitor {
  constructor(private visitor?: Visitor) {}

  visitElement(ast: Element, context: any): any {
    this.visitChildren(context, visit => {
      visit(ast.attrs);
      visit(ast.children);
    });
  }

  visitAttribute(ast: Attribute, context: any): any {}
  visitText(ast: Text, context: any): any {}
  visitComment(ast: Comment, context: any): any {}

  visitExpansion(ast: Expansion, context: any): any {
    return this.visitChildren(context, visit => { visit(ast.cases); });
  }

  visitExpansionCase(ast: ExpansionCase, context: any): any {}

  private visitChildren<T extends Node>(
      context: any, cb: (visit: (<V extends Node>(children: V[]|undefined) => void)) => void) {
    const visitor = this.visitor || this;
    let results: any[][] = [];
    function visit<T extends Node>(children: T[] | undefined) {
      if (children) results.push(visitAll(visitor, children, context));
    }
    cb(visit);
    return [].concat.apply([], results);
  }
}

class HtmlAstPathBuilder extends ChildVisitor {
  private path: Node[] = [];

  constructor(private position: number) { super(); }

  visit(ast: Node, context: any): any {
    let span = spanOf(ast);
    if (inSpan(this.position, span)) {
      this.path.push(ast);
    } else {
      // Returning a value here will result in the children being skipped.
      return true;
    }
  }

  getPath(): Node[] { return this.path; }
}
