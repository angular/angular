/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ASTWithSource, RecursiveAstVisitor} from './expression_parser/ast';
import * as t from './render3/r3_ast';
/**
 * Visitor that traverses all template and expression AST nodes in a template.
 * Useful for cases where every single node needs to be visited.
 */
export class CombinedRecursiveAstVisitor extends RecursiveAstVisitor {
  visit(node) {
    if (node instanceof ASTWithSource) {
      this.visit(node.ast);
    } else {
      node.visit(this);
    }
  }
  visitElement(element) {
    this.visitAllTemplateNodes(element.attributes);
    this.visitAllTemplateNodes(element.inputs);
    this.visitAllTemplateNodes(element.outputs);
    this.visitAllTemplateNodes(element.directives);
    this.visitAllTemplateNodes(element.references);
    this.visitAllTemplateNodes(element.children);
  }
  visitTemplate(template) {
    this.visitAllTemplateNodes(template.attributes);
    this.visitAllTemplateNodes(template.inputs);
    this.visitAllTemplateNodes(template.outputs);
    this.visitAllTemplateNodes(template.directives);
    this.visitAllTemplateNodes(template.templateAttrs);
    this.visitAllTemplateNodes(template.variables);
    this.visitAllTemplateNodes(template.references);
    this.visitAllTemplateNodes(template.children);
  }
  visitContent(content) {
    this.visitAllTemplateNodes(content.children);
  }
  visitBoundAttribute(attribute) {
    this.visit(attribute.value);
  }
  visitBoundEvent(attribute) {
    this.visit(attribute.handler);
  }
  visitBoundText(text) {
    this.visit(text.value);
  }
  visitIcu(icu) {
    Object.keys(icu.vars).forEach((key) => this.visit(icu.vars[key]));
    Object.keys(icu.placeholders).forEach((key) => this.visit(icu.placeholders[key]));
  }
  visitDeferredBlock(deferred) {
    deferred.visitAll(this);
  }
  visitDeferredTrigger(trigger) {
    if (trigger instanceof t.BoundDeferredTrigger) {
      this.visit(trigger.value);
    }
  }
  visitDeferredBlockPlaceholder(block) {
    this.visitAllTemplateNodes(block.children);
  }
  visitDeferredBlockError(block) {
    this.visitAllTemplateNodes(block.children);
  }
  visitDeferredBlockLoading(block) {
    this.visitAllTemplateNodes(block.children);
  }
  visitSwitchBlock(block) {
    this.visit(block.expression);
    this.visitAllTemplateNodes(block.cases);
  }
  visitSwitchBlockCase(block) {
    block.expression && this.visit(block.expression);
    this.visitAllTemplateNodes(block.children);
  }
  visitForLoopBlock(block) {
    block.item.visit(this);
    this.visitAllTemplateNodes(block.contextVariables);
    this.visit(block.expression);
    this.visitAllTemplateNodes(block.children);
    block.empty?.visit(this);
  }
  visitForLoopBlockEmpty(block) {
    this.visitAllTemplateNodes(block.children);
  }
  visitIfBlock(block) {
    this.visitAllTemplateNodes(block.branches);
  }
  visitIfBlockBranch(block) {
    block.expression && this.visit(block.expression);
    block.expressionAlias?.visit(this);
    this.visitAllTemplateNodes(block.children);
  }
  visitLetDeclaration(decl) {
    this.visit(decl.value);
  }
  visitComponent(component) {
    this.visitAllTemplateNodes(component.attributes);
    this.visitAllTemplateNodes(component.inputs);
    this.visitAllTemplateNodes(component.outputs);
    this.visitAllTemplateNodes(component.directives);
    this.visitAllTemplateNodes(component.references);
    this.visitAllTemplateNodes(component.children);
  }
  visitDirective(directive) {
    this.visitAllTemplateNodes(directive.attributes);
    this.visitAllTemplateNodes(directive.inputs);
    this.visitAllTemplateNodes(directive.outputs);
    this.visitAllTemplateNodes(directive.references);
  }
  visitVariable(variable) {}
  visitReference(reference) {}
  visitTextAttribute(attribute) {}
  visitText(text) {}
  visitUnknownBlock(block) {}
  visitAllTemplateNodes(nodes) {
    for (const node of nodes) {
      this.visit(node);
    }
  }
}
//# sourceMappingURL=combined_visitor.js.map
