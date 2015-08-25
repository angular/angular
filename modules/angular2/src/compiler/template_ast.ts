import {AST} from 'angular2/src/core/change_detection/change_detection';
import {isPresent} from 'angular2/src/core/facade/lang';
import {DirectiveMetadata} from './api';

export interface TemplateAst {
  sourceInfo: string;
  visit(visitor: TemplateAstVisitor): any;
}

export class TextAst implements TemplateAst {
  constructor(public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitText(this); }
}

export class BoundTextAst implements TemplateAst {
  constructor(public value: AST, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitBoundText(this); }
}

export class AttrAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitAttr(this); }
}

export class BoundPropertyAst implements TemplateAst {
  constructor(public name: string, public value: AST, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitProperty(this); }
}

export class BoundEventAst implements TemplateAst {
  constructor(public name: string, public handler: AST, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitEvent(this); }
}

export class VariableAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitVariable(this); }
}

export class ElementAst implements TemplateAst {
  constructor(public attrs: AttrAst[], public properties: BoundPropertyAst[],
              public events: BoundEventAst[], public vars: VariableAst[],
              public directives: DirectiveMetadata[], public children: TemplateAst[],
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitElement(this); }
}

export class EmbeddedTemplateAst implements TemplateAst {
  constructor(public attrs: AttrAst[], public properties: BoundPropertyAst[],
              public vars: VariableAst[], public directives: DirectiveMetadata[],
              public children: TemplateAst[], public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitEmbeddedTemplate(this); }
}

export class NgContentAst implements TemplateAst {
  constructor(public select: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitNgContent(this); }
}

export interface TemplateAstVisitor {
  visitNgContent(ast: NgContentAst): any;
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst): any;
  visitElement(ast: ElementAst): any;
  visitVariable(ast: VariableAst): any;
  visitEvent(ast: BoundEventAst): any;
  visitProperty(ast: BoundPropertyAst): any;
  visitAttr(ast: AttrAst): any;
  visitBoundText(ast: BoundTextAst): any;
  visitText(ast: TextAst): any;
}


export function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[]): any[] {
  var result = [];
  asts.forEach(ast => {
    var astResult = ast.visit(visitor);
    if (isPresent(astResult)) {
      result.push(astResult);
    }
  });
  return result;
}
