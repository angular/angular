/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TmplAstBlockNode,
  TmplAstBoundaryBlock,
  TmplAstComponent,
  TmplAstDeferredBlock,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstTemplate,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli';

import ts from 'typescript';

import {getTypeCheckInfoAtPosition, isTypeScriptFile} from './utils';

/**
 * Computes the smart selection range (nested ranges used by the editor's
 * "Expand/Shrink Selection" feature) for a position inside an Angular template.
 *
 * The chain includes, from innermost to outermost, every template AST node that
 * contains the position (interpolations, attributes, elements, control flow
 * blocks, ...). For nodes delimited by braces or tags, the content between the
 * delimiters is included as an extra step so that e.g. the body of an `@if`
 * block can be selected before the whole block.
 *
 * Returns `undefined` when the position is not inside an Angular template that
 * this language service knows about.
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
 * Computes the smart selection range for a position in a file, merging the
 * Angular template chain with TypeScript's own smart selection when the
 * position is inside an inline template.
 */
export function getSmartSelectionRange(
  compiler: NgCompiler,
  tsLS: ts.LanguageService,
  fileName: string,
  position: number,
): ts.SelectionRange {
  const templateRange = getTemplateSelectionRange(compiler, fileName, position);

  if (!isTypeScriptFile(fileName)) {
    // External template: there is no TypeScript structure to merge with.
    return templateRange ?? {textSpan: {start: position, length: 0}};
  }

  const tsRange = tsLS.getSmartSelectionRange(fileName, position);
  if (templateRange === undefined) {
    return tsRange;
  }

  // Graft the template chain onto the TypeScript chain: the outermost template
  // range (the whole template) gets, as parent, the innermost TypeScript range
  // that strictly contains it (e.g. the template string literal).
  let outermost = templateRange;
  while (outermost.parent !== undefined) {
    outermost = outermost.parent;
  }
  const templateEnd = outermost.textSpan.start + outermost.textSpan.length;
  let tsParent: ts.SelectionRange | undefined = tsRange;
  while (
    tsParent !== undefined &&
    !(
      tsParent.textSpan.start <= outermost.textSpan.start &&
      tsParent.textSpan.start + tsParent.textSpan.length >= templateEnd &&
      tsParent.textSpan.length > outermost.textSpan.length
    )
  ) {
    tsParent = tsParent.parent;
  }
  outermost.parent = tsParent;
  return templateRange;
}

/**
 * Collects the source spans of all template nodes that contain a position,
 * including the "content" spans between the delimiters of blocks and elements.
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

    if (node instanceof TmplAstBlockNode) {
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

    node.visit(this);
  }
}
