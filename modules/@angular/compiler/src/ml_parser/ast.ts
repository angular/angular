/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitAttribute(this, context); }
}

export class Element implements Node {
  constructor(
      public name: string, public attrs: Attribute[], public children: Node[],
      public sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan,
      public endSourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitElement(this, context); }
}

export class Comment implements Node {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any { return visitor.visitComment(this, context); }
}

export interface Visitor {
  visitElement(element: Element, context: any): any;
  visitAttribute(attribute: Attribute, context: any): any;
  visitText(text: Text, context: any): any;
  visitComment(comment: Comment, context: any): any;
  visitExpansion(expansion: Expansion, context: any): any;
  visitExpansionCase(expansionCase: ExpansionCase, context: any): any;
}

export function visitAll(visitor: Visitor, nodes: Node[], context: any = null): any[] {
  let result: any[] = [];
  nodes.forEach(ast => {
    const astResult = ast.visit(visitor, context);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}
