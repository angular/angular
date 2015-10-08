import {AST} from 'angular2/src/core/change_detection/change_detection';
import {isPresent} from 'angular2/src/core/facade/lang';
import {CompileDirectiveMetadata} from './directive_metadata';

export interface TemplateAst {
  sourceInfo: string;
  visit(visitor: TemplateAstVisitor, context: any): any;
}

export class TextAst implements TemplateAst {
  constructor(public value: string, public ngContentIndex: number, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any { return visitor.visitText(this, context); }
}

export class BoundTextAst implements TemplateAst {
  constructor(public value: AST, public ngContentIndex: number, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitBoundText(this, context);
  }
}

export class AttrAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any { return visitor.visitAttr(this, context); }
}

export class BoundElementPropertyAst implements TemplateAst {
  constructor(public name: string, public type: PropertyBindingType, public value: AST,
              public unit: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitElementProperty(this, context);
  }
}

export class BoundEventAst implements TemplateAst {
  constructor(public name: string, public target: string, public handler: AST,
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitEvent(this, context);
  }
  get fullName() {
    if (isPresent(this.target)) {
      return `${this.target}:${this.name}`;
    } else {
      return this.name;
    }
  }
}

export class VariableAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitVariable(this, context);
  }
}

export class ElementAst implements TemplateAst {
  constructor(public name: string, public attrs: AttrAst[],
              public inputs: BoundElementPropertyAst[], public outputs: BoundEventAst[],
              public exportAsVars: VariableAst[], public directives: DirectiveAst[],
              public children: TemplateAst[], public ngContentIndex: number,
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitElement(this, context);
  }

  isBound(): boolean {
    return (this.inputs.length > 0 || this.outputs.length > 0 || this.exportAsVars.length > 0 ||
            this.directives.length > 0);
  }

  getComponent(): CompileDirectiveMetadata {
    return this.directives.length > 0 && this.directives[0].directive.isComponent ?
               this.directives[0].directive :
               null;
  }
}

export class EmbeddedTemplateAst implements TemplateAst {
  constructor(public attrs: AttrAst[], public vars: VariableAst[],
              public directives: DirectiveAst[], public children: TemplateAst[],
              public ngContentIndex: number, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}

export class BoundDirectivePropertyAst implements TemplateAst {
  constructor(public directiveName: string, public templateName: string, public value: AST,
              public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitDirectiveProperty(this, context);
  }
}

export class DirectiveAst implements TemplateAst {
  constructor(public directive: CompileDirectiveMetadata,
              public inputs: BoundDirectivePropertyAst[],
              public hostProperties: BoundElementPropertyAst[], public hostEvents: BoundEventAst[],
              public exportAsVars: VariableAst[], public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitDirective(this, context);
  }
}

export class NgContentAst implements TemplateAst {
  constructor(public index: number, public ngContentIndex: number, public sourceInfo: string) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitNgContent(this, context);
  }
}

export enum PropertyBindingType {
  Property,
  Attribute,
  Class,
  Style
}

export interface TemplateAstVisitor {
  visitNgContent(ast: NgContentAst, context: any): any;
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
  visitElement(ast: ElementAst, context: any): any;
  visitVariable(ast: VariableAst, context: any): any;
  visitEvent(ast: BoundEventAst, context: any): any;
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
  visitAttr(ast: AttrAst, context: any): any;
  visitBoundText(ast: BoundTextAst, context: any): any;
  visitText(ast: TextAst, context: any): any;
  visitDirective(ast: DirectiveAst, context: any): any;
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}


export function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[],
                                 context: any = null): any[] {
  var result = [];
  asts.forEach(ast => {
    var astResult = ast.visit(visitor, context);
    if (isPresent(astResult)) {
      result.push(astResult);
    }
  });
  return result;
}
