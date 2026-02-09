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
  BindingPipe,
  Call,
  Interpolation,
  KeyedRead,
  LiteralPrimitive,
  ParseSourceSpan,
  PropertyRead,
  RecursiveAstVisitor,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
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

// ============================================================================
// Expression Visitor (extends RecursiveAstVisitor for automatic dispatch)
// ============================================================================

/**
 * Expression-level visitor for selection range.
 *
 * Extends `RecursiveAstVisitor` so that all expression types (`Binary`,
 * `Conditional`, `BindingPipe`, `PrefixNot`, `Unary`, `Call`, `SafeCall`,
 * `LiteralArray`, `LiteralMap`, etc.) get automatic position-based recursion
 * via the centralized `visit()` override.
 *
 * Only overrides expression types that need special span-insertion behaviour:
 * property chains, string literal inner spans, template literal `${...}`,
 * and `Interpolation` dispatch.
 */
class SelectionRangeExpressionVisitor extends RecursiveAstVisitor {
  readonly path: PathEntry[] = [];

  constructor(private readonly position: number) {
    super();
  }

  // ------------------------------------------------------------------
  // Central dispatch – position filtering + path recording
  // ------------------------------------------------------------------

  override visit(ast: AST, context?: any): any {
    // Unwrap ASTWithSource first (like CombinedRecursiveAstVisitor)
    if (ast instanceof ASTWithSource) {
      const outerSpan = ast.sourceSpan;
      if (!isWithin(this.position, outerSpan)) return;
      this.path.push({node: ast, span: {start: outerSpan.start, end: outerSpan.end}});
      return this.visit(ast.ast, context);
    }

    const span = ast.sourceSpan;
    if (!isWithin(this.position, span)) return;

    // Skip zero-length spans (ImplicitReceiver, ThisReceiver, etc.)
    if (span.start !== span.end) {
      this.path.push({node: ast, span: {start: span.start, end: span.end}});
    }

    // Dispatch to visitBinary, visitCall, visitConditional, etc.
    // Each visit method calls this.visit() on children,
    // which re-enters this override for position checking.
    return ast.visit(this, context);
  }

  // ------------------------------------------------------------------
  // Special cases that need custom behaviour
  // ------------------------------------------------------------------

  /**
   * Property chains: add ALL ancestor receivers regardless of position.
   * For `user.address.city`, selecting near `city` yields:
   *   user → user.address → user.address.city
   */
  override visitPropertyRead(ast: PropertyRead, context: any): any {
    this.addPropertyChainReceiver(ast.receiver);
  }

  override visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    this.addPropertyChainReceiver(ast.receiver);
  }

  override visitKeyedRead(ast: KeyedRead, context: any): any {
    this.addPropertyChainReceiver(ast.receiver);
    this.visit(ast.key, context);
  }

  override visitSafeKeyedRead(ast: SafeKeyedRead, context: any): any {
    this.addPropertyChainReceiver(ast.receiver);
    this.visit(ast.key, context);
  }

  /**
   * Pipes: add intermediate span for pipe name + args.
   * For `now() | date:'short'`, produces:
   *   short → 'short' → date:'short' → now() | date:'short'
   *
   * For multiple args like `date:'short':'pl'`:
   *   pl → 'pl' → date:'short':'pl' → now() | date:'short':'pl'
   */
  override visitPipe(ast: BindingPipe, context: any): any {
    // Compute the pipe name (+ args) region span: `date:'short'`
    const pipeNameStart = ast.nameSpan.start;
    const lastArgEnd =
      ast.args.length > 0
        ? ast.args[ast.args.length - 1].sourceSpan.end
        : ast.nameSpan.end;

    // Only add intermediate spans if cursor is within the pipe name + args region
    if (this.position >= pipeNameStart && this.position <= lastArgEnd) {
      // Add full pipe-region span: `date:'short'` (only if different from just the name)
      if (lastArgEnd > ast.nameSpan.end) {
        this.path.push({node: null, span: {start: pipeNameStart, end: lastArgEnd}});
      }
      // Add pipe name span: `date` — only if cursor is actually on the pipe name
      if (
        ast.nameSpan.end > ast.nameSpan.start &&
        this.position >= ast.nameSpan.start &&
        this.position <= ast.nameSpan.end
      ) {
        this.path.push({
          node: null,
          span: {start: ast.nameSpan.start, end: ast.nameSpan.end},
        });
      }
    }

    // Continue recursion into exp and args
    this.visit(ast.exp, context);
    this.visitAll(ast.args, context);
  }

  /**
   * Calls: add intermediate span for arguments list.
   * For `fn(a, b, c)`, produces: b → a, b, c → fn(a, b, c)
   * Matches TypeScript's smart selection behaviour.
   */
  override visitCall(ast: Call, context: any): any {
    this.addCallArgumentsSpan(ast);
    this.visit(ast.receiver, context);
    this.visitAll(ast.args, context);
  }

  override visitSafeCall(ast: SafeCall, context: any): any {
    this.addCallArgumentsSpan(ast);
    this.visit(ast.receiver, context);
    this.visitAll(ast.args, context);
  }

  private addCallArgumentsSpan(ast: Call | SafeCall): void {
    if (ast.args.length > 0) {
      const argSpan = ast.argumentSpan;
      if (
        argSpan.end > argSpan.start &&
        this.position >= argSpan.start &&
        this.position <= argSpan.end
      ) {
        this.path.push({node: null, span: {start: argSpan.start, end: argSpan.end}});
      }
    }
  }

  /**
   * String literals: add inner span (without quotes).
   * For `'hello'`, produces: `hello` → `'hello'`
   */
  override visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any {
    if (typeof ast.value === 'string') {
      const span = ast.sourceSpan;
      if (span.end - span.start >= 2) {
        this.path.push({
          node: null,
          span: {start: span.start + 1, end: span.end - 1},
        });
      }
    }
  }

  /**
   * Template literals: add `${...}` wrapper spans around the active expression.
   */
  override visitTemplateLiteral(ast: TemplateLiteral, context: any): any {
    for (let i = 0; i < ast.expressions.length; i++) {
      const expr = ast.expressions[i];
      if (isWithin(this.position, expr.sourceSpan)) {
        // Compute ${...} wrapper span using element boundaries
        let templateExprStart = expr.sourceSpan.start - 2; // `${`
        let templateExprEnd = expr.sourceSpan.end + 1; // `}`
        if (ast.elements[i]) {
          templateExprStart = ast.elements[i].sourceSpan.end;
        }
        if (ast.elements[i + 1]) {
          templateExprEnd = ast.elements[i + 1].sourceSpan.start;
        }
        this.path.push({node: null, span: {start: templateExprStart, end: templateExprEnd}});
        this.visit(expr, context);
        break;
      }
    }
  }

  /**
   * Interpolation: find and visit the specific expression containing position.
   */
  override visitInterpolation(ast: Interpolation, context: any): any {
    for (const expr of ast.expressions) {
      if (isWithin(this.position, expr.sourceSpan)) {
        this.visit(expr, context);
        break;
      }
    }
  }

  // ------------------------------------------------------------------
  // Helper: build property / keyed-access chain path
  // ------------------------------------------------------------------

  private addPropertyChainReceiver(receiver: AST): void {
    const span = receiver.sourceSpan;
    if (span.start === span.end) return; // Skip ImplicitReceiver / ThisReceiver

    this.path.push({node: receiver, span: {start: span.start, end: span.end}});

    let inner = receiver instanceof ASTWithSource ? receiver.ast : receiver;
    if (
      inner instanceof PropertyRead ||
      inner instanceof SafePropertyRead ||
      inner instanceof KeyedRead ||
      inner instanceof SafeKeyedRead
    ) {
      this.addPropertyChainReceiver(inner.receiver);
    }
  }
}

// ============================================================================
// Template Visitor (custom TmplAstVisitor with position snapping & siblings)
// ============================================================================

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

  /**
   * Delegate expression traversal to `SelectionRangeExpressionVisitor`,
   * which extends `RecursiveAstVisitor` for automatic dispatch of all
   * expression types with centralized position filtering.
   */
  private visitExpression(ast: AST): void {
    const exprVisitor = new SelectionRangeExpressionVisitor(this.position);
    exprVisitor.visit(ast);
    this.path.push(...exprVisitor.path);
  }
}
