/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  AstVisitor,
  ASTWithSource,
  RecursiveAstVisitor,
  TmplAstBoundAttribute,
  TmplAstBoundDeferredTrigger,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstComponent,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstDirective,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  tmplAstVisitAll,
  BindingPipe,
} from '@angular/compiler';

/**
 * Analyzes a component's template to determine if it's using selectorless syntax
 * and to extract the names of the selectorless symbols that are referenced.
 */
export function analyzeTemplateForSelectorless(template: TmplAstNode[]): {
  isSelectorless: boolean;
  localReferencedSymbols: Set<string> | null;
} {
  const analyzer = new SelectorlessDirectivesAnalyzer();
  tmplAstVisitAll(analyzer, template);
  const isSelectorless = analyzer.symbols !== null && analyzer.symbols.size > 0;
  const localReferencedSymbols = analyzer.symbols;

  // The template is considered selectorless only if there
  // are direct references to directives or pipes.
  return {isSelectorless, localReferencedSymbols};
}

/**
 * Visitor that traverses all the template nodes and
 * expressions to look for selectorless references.
 */
class SelectorlessDirectivesAnalyzer extends RecursiveAstVisitor implements AstVisitor {
  symbols: Set<string> | null = null;

  override visit(node: AST | TmplAstNode) {
    // TODO(crisbeto): consider capitalized pipes as "selectorless" for now.
    // We should introduce a different AST node for them in the parser.
    if (node instanceof BindingPipe && node.name[0].toUpperCase() === node.name[0]) {
      this.trackSymbol(node.name);
    }

    node.visit(this);
  }

  private trackSymbol(name: string) {
    this.symbols ??= new Set();
    this.symbols.add(name);
  }

  visitAllNodes(nodes: TmplAstNode[]) {
    for (const node of nodes) {
      this.visit(node);
    }
  }

  visitAst(ast: AST) {
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }
    this.visit(ast);
  }

  visitComponent(component: TmplAstComponent) {
    this.trackSymbol(component.componentName);
    this.visitAllNodes(component.attributes);
    this.visitAllNodes(component.inputs);
    this.visitAllNodes(component.outputs);
    this.visitAllNodes(component.directives);
    this.visitAllNodes(component.references);
    this.visitAllNodes(component.children);
  }

  visitDirective(directive: TmplAstDirective) {
    this.trackSymbol(directive.name);
    this.visitAllNodes(directive.attributes);
    this.visitAllNodes(directive.inputs);
    this.visitAllNodes(directive.outputs);
    this.visitAllNodes(directive.references);
  }

  visitElement(element: TmplAstElement) {
    this.visitAllNodes(element.attributes);
    this.visitAllNodes(element.inputs);
    this.visitAllNodes(element.outputs);
    this.visitAllNodes(element.directives);
    this.visitAllNodes(element.references);
    this.visitAllNodes(element.children);
  }

  visitTemplate(template: TmplAstTemplate) {
    this.visitAllNodes(template.attributes);
    this.visitAllNodes(template.inputs);
    this.visitAllNodes(template.outputs);
    this.visitAllNodes(template.directives);
    this.visitAllNodes(template.templateAttrs);
    this.visitAllNodes(template.variables);
    this.visitAllNodes(template.references);
    this.visitAllNodes(template.children);
  }

  visitContent(content: TmplAstContent): void {
    this.visitAllNodes(content.children);
  }

  visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    this.visitAst(attribute.value);
  }

  visitBoundEvent(attribute: TmplAstBoundEvent): void {
    this.visitAst(attribute.handler);
  }

  visitBoundText(text: TmplAstBoundText): void {
    this.visitAst(text.value);
  }

  visitIcu(icu: TmplAstIcu): void {
    Object.keys(icu.vars).forEach((key) => this.visit(icu.vars[key]));
    Object.keys(icu.placeholders).forEach((key) => this.visit(icu.placeholders[key]));
  }

  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    deferred.visitAll(this);
  }

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {
    if (trigger instanceof TmplAstBoundDeferredTrigger) {
      this.visitAst(trigger.value);
    }
  }

  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    this.visitAllNodes(block.children);
  }

  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    this.visitAllNodes(block.children);
  }

  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    this.visitAllNodes(block.children);
  }

  visitSwitchBlock(block: TmplAstSwitchBlock): void {
    this.visitAst(block.expression);
    this.visitAllNodes(block.cases);
  }

  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    block.expression && this.visitAst(block.expression);
    this.visitAllNodes(block.children);
  }

  visitForLoopBlock(block: TmplAstForLoopBlock): void {
    block.item.visit(this);
    this.visitAllNodes(block.contextVariables);
    this.visitAst(block.expression);
    this.visitAllNodes(block.children);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    this.visitAllNodes(block.children);
  }

  visitIfBlock(block: TmplAstIfBlock): void {
    this.visitAllNodes(block.branches);
  }

  visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    block.expression && this.visitAst(block.expression);
    block.expressionAlias?.visit(this);
    this.visitAllNodes(block.children);
  }

  visitLetDeclaration(decl: TmplAstLetDeclaration): void {
    this.visitAst(decl.value);
  }

  // Unused
  visitText(): void {}
  visitVariable(): void {}
  visitReference(): void {}
  visitTextAttribute(): void {}
  visitUnknownBlock(): void {}
}
