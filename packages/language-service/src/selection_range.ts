/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ArrowFunction,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  Interpolation,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  ParseSourceSpan,
  PrefixNot,
  PropertyRead,
  RegularExpressionLiteral,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  SpreadElement,
  TaggedTemplateLiteral,
  TemplateLiteral,
  TemplateLiteralElement,
  ThisReceiver,
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
  TypeofExpression,
  VoidExpression,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import ts from 'typescript';

import {getTypeCheckInfoAtPosition, isWithin} from './utils';

// ============================================================================
// Helper Types and Interfaces
// ============================================================================

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

// ============================================================================
// Position Snapping (like TypeScript's positionShouldSnapToNode)
// ============================================================================

/**
 * Check if the position should "snap" to the given span.
 * Like TypeScript, positions immediately after a token count too,
 * unless that position belongs to the next token. This makes selections
 * able to snap to preceding tokens when the cursor is on the tail end.
 *
 * @param position The cursor position
 * @param span The span to check
 * @param nextSpanStart The start of the next sibling span (if any)
 */
function positionShouldSnapToSpan(position: number, span: Span, nextSpanStart?: number): boolean {
  // Position is strictly within the span
  if (position >= span.start && position < span.end) {
    return true;
  }
  // Position is at the end of the span - snap if no next sibling starts here
  if (position === span.end) {
    return nextSpanStart === undefined || nextSpanStart > position;
  }
  return false;
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
  // Filter out duplicate spans and zero-length spans to avoid redundant selection steps
  const seenSpans = new Set<string>();

  for (let i = 0; i < path.length; i++) {
    const entry = path[i];
    const spanKey = `${entry.span.start}-${entry.span.end}`;

    // Skip zero-length spans (e.g., implicit receiver)
    if (entry.span.start === entry.span.end) {
      continue;
    }

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

  // For text attributes, compute a more accurate span
  // Angular's sourceSpan may include trailing `>` or whitespace in some cases
  if (node instanceof TmplAstTextAttribute) {
    // If we have valueSpan, compute span from keySpan start to valueSpan end + closing quote
    if (node.keySpan && node.valueSpan) {
      const start = node.keySpan.start.offset;
      // valueSpan doesn't include the quotes, so add 1 for the closing quote
      const end = node.valueSpan.end.offset + 1;
      return {start, end};
    }
    // If attribute has no value (e.g., `disabled`), use keySpan
    if (node.keySpan && !node.valueSpan) {
      return {start: node.keySpan.start.offset, end: node.keySpan.end.offset};
    }
    // Fallback to sourceSpan
    return {start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset};
  }

  // For bound attributes and events
  if (node instanceof TmplAstBoundAttribute || node instanceof TmplAstBoundEvent) {
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
function getElementContentSpan(
  element: TmplAstElement | TmplAstTemplate | TmplAstComponent,
): Span | undefined {
  // Self-closing elements have no content
  if (
    (element instanceof TmplAstElement || element instanceof TmplAstComponent) &&
    element.isSelfClosing
  ) {
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

  /**
   * Get an accurate span for an attribute, avoiding the issue where Angular's
   * sourceSpan may include trailing '>' or whitespace for the last attribute.
   */
  private getAccurateAttributeSpan(
    attr: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent,
  ): Span {
    // For TextAttribute, compute span from keySpan to valueSpan end + closing quote
    if (attr instanceof TmplAstTextAttribute) {
      if (attr.keySpan && attr.valueSpan) {
        return {
          start: attr.keySpan.start.offset,
          end: attr.valueSpan.end.offset + 1, // +1 for closing quote
        };
      }
      if (attr.keySpan && !attr.valueSpan) {
        return {start: attr.keySpan.start.offset, end: attr.keySpan.end.offset};
      }
    }
    // For BoundAttribute and BoundEvent, sourceSpan is generally accurate
    return {start: attr.sourceSpan.start.offset, end: attr.sourceSpan.end.offset};
  }

  visit(node: TmplAstNode) {
    // Use position snapping like TypeScript's smartSelection.ts
    // This allows positions at the end of a token to snap to that token
    const nodeSpan = getNodeSpan(node);
    if (!nodeSpan || !positionShouldSnapToSpan(this.position, nodeSpan)) {
      return;
    }

    // Add intermediate "all siblings" span if there are multiple siblings
    const siblingsSpan = getSiblingsSpan(this.currentChildren, node);
    if (siblingsSpan) {
      this.path.push({node: null, span: siblingsSpan});
    }

    // Add the node's span
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

    // Add attribute sibling grouping span (all attributes together)
    const allAttributes = [...element.attributes, ...element.inputs, ...element.outputs];
    if (allAttributes.length > 1) {
      let minStart = Infinity;
      let maxEnd = -Infinity;

      for (const attr of allAttributes) {
        // Use accurate span calculation to avoid including trailing '>' or whitespace
        const span = this.getAccurateAttributeSpan(attr);
        minStart = Math.min(minStart, span.start);
        maxEnd = Math.max(maxEnd, span.end);
      }

      // Only add if position is within the attributes region
      if (this.position >= minStart && this.position < maxEnd) {
        this.path.push({node: null, span: {start: minStart, end: maxEnd}});
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

    // Add attribute sibling grouping span (all attributes together)
    const allAttributes = [
      ...template.templateAttrs,
      ...template.attributes,
      ...template.inputs,
      ...template.outputs,
    ];
    if (allAttributes.length > 1) {
      let minStart = Infinity;
      let maxEnd = -Infinity;

      for (const attr of allAttributes) {
        const span = attr.sourceSpan;
        minStart = Math.min(minStart, span.start.offset);
        maxEnd = Math.max(maxEnd, span.end.offset);
      }

      // Only add if position is within the attributes region
      if (this.position >= minStart && this.position < maxEnd) {
        this.path.push({node: null, span: {start: minStart, end: maxEnd}});
      }
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
    // Add content span (between start and end tags) before visiting children
    if (component.children.length > 1) {
      const contentSpan = getElementContentSpan(component);
      const childrenSpan = getSiblingsSpan(component.children, component.children[0]);
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

    // Add attribute sibling grouping span (all attributes together)
    const allAttributes = [...component.attributes, ...component.inputs, ...component.outputs];
    if (allAttributes.length > 1) {
      let minStart = Infinity;
      let maxEnd = -Infinity;

      for (const attr of allAttributes) {
        const span = attr.sourceSpan;
        minStart = Math.min(minStart, span.start.offset);
        maxEnd = Math.max(maxEnd, span.end.offset);
      }

      // Only add if position is within the attributes region
      if (this.position >= minStart && this.position < maxEnd) {
        this.path.push({node: null, span: {start: minStart, end: maxEnd}});
      }
    }

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

  visitTextAttribute(attribute: TmplAstTextAttribute): void {
    // Add the attribute key span (just the attribute name)
    // This allows selecting just "style" in style="color: red"
    // Only add if the cursor is within the key span
    if (attribute.keySpan) {
      const keySpan = {
        start: attribute.keySpan.start.offset,
        end: attribute.keySpan.end.offset,
      };
      if (positionShouldSnapToSpan(this.position, keySpan)) {
        this.path.push({node: null, span: keySpan});
      }
    }

    // Add the attribute value span (just the value inside quotes)
    // For id="name", this allows selecting just "name"
    // Note: For style/class attributes, CSS LSP delegation in the server handler
    // provides granular selection within the value
    if (attribute.valueSpan) {
      const valueSpan = {
        start: attribute.valueSpan.start.offset,
        end: attribute.valueSpan.end.offset,
      };
      // Only add if cursor is within the value span
      if (positionShouldSnapToSpan(this.position, valueSpan)) {
        this.path.push({node: null, span: valueSpan});
      }
    }
  }

  visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    // First add the attribute key (name) span to the path
    // This will be an outer level since path is built innermost-to-outermost
    if (attribute.keySpan) {
      const keySpan = {
        start: attribute.keySpan.start.offset,
        end: attribute.keySpan.end.offset,
      };
      this.path.push({node: null, span: keySpan});
    }

    // Then visit the expression (adds innermost node - the expression value)
    // This creates expansion: expression → key → full attribute → element
    this.visitExpression(attribute.value);
  }

  visitBoundEvent(event: TmplAstBoundEvent): void {
    // First add the event key (name) span to the path
    // This will be an outer level since path is built innermost-to-outermost
    if (event.keySpan) {
      const keySpan = {
        start: event.keySpan.start.offset,
        end: event.keySpan.end.offset,
      };
      this.path.push({node: null, span: keySpan});
    }

    // Then visit the handler expression (adds innermost node)
    // This creates expansion: expression → key → full event → element
    this.visitExpression(event.handler);
  }

  visitText(text: TmplAstText): void {
    // Add word-level selection within the text node
    // This provides more granular steps to "win" against HTML provider's merging
    this.addWordAndLineSpans(text.value, {
      start: text.sourceSpan.start.offset,
      end: text.sourceSpan.end.offset,
    });
  }

  visitBoundText(text: TmplAstBoundText): void {
    this.visitExpression(text.value);
  }

  /**
   * Add word-level and line-level spans for text content.
   * This fills in gaps that VS Code's smart select would otherwise fill with
   * built-in HTML provider's ranges, preventing inconsistent merge hierarchies.
   *
   * Note: Spans are pushed in order from outer to inner because the path is built
   * outermost-to-innermost. So line (larger) is pushed before word (smaller).
   */
  private addWordAndLineSpans(textContent: string, textSpan: Span): void {
    const relativePos = this.position - textSpan.start;
    if (relativePos < 0 || relativePos > textContent.length) {
      return;
    }

    // Find line boundaries at the cursor position (content on same line)
    // Line is pushed FIRST because it's larger (outer) than word
    const lineBounds = this.findLineAtPosition(textContent, relativePos);
    if (lineBounds) {
      this.path.push({
        node: null,
        span: {
          start: textSpan.start + lineBounds.start,
          end: textSpan.start + lineBounds.end,
        },
      });
    }

    // Find word boundaries at the cursor position
    // Word is pushed AFTER line because it's smaller (inner)
    const wordBounds = this.findWordAtPosition(textContent, relativePos);
    if (
      wordBounds &&
      (!lineBounds || wordBounds.start !== lineBounds.start || wordBounds.end !== lineBounds.end)
    ) {
      this.path.push({
        node: null,
        span: {
          start: textSpan.start + wordBounds.start,
          end: textSpan.start + wordBounds.end,
        },
      });
    }
  }

  /**
   * Find the word at the given position in the text.
   * Optimized: scans from position instead of regex over entire text.
   */
  private findWordAtPosition(
    text: string,
    position: number,
  ): {start: number; end: number} | undefined {
    if (position < 0 || position > text.length) {
      return undefined;
    }

    // Check if position is on a word character
    const isWordChar = (c: string) => /[\w\-]/.test(c);

    // If cursor is between chars, check the char before it
    if (position === text.length || !isWordChar(text[position])) {
      if (position > 0 && isWordChar(text[position - 1])) {
        // Cursor is at end of word, adjust position
        position = position - 1;
      } else {
        return undefined;
      }
    }

    // Scan left to find word start
    let start = position;
    while (start > 0 && isWordChar(text[start - 1])) {
      start--;
    }

    // Scan right to find word end
    let end = position;
    while (end < text.length && isWordChar(text[end])) {
      end++;
    }

    if (start === end) {
      return undefined;
    }

    return {start, end};
  }

  /**
   * Find the line content at the given position (trimmed, without leading/trailing whitespace).
   * Optimized: uses indexOf/lastIndexOf instead of character-by-character scan.
   */
  private findLineAtPosition(
    text: string,
    position: number,
  ): {start: number; end: number} | undefined {
    // Find line start using lastIndexOf (much faster than character scan)
    const prevNewline = text.lastIndexOf('\n', position - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;

    // Find line end using indexOf
    const nextNewline = text.indexOf('\n', position);
    const lineEnd = nextNewline === -1 ? text.length : nextNewline;

    // Trim whitespace from the line content
    const lineContent = text.substring(lineStart, lineEnd);
    const trimmedStart = lineStart + (lineContent.length - lineContent.trimStart().length);
    const trimmedEnd = lineEnd - (lineContent.length - lineContent.trimEnd().length);

    if (trimmedStart >= trimmedEnd) {
      return undefined;
    }

    return {start: trimmedStart, end: trimmedEnd};
  }

  visitIcu(icu: TmplAstIcu): void {
    // ICU messages contain variables (like {count}) and placeholders
    // For {count, plural, =0 {no items} =1 {one item} other {many items}}:
    // - vars contains the bound expressions (e.g., the 'count' variable)
    // - placeholders contains the case content

    // Visit variable expressions (the values being switched on)
    for (const varName of Object.keys(icu.vars)) {
      const varNode = icu.vars[varName];
      // varNode is a BoundText which contains an AST expression
      if (varNode.value && isWithin(this.position, varNode.value.sourceSpan)) {
        this.visitExpression(varNode.value);
      }
    }

    // Visit placeholder content (the case branches)
    for (const placeholderName of Object.keys(icu.placeholders)) {
      const placeholder = icu.placeholders[placeholderName];
      const span = placeholder.sourceSpan;
      if (this.position >= span.start.offset && this.position < span.end.offset) {
        // Add the placeholder span
        this.path.push({node: placeholder, span: {start: span.start.offset, end: span.end.offset}});

        // If it's a BoundText, visit the expression inside
        if (placeholder instanceof TmplAstBoundText && placeholder.value) {
          this.visitExpression(placeholder.value);
        } else if (placeholder instanceof TmplAstText) {
          // For plain text placeholders, add word/line spans
          this.addWordAndLineSpans(placeholder.value, {
            start: span.start.offset,
            end: span.end.offset,
          });
        }
      }
    }
  }

  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    const savedChildren = this.currentChildren;
    this.currentChildren = deferred.children;
    this.visitAll(deferred.children);
    this.currentChildren = savedChildren;

    // Visit triggers (when, hover, timer, viewport, etc.)
    this.visitDeferredBlockTriggers(deferred.triggers);
    this.visitDeferredBlockTriggers(deferred.prefetchTriggers);
    if ('hydrateTriggers' in deferred) {
      this.visitDeferredBlockTriggers(
        (deferred as {hydrateTriggers: typeof deferred.triggers}).hydrateTriggers,
      );
    }

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

  /**
   * Visit all defined triggers in a DeferredBlockTriggers object.
   */
  private visitDeferredBlockTriggers(
    triggers: Readonly<{[key: string]: TmplAstDeferredTrigger | undefined}>,
  ): void {
    for (const key of Object.keys(triggers)) {
      const trigger = triggers[key];
      if (trigger) {
        this.visit(trigger);
      }
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

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {
    // For BoundDeferredTrigger (when condition), traverse the expression
    // Example: @defer (when isReady) { ... }
    if (trigger instanceof TmplAstBoundDeferredTrigger && trigger.value) {
      if (isWithin(this.position, trigger.value.sourceSpan)) {
        this.visitExpression(trigger.value);
      }
    }
    // Other trigger types (timer, viewport, hover, etc.) don't have
    // sub-expressions to traverse - their parameters are parsed values
  }

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

    // Add the current expression's span
    this.path.push({node: ast, span: {start: span.start, end: span.end}});

    // Recursively visit sub-expressions based on AST type
    if (innerAst instanceof Interpolation) {
      // For Interpolation, find and visit the specific expression containing the position
      for (const expr of innerAst.expressions) {
        const exprSpan = expr.sourceSpan;
        if (isWithin(this.position, exprSpan)) {
          this.visitExpression(expr);
          break;
        }
      }
    } else if (innerAst instanceof PropertyRead || innerAst instanceof SafePropertyRead) {
      // For property access (user.name), ALWAYS visit the receiver (user)
      // This creates chain: user → user.name (even if cursor is on "name")
      // The receiver won't be added if position isn't within its span (caught by check at top)
      // But we still need to try visiting it to build the full chain
      if (innerAst.receiver) {
        // Temporarily bypass the position check for receivers in property chains
        // We want to add all ancestor receivers to the path
        this.visitPropertyChainReceiver(innerAst.receiver);
      }
    } else if (innerAst instanceof KeyedRead || innerAst instanceof SafeKeyedRead) {
      // For keyed access (arr[0]), visit object
      // Only visit key if position is within it
      if (innerAst.receiver) {
        this.visitPropertyChainReceiver(innerAst.receiver);
      }
      if (innerAst.key && isWithin(this.position, innerAst.key.sourceSpan)) {
        this.visitExpression(innerAst.key);
      }
    } else if (innerAst instanceof Call || innerAst instanceof SafeCall) {
      // For method calls (doThing(arg)), visit receiver
      if (innerAst.receiver) {
        this.visitExpression(innerAst.receiver);
      }
      // Visit arguments only if position is within them
      for (const arg of innerAst.args) {
        if (isWithin(this.position, arg.sourceSpan)) {
          this.visitExpression(arg);
        }
      }
    } else if (innerAst instanceof Binary) {
      // For binary expressions (a + b), visit the operand containing the position
      if (isWithin(this.position, innerAst.left.sourceSpan)) {
        this.visitExpression(innerAst.left);
      } else if (isWithin(this.position, innerAst.right.sourceSpan)) {
        this.visitExpression(innerAst.right);
      }
    } else if (innerAst instanceof Conditional) {
      // For ternary (cond ? a : b), visit the part containing the position
      if (isWithin(this.position, innerAst.condition.sourceSpan)) {
        this.visitExpression(innerAst.condition);
      } else if (isWithin(this.position, innerAst.trueExp.sourceSpan)) {
        this.visitExpression(innerAst.trueExp);
      } else if (isWithin(this.position, innerAst.falseExp.sourceSpan)) {
        this.visitExpression(innerAst.falseExp);
      }
    } else if (innerAst instanceof NonNullAssert) {
      // For non-null assertion (user!), visit the expression
      this.visitExpression(innerAst.expression);
    } else if (innerAst instanceof TemplateLiteral) {
      // For template strings `text ${expr} more`, visit expressions in ${...}
      // Like TypeScript's handling of template literals
      for (let i = 0; i < innerAst.expressions.length; i++) {
        const expr = innerAst.expressions[i];
        if (isWithin(this.position, expr.sourceSpan)) {
          // Add the ${...} span using the boundaries from template literal elements
          // elements[i] ends before ${, elements[i+1] starts after }
          // So ${expr} spans from elements[i].end to elements[i+1].start
          const exprSpan = expr.sourceSpan;
          let templateExprStart = exprSpan.start - 2; // Default: 2 chars for ${
          let templateExprEnd = exprSpan.end + 1; // Default: 1 char for }

          // Use actual element boundaries if available
          if (innerAst.elements[i]) {
            templateExprStart = innerAst.elements[i].sourceSpan.end;
          }
          if (innerAst.elements[i + 1]) {
            templateExprEnd = innerAst.elements[i + 1].sourceSpan.start;
          }

          this.path.push({node: null, span: {start: templateExprStart, end: templateExprEnd}});
          this.visitExpression(expr);
          break;
        }
      }
    } else if (innerAst instanceof LiteralPrimitive && typeof innerAst.value === 'string') {
      // For string literals 'foo' or "foo", like TypeScript, add both:
      // - inside quotes: foo
      // - with quotes: 'foo'
      // The outer span is already added above, now add inner span
      const literalSpan = innerAst.sourceSpan;
      if (literalSpan.end - literalSpan.start >= 2) {
        // Add span inside quotes (start+1 to end-1)
        this.path.push({
          node: null,
          span: {start: literalSpan.start + 1, end: literalSpan.end - 1},
        });
      }
    } else if (innerAst instanceof ArrowFunction) {
      // For arrow functions (a, b) => a + b, visit body
      // Parameters are handled by spans - each param has its own sourceSpan
      // The full function span is already added above
      // For selection: param → params list → body → full arrow function
      if (innerAst.body && isWithin(this.position, innerAst.body.sourceSpan)) {
        this.visitExpression(innerAst.body);
      }
    } else if (innerAst instanceof BindingPipe) {
      // For pipes (value | uppercase | slice:0:10), visit expression and arguments
      // Expansion: arg → pipe → piped expr → next pipe → full chain
      if (isWithin(this.position, innerAst.exp.sourceSpan)) {
        this.visitExpression(innerAst.exp);
      }
      // Visit pipe arguments
      for (const arg of innerAst.args) {
        if (isWithin(this.position, arg.sourceSpan)) {
          this.visitExpression(arg);
        }
      }
    } else if (innerAst instanceof LiteralArray) {
      // For array literals [1, 2, 3], visit elements
      for (const element of innerAst.expressions) {
        if (isWithin(this.position, element.sourceSpan)) {
          this.visitExpression(element);
        }
      }
    } else if (innerAst instanceof LiteralMap) {
      // For object literals {key: value}, visit values
      for (const value of innerAst.values) {
        if (isWithin(this.position, value.sourceSpan)) {
          this.visitExpression(value);
        }
      }
    } else if (innerAst instanceof PrefixNot) {
      // For prefix not !value, visit expression
      if (isWithin(this.position, innerAst.expression.sourceSpan)) {
        this.visitExpression(innerAst.expression);
      }
    } else if (innerAst instanceof TypeofExpression) {
      // For typeof expression, visit the expression
      if (isWithin(this.position, innerAst.expression.sourceSpan)) {
        this.visitExpression(innerAst.expression);
      }
    } else if (innerAst instanceof SpreadElement) {
      // For spread ...expr, visit the expression
      if (isWithin(this.position, innerAst.expression.sourceSpan)) {
        this.visitExpression(innerAst.expression);
      }
    } else if (innerAst instanceof Chain) {
      // For chain a; b; c (multiple statements), visit each expression
      for (const expr of innerAst.expressions) {
        if (isWithin(this.position, expr.sourceSpan)) {
          this.visitExpression(expr);
        }
      }
    } else if (innerAst instanceof TaggedTemplateLiteral) {
      // For tagged template tag`str ${expr}`, visit tag and template
      if (isWithin(this.position, innerAst.tag.sourceSpan)) {
        this.visitExpression(innerAst.tag);
      }
      if (isWithin(this.position, innerAst.template.sourceSpan)) {
        this.visitExpression(innerAst.template);
      }
    } else if (innerAst instanceof VoidExpression) {
      // For void expr, visit the expression
      if (isWithin(this.position, innerAst.expression.sourceSpan)) {
        this.visitExpression(innerAst.expression);
      }
    } else if (innerAst instanceof ParenthesizedExpression) {
      // For parenthesized (expr), visit the inner expression
      // The parentheses themselves are just syntactic - the expression is what matters
      if (isWithin(this.position, innerAst.expression.sourceSpan)) {
        this.visitExpression(innerAst.expression);
      }
    }
    // ThisReceiver, ImplicitReceiver, EmptyExpr, TemplateLiteralElement,
    // and RegularExpressionLiteral have no sub-expressions to visit
    // They are leaf nodes in the expression tree
    // Other expression types (ImplicitReceiver, numbers, etc.) have no sub-expressions
  }

  /**
   * Visit receivers in a property/keyed access chain, adding all ancestor nodes.
   * For user.address.city, this adds: user → user.address → user.address.city
   */
  private visitPropertyChainReceiver(receiver: AST): void {
    // Always add the receiver to build the full chain, regardless of position
    const span = receiver.sourceSpan;
    this.path.push({node: receiver, span: {start: span.start, end: span.end}});

    // Continue up the chain if receiver is also a property/keyed access
    let innerReceiver = receiver;
    if (receiver instanceof ASTWithSource) {
      innerReceiver = receiver.ast;
    }

    if (
      innerReceiver instanceof PropertyRead ||
      innerReceiver instanceof SafePropertyRead ||
      innerReceiver instanceof KeyedRead ||
      innerReceiver instanceof SafeKeyedRead
    ) {
      if (innerReceiver.receiver) {
        this.visitPropertyChainReceiver(innerReceiver.receiver);
      }
    }
  }
}
