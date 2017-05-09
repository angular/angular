/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AstPath} from '../ast_path';
import {ParseSourceSpan} from '../parse_util';

export interface Node {
  sourceSpan: ParseSourceSpan;
  visit(visitor: Visitor, context: any): any;
}

export class Text implements Node {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitText(this, context); }
}

export class Expansion implements Node {
  constructor(
      public switchValue: string, public type: string, public cases: ExpansionCase[],
      public sourceSpan: ParseSourceSpan, public switchValueSourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitExpansion(this, context); }
}

export class ExpansionCase implements Node {
  constructor(
      public value: string, public expression: Node[], public sourceSpan: ParseSourceSpan,
      public valueSourceSpan: ParseSourceSpan, public expSourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context: any): any { return visitor.visitExpansionCase(this, context); }
}

export class Attribute implements Node {
  constructor(
      public name: string, public value: string, public sourceSpan: ParseSourceSpan,
      public valueSpan?: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitAttribute(this, context); }
}

export class Element implements Node {
  constructor(
      public name: string, public attrs: Attribute[], public children: Node[],
      public sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan|null = null,
      public endSourceSpan: ParseSourceSpan|null = null) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitElement(this, context); }
}

export class Comment implements Node {
  constructor(public value: string|null, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitComment(this, context); }
}

export interface Visitor {
  // Returning a truthy value from `visit()` will prevent `visitAll()` from the call to the typed
  // method and result returned will become the result included in `visitAll()`s result array.
  visit?(node: Node, context: any): any;

  visitElement(element: Element, context: any): any;
  visitAttribute(attribute: Attribute, context: any): any;
  visitText(text: Text, context: any): any;
  visitComment(comment: Comment, context: any): any;
  visitExpansion(expansion: Expansion, context: any): any;
  visitExpansionCase(expansionCase: ExpansionCase, context: any): any;
}

export function visitAll(visitor: Visitor, nodes: Node[], context: any = null): any[] {
  const result: any[] = [];

  const visit = visitor.visit ?
      (ast: Node) => visitor.visit !(ast, context) || ast.visit(visitor, context) :
      (ast: Node) => ast.visit(visitor, context);
  nodes.forEach(ast => {
    const astResult = visit(ast);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}

export class RecursiveVisitor implements Visitor {
  constructor() {}

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
    let results: any[][] = [];
    let t = this;
    function visit<T extends Node>(children: T[] | undefined) {
      if (children) results.push(visitAll(t, children, context));
    }
    cb(visit);
    return [].concat.apply([], results);
  }
}

export type HtmlAstPath = AstPath<Node>;

function spanOf(ast: Node) {
  const start = ast.sourceSpan.start.offset;
  let end = ast.sourceSpan.end.offset;
  if (ast instanceof Element) {
    if (ast.endSourceSpan) {
      end = ast.endSourceSpan.end.offset;
    } else if (ast.children && ast.children.length) {
      end = spanOf(ast.children[ast.children.length - 1]).end;
    }
  }
  return {start, end};
}

export function findNode(nodes: Node[], position: number): HtmlAstPath {
  const path: Node[] = [];

  const visitor = new class extends RecursiveVisitor {
    visit(ast: Node, context: any): any {
      const span = spanOf(ast);
      if (span.start <= position && position < span.end) {
        path.push(ast);
      } else {
        // Returning a value here will result in the children being skipped.
        return true;
      }
    }
  }

  visitAll(visitor, nodes);

  return new AstPath<Node>(path, position);
}