/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  Interpolation,
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
 * Represents a span of text in the template.
 */
interface Span {
  start: number;
  end: number;
}

/**
 * Represents a node in the selection path with its span.
 */
interface PathEntry {
  node: TmplAstNode | AST | null;
  span: Span;
}

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
 * Build a chain of selection ranges from the path entries.
 * The innermost node is the first in the chain, with `parent` pointing to outer ranges.
 */
function buildSelectionRangeChain(path: PathEntry[]): ts.SelectionRange | undefined {
  if (path.length === 0) {
    return undefined;
  }

  let current: ts.SelectionRange | undefined;

  // Process from outermost to innermost, so we can build the parent chain correctly
  // Filter out duplicate spans to avoid redundant selection steps
  const seenSpans = new Set<string>();

  for (let i = 0; i < path.length; i++) {
    const entry = path[i];
    const spanKey = `${entry.span.start}-${entry.span.end}`;

    // Skip duplicate spans
    if (seenSpans.has(spanKey)) {
      continue;
    }
    seenSpans.add(spanKey);

    const range: ts.SelectionRange = {
      textSpan: {
        start: entry.span.start,
        length: entry.span.end - entry.span.start,
      },
      parent: current,
    };

    current = range;
  }

  return current;
}

/**
 * Get the source span for a node as a simple Span object.
 */
function getNodeSpan(node: TmplAstNode | AST): Span | undefined {
  if (node instanceof AST) {
    // AST nodes have AbsoluteSourceSpan which has start/end as numbers
    const span = node.sourceSpan;
    return {start: span.start, end: span.end};
  }

  // For elements and templates, use the full span from start to end tag
  if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
    // Full element span including both tags
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  if (node instanceof TmplAstComponent) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  if (node instanceof TmplAstDirective) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
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
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  // For text nodes
  if (node instanceof TmplAstText || node instanceof TmplAstBoundText) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  // For attributes
  if (
    node instanceof TmplAstBoundAttribute ||
    node instanceof TmplAstBoundEvent ||
    node instanceof TmplAstTextAttribute
  ) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  // For template variables and references
  if (node instanceof TmplAstVariable || node instanceof TmplAstReference) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  // For @let declarations
  if (node instanceof TmplAstLetDeclaration) {
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  return undefined;
}

/**
 * Compute the content span (between start tag and end tag) for an element.
 */
function getElementContentSpan(element: TmplAstElement | TmplAstTemplate): Span | undefined {
  // Self-closing elements have no content
  if (element instanceof TmplAstElement && element.isSelfClosing) {
    return undefined;
  }

  // If there's no end tag, no content span
  if (!element.endSourceSpan) {
    return undefined;
  }

  // Content is between the end of start tag and the start of end tag
  const start = element.startSourceSpan.end.offset;
  const end = element.endSourceSpan.start.offset;

  // If start >= end, there's no content
  if (start >= end) {
    return undefined;
  }

  return {start, end};
}

/**
 * Compute the combined span of all siblings at a given level.
 * This is used to add an intermediate "all siblings" selection step.
 */
function getSiblingsSpan(siblings: TmplAstNode[], currentNode: TmplAstNode): Span | undefined {
  if (siblings.length <= 1) {
    return undefined;
  }

  let start = Infinity;
  let end = -Infinity;

  for (const sibling of siblings) {
    const span = getNodeSpan(sibling);
    if (span) {
      start = Math.min(start, span.start);
      end = Math.max(end, span.end);
    }
  }

  if (start === Infinity || end === -Infinity) {
    return undefined;
  }

  // Only return if different from the current node's span
  const currentSpan = getNodeSpan(currentNode);
  if (currentSpan && currentSpan.start === start && currentSpan.end === end) {
    return undefined;
  }

  return {start, end};
}

/**
 * Visitor to collect the path from root to the deepest node containing the position.
 * Now returns PathEntry[] with spans for each level, including intermediate spans.
 */
class SelectionRangeVisitor implements TmplAstVisitor {
  readonly path: PathEntry[] = [];
  private currentChildren: TmplAstNode[] = [];

  static visitTemplate(template: TmplAstNode[], position: number): PathEntry[] {
    const visitor = new SelectionRangeVisitor(position);
    visitor.currentChildren = template;
    visitor.visitAll(template);
    return visitor.path;
  }

  private constructor(private readonly position: number) {}

  visit(node: TmplAstNode) {
    // Use the node's sourceSpan directly for the position check
    if (!node.sourceSpan || !isWithin(this.position, node.sourceSpan)) {
      return;
    }

    // Add intermediate "all siblings" span if there are multiple siblings
    const siblingsSpan = getSiblingsSpan(this.currentChildren, node);
    if (siblingsSpan) {
      this.path.push({node: null, span: siblingsSpan});
    }

    // Add the node's span
    const nodeSpan = getNodeSpan(node);
    if (nodeSpan) {
      this.path.push({node, span: nodeSpan});
    }

    node.visit(this);
  }

  visitElement(element: TmplAstElement): void {
    // Add content span (between start and end tags) before visiting children
    // But only if content span is different from all children combined span
    if (element.children.length > 1) {
      const contentSpan = getElementContentSpan(element);
      const childrenSpan = getSiblingsSpan(element.children, element.children[0]);
      // Add content span only if it's different from children combined span
      if (
        contentSpan &&
        (!childrenSpan ||
          contentSpan.start !== childrenSpan.start ||
          contentSpan.end !== childrenSpan.end)
      ) {
        this.path.push({node: null, span: contentSpan});
      }
    }

    this.visitAll(element.attributes);
    this.visitAll(element.inputs);
    this.visitAll(element.outputs);
    this.visitAll(element.references);

    const savedChildren = this.currentChildren;
    this.currentChildren = element.children;
    this.visitAll(element.children);
    this.currentChildren = savedChildren;
  }

  visitTemplate(template: TmplAstTemplate): void {
    // Add content span before visiting children
    const contentSpan = getElementContentSpan(template);
    if (contentSpan && template.children.length > 0) {
      this.path.push({node: null, span: contentSpan});
    }

    this.visitAll(template.templateAttrs);
    this.visitAll(template.attributes);
    this.visitAll(template.inputs);
    this.visitAll(template.outputs);
    this.visitAll(template.variables);
    this.visitAll(template.references);

    const savedChildren = this.currentChildren;
    this.currentChildren = template.children;
    this.visitAll(template.children);
    this.currentChildren = savedChildren;
  }

  visitComponent(component: TmplAstComponent): void {
    this.visitAll(component.attributes);
    this.visitAll(component.inputs);
    this.visitAll(component.outputs);
    this.visitAll(component.references);

    const savedChildren = this.currentChildren;
    this.currentChildren = component.children;
    this.visitAll(component.children);
    this.currentChildren = savedChildren;
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
    const savedChildren = this.currentChildren;
    this.currentChildren = deferred.children;
    this.visitAll(deferred.children);
    this.currentChildren = savedChildren;

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
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
  }

  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
  }

  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
  }

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}

  visitSwitchBlock(block: TmplAstSwitchBlock): void {
    this.visitExpression(block.expression);
    const savedChildren = this.currentChildren;
    this.currentChildren = block.groups as TmplAstNode[];
    this.visitAll(block.groups);
    this.currentChildren = savedChildren;
  }

  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    if (block.expression) {
      this.visitExpression(block.expression);
    }
  }

  visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {
    this.visitAll(group.cases);
    const savedChildren = this.currentChildren;
    this.currentChildren = group.children;
    this.visitAll(group.children);
    this.currentChildren = savedChildren;
  }

  visitForLoopBlock(block: TmplAstForLoopBlock): void {
    this.visitExpression(block.expression);
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
    if (block.empty) {
      this.visit(block.empty);
    }
  }

  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
  }

  visitIfBlock(block: TmplAstIfBlock): void {
    const savedChildren = this.currentChildren;
    this.currentChildren = block.branches as TmplAstNode[];
    this.visitAll(block.branches);
    this.currentChildren = savedChildren;
  }

  visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    if (block.expression) {
      this.visitExpression(block.expression);
    }
    const savedChildren = this.currentChildren;
    this.currentChildren = block.children;
    this.visitAll(block.children);
    this.currentChildren = savedChildren;
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
    if (!isWithin(this.position, span)) {
      return;
    }

    // Unwrap ASTWithSource
    let innerAst = ast;
    if (ast instanceof ASTWithSource) {
      innerAst = ast.ast;
    }

    // For Interpolation, we need to find the specific expression that contains the position
    if (innerAst instanceof Interpolation) {
      // Add the full interpolation span first (same as BoundText, will be deduplicated)
      this.path.push({node: ast, span: {start: span.start, end: span.end}});

      // Then find and add the specific expression containing the position
      for (const expr of innerAst.expressions) {
        const exprSpan = expr.sourceSpan;
        if (isWithin(this.position, exprSpan)) {
          this.path.push({node: expr, span: {start: exprSpan.start, end: exprSpan.end}});
          // Recursively visit the expression for deeper traversal
          this.visitExpression(expr);
          break;
        }
      }
    } else {
      // For other AST nodes, just add them
      this.path.push({node: ast, span: {start: span.start, end: span.end}});
    }
  }
}
