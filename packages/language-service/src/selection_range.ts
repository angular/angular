/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ParseSourceSpan,
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
  TmplAstHostElement,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstSwitchBlockCaseGroup,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstUnknownBlock,
  TmplAstVariable,
  TmplAstViewportDeferredTrigger,
  TmplAstVisitor,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import ts from 'typescript';

import {getTypeCheckInfoAtPosition, isWithin} from './utils';

/**
 * Get selection ranges at the given position in an Angular template.
 *
 * Selection ranges provide smart selection expansion: select text → expand to element →
 * expand to parent → expand to block.
 */
export function getSelectionRangeAtPosition(
  compiler: NgCompiler,
  fileName: string,
  position: number,
): ts.SelectionRange | undefined {
  const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
  if (typeCheckInfo === undefined) {
    return undefined;
  }

  // Get the path from the root to the node at the position
  const path = SelectionRangeVisitor.visitTemplate(typeCheckInfo.nodes, position);

  if (path.length === 0) {
    return undefined;
  }

  // Build the selection range chain from innermost to outermost
  return buildSelectionRangeChain(path);
}

/**
 * Build a chain of selection ranges from the path of nodes.
 * The innermost node is the first in the chain, with `parent` pointing to outer ranges.
 */
function buildSelectionRangeChain(path: Array<TmplAstNode | AST>): ts.SelectionRange | undefined {
  if (path.length === 0) {
    return undefined;
  }

  let current: ts.SelectionRange | undefined;

  // Process from outermost to innermost, so we can build the parent chain correctly
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    const span = getNodeSpan(node);

    if (span === undefined) {
      continue;
    }

    const range: ts.SelectionRange = {
      textSpan: {
        start: span.start.offset,
        length: span.end.offset - span.start.offset,
      },
      parent: current,
    };

    current = range;
  }

  return current;
}

/**
 * Get the source span for a node.
 */
function getNodeSpan(
  node: TmplAstNode | AST,
): {start: {offset: number}; end: {offset: number}} | undefined {
  if (node instanceof AST) {
    // AST nodes have AbsoluteSourceSpan which has start/end as numbers
    const span = node.sourceSpan;
    return {
      start: {offset: span.start},
      end: {offset: span.end},
    };
  }

  // For elements and templates, use the full span from start to end tag
  if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
    // Full element span including both tags
    return node.sourceSpan;
  }

  if (node instanceof TmplAstComponent) {
    return node.sourceSpan;
  }

  if (node instanceof TmplAstDirective) {
    return node.sourceSpan;
  }

  // For control flow blocks
  if (
    node instanceof TmplAstIfBlock ||
    node instanceof TmplAstIfBlockBranch ||
    node instanceof TmplAstForLoopBlock ||
    node instanceof TmplAstForLoopBlockEmpty ||
    node instanceof TmplAstSwitchBlock ||
    node instanceof TmplAstSwitchBlockCase ||
    node instanceof TmplAstSwitchBlockCaseGroup ||
    node instanceof TmplAstDeferredBlock ||
    node instanceof TmplAstDeferredBlockPlaceholder ||
    node instanceof TmplAstDeferredBlockLoading ||
    node instanceof TmplAstDeferredBlockError
  ) {
    return node.sourceSpan;
  }

  // For text nodes
  if (node instanceof TmplAstText || node instanceof TmplAstBoundText) {
    return node.sourceSpan;
  }

  // For attributes
  if (
    node instanceof TmplAstBoundAttribute ||
    node instanceof TmplAstBoundEvent ||
    node instanceof TmplAstTextAttribute
  ) {
    return node.sourceSpan;
  }

  // For template variables and references
  if (node instanceof TmplAstVariable || node instanceof TmplAstReference) {
    return node.sourceSpan;
  }

  // For @let declarations
  if (node instanceof TmplAstLetDeclaration) {
    return node.sourceSpan;
  }

  return undefined;
}

/**
 * Visitor to collect the path from root to the deepest node containing the position.
 */
class SelectionRangeVisitor implements TmplAstVisitor {
  readonly path: Array<TmplAstNode | AST> = [];

  static visitTemplate(template: TmplAstNode[], position: number): Array<TmplAstNode | AST> {
    const visitor = new SelectionRangeVisitor(position);
    visitor.visitAll(template);
    return visitor.path;
  }

  private constructor(private readonly position: number) {}

  visit(node: TmplAstNode) {
    // Use the node's sourceSpan directly for the position check
    if (!node.sourceSpan || !isWithin(this.position, node.sourceSpan)) {
      return;
    }

    this.path.push(node);
    node.visit(this);
  }

  visitElement(element: TmplAstElement): void {
    this.visitAll(element.attributes);
    this.visitAll(element.inputs);
    this.visitAll(element.outputs);
    this.visitAll(element.references);
    this.visitAll(element.children);
  }

  visitTemplate(template: TmplAstTemplate): void {
    this.visitAll(template.templateAttrs);
    this.visitAll(template.attributes);
    this.visitAll(template.inputs);
    this.visitAll(template.outputs);
    this.visitAll(template.variables);
    this.visitAll(template.references);
    this.visitAll(template.children);
  }

  visitComponent(component: TmplAstComponent): void {
    this.visitAll(component.attributes);
    this.visitAll(component.inputs);
    this.visitAll(component.outputs);
    this.visitAll(component.references);
    this.visitAll(component.children);
  }

  visitDirective(directive: TmplAstDirective): void {
    this.visitAll(directive.attributes);
    this.visitAll(directive.inputs);
    this.visitAll(directive.outputs);
  }

  visitHostElement(hostElement: TmplAstHostElement): void {}

  visitContent(content: TmplAstContent): void {}

  visitVariable(variable: TmplAstVariable): void {}

  visitReference(reference: TmplAstReference): void {}

  visitTextAttribute(attribute: TmplAstTextAttribute): void {}

  visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    this.visitExpression(attribute.value);
  }

  visitBoundEvent(event: TmplAstBoundEvent): void {
    this.visitExpression(event.handler);
  }

  visitText(text: TmplAstText): void {}

  visitBoundText(text: TmplAstBoundText): void {
    this.visitExpression(text.value);
  }

  visitIcu(icu: TmplAstIcu): void {}

  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    this.visitAll(deferred.children);
    if (deferred.placeholder) {
      this.visit(deferred.placeholder);
    }
    if (deferred.loading) {
      this.visit(deferred.loading);
    }
    if (deferred.error) {
      this.visit(deferred.error);
    }
  }

  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    this.visitAll(block.children);
  }

  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    this.visitAll(block.children);
  }

  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    this.visitAll(block.children);
  }

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}

  visitSwitchBlock(block: TmplAstSwitchBlock): void {
    this.visitExpression(block.expression);
    this.visitAll(block.groups);
  }

  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    if (block.expression) {
      this.visitExpression(block.expression);
    }
  }

  visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {
    this.visitAll(group.cases);
    this.visitAll(group.children);
  }

  visitForLoopBlock(block: TmplAstForLoopBlock): void {
    this.visitExpression(block.expression);
    this.visitAll(block.children);
    if (block.empty) {
      this.visit(block.empty);
    }
  }

  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    this.visitAll(block.children);
  }

  visitIfBlock(block: TmplAstIfBlock): void {
    this.visitAll(block.branches);
  }

  visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    if (block.expression) {
      this.visitExpression(block.expression);
    }
    this.visitAll(block.children);
  }

  visitLetDeclaration(decl: TmplAstLetDeclaration): void {
    this.visitExpression(decl.value);
  }

  visitUnknownBlock(block: TmplAstUnknownBlock): void {}

  private visitAll(nodes: TmplAstNode[]): void {
    for (const node of nodes) {
      this.visit(node);
    }
  }

  private visitExpression(ast: AST): void {
    const span = ast.sourceSpan;
    if (isWithin(this.position, span)) {
      this.path.push(ast);
      // For deeper AST traversal, we could use RecursiveAstVisitor
      // but for selection ranges, stopping at the top-level expression is usually sufficient
    }
  }
}
