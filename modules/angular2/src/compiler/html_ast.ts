import {isPresent} from 'angular2/src/core/facade/lang';

export interface HtmlAst {
  sourceInfo: string;
  visit(visitor: HtmlAstVisitor): any;
}

export class HtmlTextAst implements HtmlAst {
  constructor(public value: string, public sourceInfo: string) {}
  visit(visitor: HtmlAstVisitor): any { return visitor.visitText(this); }
}

export class HtmlAttrAst implements HtmlAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: HtmlAstVisitor): any { return visitor.visitAttr(this); }
}

export class HtmlElementAst implements HtmlAst {
  constructor(public name: string, public attrs: HtmlAttrAst[], public children: HtmlAst[],
              public sourceInfo: string) {}
  visit(visitor: HtmlAstVisitor): any { return visitor.visitElement(this); }
}

export interface HtmlAstVisitor {
  visitElement(ast: HtmlElementAst): any;
  visitAttr(ast: HtmlAttrAst): any;
  visitText(ast: HtmlTextAst): any;
}

export function htmlVisitAll(visitor: HtmlAstVisitor, asts: HtmlAst[]): any[] {
  var result = [];
  asts.forEach(ast => {
    var astResult = ast.visit(visitor);
    if (isPresent(astResult)) {
      result.push(astResult);
    }
  });
  return result;
}
