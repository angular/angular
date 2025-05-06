/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, ASTWithSource, RecursiveAstVisitor} from './expression_parser/ast';
import * as t from './render3/r3_ast';

/**
 * Visitor that traverses all template and expression AST nodes in a template.
 * Useful for cases where every single node needs to be visited.
 */
export class CombinedRecursiveAstVisitor extends RecursiveAstVisitor implements t.RecursiveVisitor {
  override visit(node: AST | t.Node): void {
    if (node instanceof ASTWithSource) {
      this.visit(node.ast);
    } else {
      node.visit(this);
    }
  }

  visitElement(element: t.Element): void {
    this.visitAllTemplateNodes(element.attributes);
    this.visitAllTemplateNodes(element.inputs);
    this.visitAllTemplateNodes(element.outputs);
    this.visitAllTemplateNodes(element.directives);
    this.visitAllTemplateNodes(element.references);
    this.visitAllTemplateNodes(element.children);
  }

  visitTemplate(template: t.Template): void {
    this.visitAllTemplateNodes(template.attributes);
    this.visitAllTemplateNodes(template.inputs);
    this.visitAllTemplateNodes(template.outputs);
    this.visitAllTemplateNodes(template.directives);
    this.visitAllTemplateNodes(template.templateAttrs);
    this.visitAllTemplateNodes(template.variables);
    this.visitAllTemplateNodes(template.references);
    this.visitAllTemplateNodes(template.children);
  }

  visitContent(content: t.Content): void {
    this.visitAllTemplateNodes(content.children);
  }

  visitBoundAttribute(attribute: t.BoundAttribute): void {
    this.visit(attribute.value);
  }

  visitBoundEvent(attribute: t.BoundEvent): void {
    this.visit(attribute.handler);
  }

  visitBoundText(text: t.BoundText): void {
    this.visit(text.value);
  }

  visitIcu(icu: t.Icu): void {
    Object.keys(icu.vars).forEach((key) => this.visit(icu.vars[key]));
    Object.keys(icu.placeholders).forEach((key) => this.visit(icu.placeholders[key]));
  }

  visitDeferredBlock(deferred: t.DeferredBlock): void {
    deferred.visitAll(this);
  }

  visitDeferredTrigger(trigger: t.DeferredTrigger): void {
    if (trigger instanceof t.BoundDeferredTrigger) {
      this.visit(trigger.value);
    }
  }

  visitDeferredBlockPlaceholder(block: t.DeferredBlockPlaceholder): void {
    this.visitAllTemplateNodes(block.children);
  }

  visitDeferredBlockError(block: t.DeferredBlockError): void {
    this.visitAllTemplateNodes(block.children);
  }

  visitDeferredBlockLoading(block: t.DeferredBlockLoading): void {
    this.visitAllTemplateNodes(block.children);
  }

  visitSwitchBlock(block: t.SwitchBlock): void {
    this.visit(block.expression);
    this.visitAllTemplateNodes(block.cases);
  }

  visitSwitchBlockCase(block: t.SwitchBlockCase): void {
    block.expression && this.visit(block.expression);
    this.visitAllTemplateNodes(block.children);
  }

  visitForLoopBlock(block: t.ForLoopBlock): void {
    block.item.visit(this);
    this.visitAllTemplateNodes(block.contextVariables);
    this.visit(block.expression);
    this.visitAllTemplateNodes(block.children);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: t.ForLoopBlockEmpty): void {
    this.visitAllTemplateNodes(block.children);
  }

  visitIfBlock(block: t.IfBlock): void {
    this.visitAllTemplateNodes(block.branches);
  }

  visitIfBlockBranch(block: t.IfBlockBranch): void {
    block.expression && this.visit(block.expression);
    block.expressionAlias?.visit(this);
    this.visitAllTemplateNodes(block.children);
  }

  visitLetDeclaration(decl: t.LetDeclaration): void {
    this.visit(decl.value);
  }

  visitComponent(component: t.Component): void {
    this.visitAllTemplateNodes(component.attributes);
    this.visitAllTemplateNodes(component.inputs);
    this.visitAllTemplateNodes(component.outputs);
    this.visitAllTemplateNodes(component.directives);
    this.visitAllTemplateNodes(component.references);
    this.visitAllTemplateNodes(component.children);
  }

  visitDirective(directive: t.Directive): void {
    this.visitAllTemplateNodes(directive.attributes);
    this.visitAllTemplateNodes(directive.inputs);
    this.visitAllTemplateNodes(directive.outputs);
    this.visitAllTemplateNodes(directive.references);
  }

  visitVariable(variable: t.Variable): void {}
  visitReference(reference: t.Reference): void {}
  visitTextAttribute(attribute: t.TextAttribute): void {}
  visitText(text: t.Text): void {}
  visitUnknownBlock(block: t.UnknownBlock): void {}

  protected visitAllTemplateNodes(nodes: t.Node[]): void {
    for (const node of nodes) {
      this.visit(node);
    }
  }
}
