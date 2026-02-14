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
  Binary,
  Conditional,
  Interpolation,
  NonNullAssert,
  parseTemplate,
  PrefixNot,
  PropertyRead,
  RecursiveAstVisitor,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
} from '@angular/compiler';

/**
 * Result of attempting to migrate a single template.
 */
export interface TemplateMigrationResult {
  /** The migrated template text (only meaningful if `fullyMigrated` is true). */
  migrated: string;
  /** Whether ALL `?.` expressions in this template were successfully handled. */
  fullyMigrated: boolean;
  /** Number of `?.` expressions converted to ternaries. */
  migratedCount: number;
  /** Number of `?.` expressions safely left as-is (null/undefined equivalent context). */
  safeAsIsCount: number;
  /** Number of `?.` expressions that could NOT be safely auto-migrated. */
  skippedCount: number;
  /** Whether the template had any `?.` expressions at all. */
  hasSafeNavigation: boolean;
}

/**
 * Context in which a safe navigation expression is used.
 * Determines whether null vs undefined semantics matter.
 */
enum SafeNavContext {
  /** The exact value (null vs undefined) matters — must be migrated. */
  Sensitive,
  /** null and undefined behave identically in this context — safe to leave as-is. */
  NullSafe,
}

/**
 * Information about a single safe navigation expression found in a template.
 */
interface SafeNavOccurrence {
  /** The AST node (SafePropertyRead, SafeKeyedRead, or SafeCall). */
  node: SafePropertyRead | SafeKeyedRead | SafeCall;
  /** Whether the expression is in a null-safe context. */
  context: SafeNavContext;
  /** Absolute source span start offset in the template string. */
  start: number;
  /** Absolute source span end offset in the template string. */
  end: number;
}

/**
 * Attempts to migrate ALL safe navigation expressions in a template using AST analysis.
 *
 * For each `?.` expression in the template:
 * 1. Parses the template using Angular's template parser to get proper AST nodes.
 * 2. Walks the AST to find all SafePropertyRead, SafeKeyedRead, SafeCall occurrences.
 * 3. Analyzes the parent expression context to determine if null/undefined are equivalent.
 * 4. For sensitive contexts with simple property chains, converts to ternary form.
 * 5. Otherwise marks as skipped (needs manual review).
 *
 * **Null-safe contexts (left as-is, no migration needed):**
 * - Standalone interpolation `{{ a?.b }}` — Angular renders null/undefined as ""
 * - `a?.b ?? 'fallback'` — `??` catches both null and undefined
 * - `a?.b || 'fallback'` — `||` treats both as falsy
 * - `a?.b && x` — both null/undefined are falsy, short-circuit the same
 * - `!a?.b` / `!!a?.b` — negation produces same boolean for both
 * - `a?.b ? x : y` — condition position, truthiness check
 * - `a?.b == null` / `a?.b != null` — loose equality matches both
 *
 * **Must be converted (sensitive contexts):**
 * - `'prefix' + a?.b` — string concat differs: "prefixnull" vs "prefixundefined"
 * - `a?.b === null` — strict equality: null===null is true, undefined===null is false
 *
 * **Why ternary (not `?? null`):**
 *   `a?.b?.c` where `c` is genuinely `undefined`:
 *   - `?? null` changes the real `undefined` to `null` — WRONG
 *   - Ternary replicates legacy compiler output exactly
 */
export function migrateTemplate(template: string): TemplateMigrationResult {
  // Quick check: does the template even contain `?.`?
  if (!template.includes('?.')) {
    return {
      migrated: template,
      fullyMigrated: true,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: false,
    };
  }

  // Parse the template using Angular's template parser
  const parsed = parseTemplate(template, 'migration.html', {});

  if (parsed.errors && parsed.errors.length > 0) {
    // If the template can't be parsed, we can't migrate it
    return {
      migrated: template,
      fullyMigrated: false,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: template.includes('?.'),
    };
  }

  // Walk the AST to find all safe navigation occurrences
  const collector = new SafeNavCollector();
  tmplAstVisitAll(collector, parsed.nodes);

  if (collector.occurrences.length === 0) {
    return {
      migrated: template,
      fullyMigrated: true,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: false,
    };
  }

  let migratedCount = 0;
  let safeAsIsCount = 0;
  let skippedCount = 0;
  let fullyMigrated = true;

  // Sort occurrences by position (descending) so we can apply replacements from end to start
  // without invalidating earlier positions
  const sorted = [...collector.occurrences].sort((a, b) => b.start - a.start);

  let result = template;

  for (const occ of sorted) {
    if (occ.context === SafeNavContext.NullSafe) {
      safeAsIsCount++;
      continue;
    }

    // Try to build ternary replacement for the outermost safe nav chain
    const ternary = tryBuildTernary(occ.node, template);
    if (ternary !== null) {
      migratedCount++;
      result = result.substring(0, occ.start) + ternary + result.substring(occ.end);
    } else {
      skippedCount++;
      fullyMigrated = false;
    }
  }

  return {
    migrated: fullyMigrated ? result : template,
    fullyMigrated,
    migratedCount,
    safeAsIsCount,
    skippedCount,
    hasSafeNavigation: true,
  };
}

/**
 * Best-effort mode. Falls back to `?? null` for expressions that can't be
 * safely converted to ternaries.
 *
 * **⚠️ DANGEROUS**: `?? null` can incorrectly convert genuinely `undefined`
 * runtime values to `null`. Similar to signal migration's `--best-effort-mode`.
 */
export function migrateTemplateBestEffort(template: string): TemplateMigrationResult {
  if (!template.includes('?.')) {
    return {
      migrated: template,
      fullyMigrated: true,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: false,
    };
  }

  const parsed = parseTemplate(template, 'migration.html', {});
  if (parsed.errors && parsed.errors.length > 0) {
    return {
      migrated: template,
      fullyMigrated: false,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: true,
    };
  }

  const collector = new SafeNavCollector();
  tmplAstVisitAll(collector, parsed.nodes);

  if (collector.occurrences.length === 0) {
    return {
      migrated: template,
      fullyMigrated: true,
      migratedCount: 0,
      safeAsIsCount: 0,
      skippedCount: 0,
      hasSafeNavigation: false,
    };
  }

  let migratedCount = 0;
  let safeAsIsCount = 0;
  let skippedCount = 0;

  const sorted = [...collector.occurrences].sort((a, b) => b.start - a.start);
  let result = template;

  for (const occ of sorted) {
    if (occ.context === SafeNavContext.NullSafe) {
      safeAsIsCount++;
      continue;
    }

    const ternary = tryBuildTernary(occ.node, template);
    if (ternary !== null) {
      migratedCount++;
      result = result.substring(0, occ.start) + ternary + result.substring(occ.end);
    } else {
      if (isImmediatelyFollowedByCall(occ.node, template)) {
        skippedCount++;
        continue;
      }
      // Best-effort: append ?? null to the original expression text
      const originalText = template.substring(occ.start, occ.end);
      migratedCount++;
      result =
        result.substring(0, occ.start) + originalText + ' ?? null' + result.substring(occ.end);
    }
  }

  return {
    migrated: result,
    fullyMigrated: skippedCount === 0,
    migratedCount,
    safeAsIsCount,
    skippedCount,
    hasSafeNavigation: true,
  };
}

/**
 * Template-level AST visitor that finds all expressions containing safe navigation
 * and determines the context of each occurrence.
 */
class SafeNavCollector extends TmplAstRecursiveVisitor {
  occurrences: SafeNavOccurrence[] = [];

  override visitBoundText(text: TmplAstBoundText): void {
    const expr = text.value;
    if (expr instanceof ASTWithSource) {
      this.analyzeExpression(expr.ast);
    } else {
      this.analyzeExpression(expr);
    }
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    const expr = attribute.value;
    if (expr instanceof ASTWithSource) {
      this.analyzeExpression(expr.ast);
    } else {
      this.analyzeExpression(expr);
    }
    super.visitBoundAttribute(attribute);
  }

  override visitBoundEvent(event: TmplAstBoundEvent): void {
    const expr = event.handler;
    if (expr instanceof ASTWithSource) {
      this.analyzeExpression(expr.ast);
    } else {
      this.analyzeExpression(expr);
    }
    super.visitBoundEvent(event);
  }

  private analyzeExpression(ast: AST): void {
    if (ast instanceof Interpolation) {
      // Each interpolation expression is analyzed independently
      for (const expr of ast.expressions) {
        this.analyzeExprForSafeNav(expr, SafeNavContext.NullSafe);
      }
    } else {
      this.analyzeExprForSafeNav(ast, SafeNavContext.Sensitive);
    }
  }

  /**
   * Walk an expression tree to find safe navigation nodes.
   * The `parentContext` indicates whether the parent makes null/undefined indistinguishable.
   */
  private analyzeExprForSafeNav(ast: AST, parentContext: SafeNavContext): void {
    const finder = new SafeNavExpressionFinder(parentContext);
    finder.visit(ast);
    // Only collect the outermost safe nav in each expression tree
    this.occurrences.push(...finder.occurrences);
  }
}

/**
 * Expression-level AST visitor that finds safe navigation nodes and determines their context.
 *
 * For chains like `a?.b?.c`, the AST is:
 *   SafePropertyRead('c', receiver: SafePropertyRead('b', receiver: ImplicitReceiver))
 * We only want to record the OUTERMOST safe read (the `c` node) because it represents
 * the entire chain. Inner safe reads are part of the same chain and should not be recorded
 * separately.
 */
class SafeNavExpressionFinder extends RecursiveAstVisitor {
  occurrences: SafeNavOccurrence[] = [];
  private contextStack: SafeNavContext[] = [];
  /**
   * Set of AST nodes that are receivers of a safe navigation node.
   * These should NOT be recorded as separate occurrences.
   */
  private receiverNodes = new Set<AST>();

  constructor(private rootContext: SafeNavContext) {
    super();
    this.contextStack.push(rootContext);
  }

  private get currentContext(): SafeNavContext {
    return this.contextStack[this.contextStack.length - 1];
  }

  /**
   * Mark all receiver nodes in a safe navigation chain so they won't be recorded.
   */
  private markReceiverChain(node: AST): void {
    if (
      node instanceof SafePropertyRead ||
      node instanceof SafeKeyedRead ||
      node instanceof SafeCall
    ) {
      this.receiverNodes.add(node);
      this.markReceiverChain(node.receiver);
    } else if (node instanceof PropertyRead) {
      this.markReceiverChain(node.receiver);
    } else if (node instanceof NonNullAssert) {
      this.markReceiverChain(node.expression);
    }
  }

  override visitSafePropertyRead(ast: SafePropertyRead, context?: any): any {
    // If this node is a receiver of a larger safe chain, skip it
    if (this.receiverNodes.has(ast)) {
      return;
    }
    // Mark all inner receivers so they won't be recorded separately
    this.markReceiverChain(ast.receiver);
    this.occurrences.push({
      node: ast,
      context: this.currentContext,
      start: ast.sourceSpan.start,
      end: ast.sourceSpan.end,
    });
    // Visit the receiver to find any independent safe nav in sub-expressions
    this.visit(ast.receiver, context);
  }

  override visitSafeKeyedRead(ast: SafeKeyedRead, context?: any): any {
    if (this.receiverNodes.has(ast)) {
      return;
    }
    this.markReceiverChain(ast.receiver);
    this.occurrences.push({
      node: ast,
      context: this.currentContext,
      start: ast.sourceSpan.start,
      end: ast.sourceSpan.end,
    });
    this.visit(ast.receiver, context);
    this.visit(ast.key, context);
  }

  override visitSafeCall(ast: SafeCall, context?: any): any {
    if (this.receiverNodes.has(ast)) {
      return;
    }
    this.markReceiverChain(ast.receiver);
    this.occurrences.push({
      node: ast,
      context: this.currentContext,
      start: ast.sourceSpan.start,
      end: ast.sourceSpan.end,
    });
    this.visit(ast.receiver, context);
    this.visitAll(ast.args, context);
  }

  override visitBinary(ast: Binary, context?: any): any {
    // Determine context for children based on operator
    const ctx = classifyBinaryContext(ast);
    this.contextStack.push(ctx);
    this.visit(ast.left, context);
    this.contextStack.pop();

    // Right side of binary is always sensitive (e.g. `x + a?.b`)
    this.contextStack.push(SafeNavContext.Sensitive);
    this.visit(ast.right, context);
    this.contextStack.pop();
  }

  override visitConditional(ast: Conditional, context?: any): any {
    // Condition position is null-safe (truthiness check)
    this.contextStack.push(SafeNavContext.NullSafe);
    this.visit(ast.condition, context);
    this.contextStack.pop();

    // Branches are sensitive
    this.contextStack.push(SafeNavContext.Sensitive);
    this.visit(ast.trueExp, context);
    this.visit(ast.falseExp, context);
    this.contextStack.pop();
  }

  override visitPrefixNot(ast: PrefixNot, context?: any): any {
    // !a?.b — negation makes null/undefined equivalent (both falsy → true)
    this.contextStack.push(SafeNavContext.NullSafe);
    this.visit(ast.expression, context);
    this.contextStack.pop();
  }

  override visitNonNullAssert(ast: NonNullAssert, context?: any): any {
    // a?.b! — non-null assertion doesn't change null/undefined equivalence
    this.visit(ast.expression, context);
  }
}

/**
 * Classify the context of the left side of a binary expression.
 */
function classifyBinaryContext(ast: Binary): SafeNavContext {
  switch (ast.operation) {
    case '&&':
    case '||':
      // Logical operators: both null and undefined are falsy
      return SafeNavContext.NullSafe;
    case '??':
      // Nullish coalescing: catches both null and undefined
      return SafeNavContext.NullSafe;
    case '==':
    case '!=':
      // Loose equality: null == undefined is true
      return SafeNavContext.NullSafe;
    case '===':
    case '!==':
      // Strict equality: null !== undefined
      return SafeNavContext.Sensitive;
    case '+':
      // String concatenation differs: "prefixnull" vs "prefixundefined"
      return SafeNavContext.Sensitive;
    default:
      return SafeNavContext.Sensitive;
  }
}

/**
 * Try to build a ternary replacement for a safe navigation expression.
 *
 * Converts `a?.b?.c` → `a != null ? (a.b != null ? a.b.c : null) : null`
 *
 * Returns null if the expression can't be safely converted (e.g., method calls,
 * keyed access, pipes).
 */
function tryBuildTernary(
  node: SafePropertyRead | SafeKeyedRead | SafeCall,
  template: string,
): string | null {
  // If the safe-navigation node is immediately called (e.g. `user?.getName()` where
  // the node span is `user?.getName` and the next token is `(`), replacing only the
  // node span would produce invalid output. Leave these for manual review.
  if (isImmediatelyFollowedByCall(node, template)) {
    return null;
  }

  // Only handle simple property chains for ternary conversion
  const chain = collectSafeChain(node);
  if (chain === null) {
    return null;
  }

  return buildTernaryFromChain(chain);
}

interface ChainSegment {
  name: string;
  safe: boolean;
}

/**
 * Collect a property chain from a safe navigation node.
 * Returns null if the chain contains method calls, keyed reads, or other complex expressions.
 */
function collectSafeChain(node: AST): ChainSegment[] | null {
  const segments: ChainSegment[] = [];
  let current: AST = node;

  while (true) {
    if (current instanceof SafePropertyRead) {
      segments.unshift({name: current.name, safe: true});
      current = current.receiver;
    } else if (current instanceof PropertyRead) {
      segments.unshift({name: current.name, safe: false});
      current = current.receiver;
    } else if (current instanceof NonNullAssert) {
      // a?.b!.c — skip the non-null assertion, take the inner expression
      current = current.expression;
    } else if (current instanceof SafeKeyedRead || current instanceof SafeCall) {
      // Can't convert keyed reads or calls to ternary
      return null;
    } else {
      // Should be the implicit receiver or a simple identifier
      break;
    }
  }

  if (segments.length < 2) {
    return null;
  }

  // Must have at least one safe segment
  if (!segments.some((s) => s.safe)) {
    return null;
  }

  return segments;
}

function buildTernaryFromChain(segments: ChainSegment[]): string {
  const safeIndices: number[] = [];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].safe) {
      safeIndices.push(i);
    }
  }

  function pathUpTo(endIdx: number): string {
    let path = segments[0].name;
    for (let i = 1; i <= endIdx; i++) {
      path += '.' + segments[i].name;
    }
    return path;
  }

  const fullPath = pathUpTo(segments.length - 1);
  let result = fullPath;

  for (let si = safeIndices.length - 1; si >= 0; si--) {
    const guard = pathUpTo(safeIndices[si] - 1);
    result = `${guard} != null ? ${result} : null`;
  }

  return result;
}

function isImmediatelyFollowedByCall(
  node: SafePropertyRead | SafeKeyedRead | SafeCall,
  template: string,
): boolean {
  let idx = node.sourceSpan.end;
  while (idx < template.length && /\s/.test(template[idx])) {
    idx++;
  }
  return template[idx] === '(';
}
