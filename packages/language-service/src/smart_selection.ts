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
  ImplicitReceiver,
  RecursiveAstVisitor,
  ThisReceiver,
  TmplAstBlockNode,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstBoundaryBlock,
  TmplAstComponent,
  TmplAstDeferredBlock,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli';

import ts from 'typescript';

import {getTypeCheckInfoAtPosition} from './utils';

/**
 * Computes the smart selection range (nested ranges used by the editor's
 * "Expand/Shrink Selection" feature) for a position inside an Angular template.
 *
 * The chain includes, from innermost to outermost, every expression and
 * template AST node that contains the position (property reads, calls,
 * interpolations, attributes, elements, control flow blocks, ...). For nodes
 * delimited by braces or tags, the content between the delimiters is included
 * as an extra step so that e.g. the body of an `@if` block can be selected
 * before the whole block.
 *
 * Returns `undefined` when the position is not inside an Angular template that
 * this language service knows about. Merging with the surrounding TypeScript
 * structure is left to the editor, which queries every registered selection
 * range provider and combines the resulting containment trees.
 */
export function getTemplateSelectionRange(
  compiler: NgCompiler,
  fileName: string,
  position: number,
): ts.SelectionRange | undefined {
  const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
  if (typeCheckInfo === undefined) {
    return undefined;
  }

  const spans = SelectionSpanVisitor.getSpansContainingPosition(typeCheckInfo.nodes, position);
  if (spans.length === 0) {
    return undefined;
  }

  // Sort from innermost (smallest) to outermost (largest) and build the parent
  // chain. Spans that do not fully contain the previous one are dropped to
  // guarantee the strict nesting required for selection ranges.
  spans.sort((a, b) => a.length - b.length);
  let result: ts.SelectionRange | undefined = undefined;
  let innermost: ts.SelectionRange | undefined = undefined;
  for (const textSpan of spans) {
    if (result !== undefined) {
      const prev = result.textSpan;
      const isSameSpan = textSpan.start === prev.start && textSpan.length === prev.length;
      const containsPrev =
        textSpan.start <= prev.start &&
        textSpan.start + textSpan.length >= prev.start + prev.length;
      if (isSameSpan || !containsPrev) {
        continue;
      }
    }
    const range: ts.SelectionRange = {textSpan};
    if (result === undefined) {
      innermost = range;
    } else {
      result.parent = range;
    }
    result = range;
  }
  return innermost;
}

/**
 * Collects the source spans of all template nodes that contain a position,
 * including the "content" spans between the delimiters of blocks and elements
 * and the spans of the expression AST nodes inside bindings.
 */
class SelectionSpanVisitor extends TmplAstRecursiveVisitor {
  readonly spans: ts.TextSpan[] = [];

  private constructor(private readonly position: number) {
    super();
  }

  static getSpansContainingPosition(templateNodes: TmplAstNode[], position: number): ts.TextSpan[] {
    const visitor = new SelectionSpanVisitor(position);
    tmplAstVisitAll(visitor, templateNodes);
    return visitor.spans;
  }

  private addSpan(start: number, end: number): void {
    if (start <= this.position && this.position <= end && end > start) {
      this.spans.push({start, length: end - start});
    }
  }

  visit(node: TmplAstNode): void {
    const {sourceSpan} = node;
    if (this.position < sourceSpan.start.offset || this.position > sourceSpan.end.offset) {
      // The node does not contain the position; neither can its children.
      return;
    }
    this.addSpan(sourceSpan.start.offset, sourceSpan.end.offset);

    // `TmplAstIfBlock` also extends `TmplAstBlockNode`, but it does not have a
    // single brace-delimited body: its span stretches from `@if (...) {` to
    // the closing `}` of the last `@else` branch, so a content span would
    // cross branch boundaries. Only the individual `TmplAstIfBlockBranch`
    // nodes contribute content spans.
    if (node instanceof TmplAstBlockNode && !(node instanceof TmplAstIfBlock)) {
      // The source span of for loops, deferred and boundary blocks includes
      // their secondary blocks (@empty, @placeholder, ...). The extra
      // selection steps should be scoped to the main block.
      let endSpan = node.endSourceSpan;
      if (
        node instanceof TmplAstForLoopBlock ||
        node instanceof TmplAstDeferredBlock ||
        node instanceof TmplAstBoundaryBlock
      ) {
        this.addSpan(node.mainBlockSpan.start.offset, node.mainBlockSpan.end.offset);
        endSpan = node.mainBlockSpan;
      }
      // The content between the braces of the block, e.g. the body of `@if`.
      if (endSpan !== null) {
        const contentEnd =
          endSpan === node.endSourceSpan ? endSpan.start.offset : endSpan.end.offset - 1;
        this.addSpan(node.startSourceSpan.end.offset, contentEnd);
      }
    } else if (
      node instanceof TmplAstElement ||
      node instanceof TmplAstTemplate ||
      node instanceof TmplAstComponent
    ) {
      // The content between the opening and closing tags.
      if (node.endSourceSpan !== null && node.endSourceSpan !== node.startSourceSpan) {
        this.addSpan(node.startSourceSpan.end.offset, node.endSourceSpan.start.offset);
      }
    }

    this.visitExpression(node);
    node.visit(this);
  }

  /**
   * Adds the spans of the expression AST nodes attached to a template node so
   * that the selection can expand within e.g. `{{ user.address.city }}` or
   * `(click)="save(item)"` one step at a time.
   */
  private visitExpression(node: TmplAstNode): void {
    let expression: AST | null = null;
    if (node instanceof TmplAstBoundText) {
      expression = node.value;
    } else if (node instanceof TmplAstBoundAttribute) {
      expression = node.value;
    } else if (node instanceof TmplAstBoundEvent) {
      expression = node.handler;
    } else if (node instanceof TmplAstIfBlockBranch) {
      expression = node.expression;
    } else if (node instanceof TmplAstForLoopBlock) {
      expression = node.expression;
    } else if (node instanceof TmplAstSwitchBlock) {
      expression = node.expression;
    } else if (node instanceof TmplAstSwitchBlockCase) {
      expression = node.expression;
    } else if (node instanceof TmplAstLetDeclaration) {
      expression = node.value;
    }
    if (expression !== null) {
      new ExpressionSpanVisitor(this.position, this.spans).visit(expression);
    }
  }
}

/**
 * Collects the source spans of all expression AST nodes that contain a
 * position.
 */
class ExpressionSpanVisitor extends RecursiveAstVisitor {
  constructor(
    private readonly position: number,
    private readonly spans: ts.TextSpan[],
  ) {
    super();
  }

  override visit(ast: AST): void {
    if (ast instanceof ASTWithSource) {
      this.visit(ast.ast);
      return;
    }
    if (ast instanceof ImplicitReceiver || ast instanceof ThisReceiver) {
      return;
    }
    const {start, end} = ast.sourceSpan;
    if (start <= this.position && this.position <= end && end > start) {
      this.spans.push({start, length: end - start});
    }
    ast.visit(this);
  }
}
