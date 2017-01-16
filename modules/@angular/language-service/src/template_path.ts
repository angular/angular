/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '@angular/compiler/src/template_parser/template_ast';

import {AstPath} from './ast_path';
import {inSpan, isNarrower, spanOf} from './utils';

export class TemplateAstPath extends AstPath<TemplateAst> {
  constructor(ast: TemplateAst[], public position: number, allowWidening: boolean = false) {
    super(buildTemplatePath(ast, position, allowWidening));
  }
}

function buildTemplatePath(
    ast: TemplateAst[], position: number, allowWidening: boolean = false): TemplateAst[] {
  const visitor = new TemplateAstPathBuilder(position, allowWidening);
  templateVisitAll(visitor, ast);
  return visitor.getPath();
}

export class NullTemplateVisitor implements TemplateAstVisitor {
  visitNgContent(ast: NgContentAst): void {}
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst): void {}
  visitElement(ast: ElementAst): void {}
  visitReference(ast: ReferenceAst): void {}
  visitVariable(ast: VariableAst): void {}
  visitEvent(ast: BoundEventAst): void {}
  visitElementProperty(ast: BoundElementPropertyAst): void {}
  visitAttr(ast: AttrAst): void {}
  visitBoundText(ast: BoundTextAst): void {}
  visitText(ast: TextAst): void {}
  visitDirective(ast: DirectiveAst): void {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst): void {}
}

export class TemplateAstChildVisitor implements TemplateAstVisitor {
  constructor(private visitor?: TemplateAstVisitor) {}

  // Nodes with children
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.attrs);
      visit(ast.references);
      visit(ast.variables);
      visit(ast.directives);
      visit(ast.providers);
      visit(ast.children);
    });
  }

  visitElement(ast: ElementAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.attrs);
      visit(ast.inputs);
      visit(ast.outputs);
      visit(ast.references);
      visit(ast.directives);
      visit(ast.providers);
      visit(ast.children);
    });
  }

  visitDirective(ast: DirectiveAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.inputs);
      visit(ast.hostProperties);
      visit(ast.hostEvents);
    });
  }

  // Terminal nodes
  visitNgContent(ast: NgContentAst, context: any): any {}
  visitReference(ast: ReferenceAst, context: any): any {}
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
  visitBoundText(ast: BoundTextAst, context: any): any {}
  visitText(ast: TextAst, context: any): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}

  protected visitChildren<T extends TemplateAst>(
      context: any,
      cb: (visit: (<V extends TemplateAst>(children: V[]|undefined) => void)) => void) {
    const visitor = this.visitor || this;
    let results: any[][] = [];
    function visit<T extends TemplateAst>(children: T[] | undefined) {
      if (children && children.length) results.push(templateVisitAll(visitor, children, context));
    }
    cb(visit);
    return [].concat.apply([], results);
  }
}

class TemplateAstPathBuilder extends TemplateAstChildVisitor {
  private path: TemplateAst[] = [];

  constructor(private position: number, private allowWidening: boolean) { super(); }

  visit(ast: TemplateAst, context: any): any {
    let span = spanOf(ast);
    if (inSpan(this.position, span)) {
      const len = this.path.length;
      if (!len || this.allowWidening || isNarrower(span, spanOf(this.path[len - 1]))) {
        this.path.push(ast);
      }
    } else {
      // Returning a value here will result in the children being skipped.
      return true;
    }
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    return this.visitChildren(context, visit => {
      // Ignore reference, variable and providers
      visit(ast.attrs);
      visit(ast.directives);
      visit(ast.children);
    });
  }

  visitElement(ast: ElementAst, context: any): any {
    return this.visitChildren(context, visit => {
      // Ingnore providers
      visit(ast.attrs);
      visit(ast.inputs);
      visit(ast.outputs);
      visit(ast.references);
      visit(ast.directives);
      visit(ast.children);
    });
  }

  visitDirective(ast: DirectiveAst, context: any): any {
    // Ignore the host properties of a directive
    const result = this.visitChildren(context, visit => { visit(ast.inputs); });
    // We never care about the diretive itself, just its inputs.
    if (this.path[this.path.length - 1] == ast) {
      this.path.pop();
    }
    return result;
  }

  getPath() { return this.path; }
}
