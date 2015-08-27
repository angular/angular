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

export class BoundElementPropertyAst implements TemplateAst {
  constructor(public name: string, public type: PropertyBindingType, public value: AST,
              public unit: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitElementProperty(this); }
}

export class BoundEventAst implements TemplateAst {
  constructor(public name: string, public target: string, public handler: AST,
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitEvent(this); }
}

export class VariableAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitVariable(this); }
}

export class ElementAst implements TemplateAst {
  constructor(public attrs: AttrAst[], public properties: BoundElementPropertyAst[],
              public events: BoundEventAst[], public vars: VariableAst[],
              public directives: DirectiveAst[], public children: TemplateAst[],
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitElement(this); }
}

export class EmbeddedTemplateAst implements TemplateAst {
  constructor(public attrs: AttrAst[], public vars: VariableAst[],
              public directives: DirectiveAst[], public children: TemplateAst[],
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitEmbeddedTemplate(this); }
}

export class BoundDirectivePropertyAst implements TemplateAst {
  constructor(public directiveName: string, public templateName: string, public value: AST,
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitDirectiveProperty(this); }
}

export class DirectiveAst implements TemplateAst {
  constructor(public directive: DirectiveMetadata, public properties: BoundDirectivePropertyAst[],
              public hostProperties: BoundElementPropertyAst[], public hostEvents: BoundEventAst[],
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitDirective(this); }
}

export class NgContentAst implements TemplateAst {
  constructor(public select: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor): any { return visitor.visitNgContent(this); }
}

export enum PropertyBindingType {
  Property,
  Attribute,
  Class,
  Style
}

export interface TemplateAstVisitor {
  visitNgContent(ast: NgContentAst): any;
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst): any;
  visitElement(ast: ElementAst): any;
  visitVariable(ast: VariableAst): any;
  visitEvent(ast: BoundEventAst): any;
  visitElementProperty(ast: BoundElementPropertyAst): any;
  visitAttr(ast: AttrAst): any;
  visitBoundText(ast: BoundTextAst): any;
  visitText(ast: TextAst): any;
  visitDirective(ast: DirectiveAst): any;
  visitDirectiveProperty(ast: BoundDirectivePropertyAst): any;
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
