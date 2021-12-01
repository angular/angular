/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18nMeta} from '../i18n/i18n_ast';
import {ParseSourceSpan} from '../parse_util';

import {InterpolatedAttributeToken, InterpolatedTextToken} from './tokens';

interface BaseNode {
  sourceSpan: ParseSourceSpan;
  visit(visitor: Visitor, context: any): any;
}

export type Node = Attribute|Comment|Element|Expansion|ExpansionCase|Text;

export abstract class NodeWithI18n implements BaseNode {
  constructor(public sourceSpan: ParseSourceSpan, public i18n?: I18nMeta) {}
  abstract visit(visitor: Visitor, context: any): any;
}

export class Text extends NodeWithI18n {
  constructor(
      public value: string, sourceSpan: ParseSourceSpan, public tokens: InterpolatedTextToken[],
      i18n?: I18nMeta) {
    super(sourceSpan, i18n);
  }
  override visit(visitor: Visitor, context: any): any {
    return visitor.visitText(this, context);
  }
}

export class Expansion extends NodeWithI18n {
  constructor(
      public switchValue: string, public type: string, public cases: ExpansionCase[],
      sourceSpan: ParseSourceSpan, public switchValueSourceSpan: ParseSourceSpan, i18n?: I18nMeta) {
    super(sourceSpan, i18n);
  }
  override visit(visitor: Visitor, context: any): any {
    return visitor.visitExpansion(this, context);
  }
}

export class ExpansionCase implements BaseNode {
  constructor(
      public value: string, public expression: Node[], public sourceSpan: ParseSourceSpan,
      public valueSourceSpan: ParseSourceSpan, public expSourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context: any): any {
    return visitor.visitExpansionCase(this, context);
  }
}

export class Attribute extends NodeWithI18n {
  constructor(
      public name: string, public value: string, sourceSpan: ParseSourceSpan,
      readonly keySpan: ParseSourceSpan|undefined, public valueSpan: ParseSourceSpan|undefined,
      public valueTokens: InterpolatedAttributeToken[]|undefined, i18n: I18nMeta|undefined) {
    super(sourceSpan, i18n);
  }
  override visit(visitor: Visitor, context: any): any {
    return visitor.visitAttribute(this, context);
  }
}

export class Element extends NodeWithI18n {
  constructor(
      public name: string, public attrs: Attribute[], public children: Node[],
      sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan,
      public endSourceSpan: ParseSourceSpan|null = null, i18n?: I18nMeta) {
    super(sourceSpan, i18n);
  }
  override visit(visitor: Visitor, context: any): any {
    return visitor.visitElement(this, context);
  }
}

export class Comment implements BaseNode {
  constructor(public value: string|null, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: Visitor, context: any): any {
    return visitor.visitComment(this, context);
  }
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
      (ast: Node) => visitor.visit!(ast, context) || ast.visit(visitor, context) :
      (ast: Node) => ast.visit(visitor, context);
  nodes.forEach(ast => {
    const astResult = visit(ast);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}
