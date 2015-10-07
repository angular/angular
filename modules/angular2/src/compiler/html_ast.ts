import {isPresent} from 'angular2/src/facade/lang';

import {ParseSourceSpan} from './parse_util';

export interface HtmlAst {
  sourceSpan: ParseSourceSpan;
  visit(visitor: HtmlAstVisitor, context: any): any;
}

export class HtmlTextAst implements HtmlAst {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: HtmlAstVisitor, context: any): any { return visitor.visitText(this, context); }
}

export class HtmlAttrAst implements HtmlAst {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: HtmlAstVisitor, context: any): any { return visitor.visitAttr(this, context); }
}

export class HtmlElementAst implements HtmlAst {
  constructor(public name: string, public attrs: HtmlAttrAst[], public children: HtmlAst[],
              public sourceSpan: ParseSourceSpan) {}
  visit(visitor: HtmlAstVisitor, context: any): any { return visitor.visitElement(this, context); }
}

export interface HtmlAstVisitor {
  visitElement(ast: HtmlElementAst, context: any): any;
  visitAttr(ast: HtmlAttrAst, context: any): any;
  visitText(ast: HtmlTextAst, context: any): any;
}

export function htmlVisitAll(visitor: HtmlAstVisitor, asts: HtmlAst[], context: any = null): any[] {
  var result = [];
  asts.forEach(ast => {
    var astResult = ast.visit(visitor, context);
    if (isPresent(astResult)) {
      result.push(astResult);
    }
  });
  return result;
}
