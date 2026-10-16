/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  outputAst as o,
  AbstractEmitterVisitor,
  EmitterVisitorContext,
  ParseSourceSpan,
} from '@angular/compiler';
import {validateAndRewriteCoreSymbol} from '@angular/compiler-cli/private/hybrid_analysis';
import type {SpanMetadata} from './types.js';

/** A location in a source file that some printed text originates from. */
export interface PrintedMapping {
  /** Offset within the printed text. */
  offset: number;
  /** URL of the source file, as recorded on the output AST's `ParseSourceSpan`. */
  source: string;
  /** Content of the source file, when the span carries it. */
  sourceContent: string | null;
  /** Offset into the source file. */
  sourceOffset: number;
  /** Zero-based line in the source file. */
  line: number;
  /** Zero-based column in the source file. */
  column: number;
}

/** Text produced by the printer, along with the source locations it maps back to. */
export interface PrintedSnippet {
  text: string;
  mappings: PrintedMapping[];
}

const CORE_MODULE = '@angular/core';

const NUMERIC_OPERATORS = new Set([
  o.BinaryOperator.Bigger,
  o.BinaryOperator.BiggerEquals,
  o.BinaryOperator.Lower,
  o.BinaryOperator.LowerEquals,
  o.BinaryOperator.Minus,
  o.BinaryOperator.Multiply,
  o.BinaryOperator.Divide,
  o.BinaryOperator.Modulo,
  o.BinaryOperator.Exponentiation,
]);

const EQUALITY_OPERATORS = new Set([
  o.BinaryOperator.Equals,
  o.BinaryOperator.NotEquals,
  o.BinaryOperator.Identical,
  o.BinaryOperator.NotIdentical,
]);

function isNeverNullish(expression: o.Expression): boolean {
  if (expression instanceof o.ParenthesizedExpr) {
    return isNeverNullish(expression.expr);
  }
  if (expression instanceof o.BinaryOperatorExpr) {
    return (
      expression.operator !== o.BinaryOperator.And &&
      expression.operator !== o.BinaryOperator.Or &&
      expression.operator !== o.BinaryOperator.NullishCoalesce
    );
  }
  return (
    expression instanceof o.NotExpr ||
    expression instanceof o.UnaryOperatorExpr ||
    expression instanceof o.LiteralExpr
  );
}

function isNonBooleanLiteral(expression: o.Expression): boolean {
  return expression instanceof o.LiteralExpr && typeof expression.value !== 'boolean';
}

function binaryNeedsTsIgnore(expression: o.BinaryOperatorExpr): boolean {
  if (expression.operator === o.BinaryOperator.NullishCoalesce) {
    return isNeverNullish(expression.lhs);
  }
  if (NUMERIC_OPERATORS.has(expression.operator)) {
    return expression.lhs instanceof o.NotExpr || expression.rhs instanceof o.NotExpr;
  }
  if (EQUALITY_OPERATORS.has(expression.operator)) {
    return (
      (expression.lhs instanceof o.NotExpr && isNonBooleanLiteral(expression.rhs)) ||
      (expression.rhs instanceof o.NotExpr && isNonBooleanLiteral(expression.lhs))
    );
  }
  return false;
}

export class RawSource {
  constructor(
    public readonly source: string,
    public readonly spans: readonly SpanMetadata[] = [],
  ) {}
}

export class ExpressionPrinter {
  private moduleToNamespace = new Map<string, string>();
  private existingNamespaces = new Set<string>();
  /**
   * Modules to emit as bare `import '<specifier>';` statements. Used by local compilation mode
   * to preserve the module-graph edges that the optimized pipeline expresses through the
   * component's static dependency list (ngtsc's `LocalCompilationExtraImportsTracker`).
   */
  private sideEffectImports = new Set<string>();
  private usedNamespaces = new Set<string>();
  private generatedNamespaceCount = 0;
  readonly emitTypes: boolean;
  private readonly exprVisitor: EmitterVisitor;
  private readonly typeVisitor: EmitterVisitor;
  /** Printed snippets that carry source mappings and haven't been claimed by an insertion yet. */
  private pendingSnippets: PrintedSnippet[] = [];

  constructor(
    filePath: string,
    private readonly r3SymbolsSpecifier: string | null = null,
  ) {
    this.emitTypes = filePath.endsWith('.ts') || filePath.endsWith('.mts');
    this.moduleToNamespace.set(CORE_MODULE, 'i0');
    this.generatedNamespaceCount = 1;
    this.exprVisitor = new EmitterVisitor(this);
    this.typeVisitor = new EmitterVisitor(this, true);
  }

  print(expr: o.Expression): string {
    const context = new MappingContext();
    expr.visitExpression(this.exprVisitor, context);
    return this.finishPrint(context);
  }

  printStatement(stmt: o.Statement): string {
    const context = new MappingContext();
    stmt.visitStatement(this.exprVisitor, context);
    return this.finishPrint(context);
  }

  printType(type: o.Type): string {
    const context = EmitterVisitorContext.createRoot();
    this.typeVisitor.withSuppressedColon(() => {
      type.visitType(this.typeVisitor, context);
    });
    return context.toSource();
  }

  /**
   * Returns the snippets printed since the last call that carry source mappings. Callers that
   * splice printed text into the output use this to attach the mappings to the output's map.
   */
  takePendingSnippets(): PrintedSnippet[] {
    const snippets = this.pendingSnippets;
    this.pendingSnippets = [];
    return snippets;
  }

  private finishPrint(context: MappingContext): string {
    const text = context.toSource();
    const mappings = context.finish(text);
    if (mappings.length > 0) {
      this.pendingSnippets.push({text, mappings});
    }
    return text;
  }

  getOrCreateNamespace(moduleName: string): string {
    this.usedNamespaces.add(moduleName);
    if (this.moduleToNamespace.has(moduleName)) {
      return this.moduleToNamespace.get(moduleName)!;
    }
    const namespace = `i${this.generatedNamespaceCount++}`;
    this.moduleToNamespace.set(moduleName, namespace);
    return namespace;
  }

  rewriteSymbol(symbolName: string, moduleName: string): string {
    if (this.r3SymbolsSpecifier === null || moduleName !== CORE_MODULE) {
      return symbolName;
    }
    return validateAndRewriteCoreSymbol(symbolName);
  }

  private rewriteSpecifier(moduleName: string): string {
    if (this.r3SymbolsSpecifier === null || moduleName !== CORE_MODULE) {
      return moduleName;
    }
    return this.r3SymbolsSpecifier;
  }

  addNamespaceImport(moduleSpecifier: string, namespaceAlias: string): void {
    // A pre-existing namespace import of `r3_symbols.ts` is this file's `@angular/core` import,
    // already rewritten; register it under the module name requests arrive with.
    const moduleName =
      this.r3SymbolsSpecifier !== null && moduleSpecifier === this.r3SymbolsSpecifier
        ? CORE_MODULE
        : moduleSpecifier;
    this.moduleToNamespace.set(moduleName, namespaceAlias);
    this.existingNamespaces.add(moduleName);
  }

  addSideEffectImport(moduleSpecifier: string): void {
    this.sideEffectImports.add(moduleSpecifier);
  }

  getImportStatements(): string | null {
    const statements: string[] = [];

    for (const [moduleName, namespace] of this.moduleToNamespace) {
      // Avoid changing files that do not use Angular.
      if (!this.usedNamespaces.has(moduleName)) {
        continue;
      }

      if (!this.existingNamespaces.has(moduleName)) {
        const specifier = this.rewriteSpecifier(moduleName);
        statements.push(`// @ts-ignore\nimport * as ${namespace} from '${specifier}';`);
      }
    }

    for (const moduleName of this.sideEffectImports) {
      // A module already bound as a namespace import (generated or pre-existing) carries the
      // same edge, so a bare import on top of it would be redundant.
      if (this.usedNamespaces.has(moduleName) || this.existingNamespaces.has(moduleName)) {
        continue;
      }

      statements.push(`// @ts-ignore\nimport '${this.rewriteSpecifier(moduleName)}';`);
    }

    return statements.length > 0 ? statements.join('\n') : null;
  }

  reset(): void {
    this.moduleToNamespace.clear();
    this.existingNamespaces.clear();
    this.sideEffectImports.clear();
    this.usedNamespaces.clear();
    this.generatedNamespaceCount = 1;
    this.moduleToNamespace.set(CORE_MODULE, 'i0');
  }
}

/**
 * An `EmitterVisitorContext` that records source-map points for the printed text.
 *
 * The points follow what a TypeScript emit of ngtsc's output produces, so that the source maps of
 * both compilers line up: only the nodes ngtsc's translator gives a source-map range to (see
 * `ExpressionTranslatorVisitor`) produce a mapping, at the position where the node starts and
 * again where it ends. Text printed by nodes without a range inherits the mapping in effect.
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/translator/src/translator.ts
 */
class MappingContext extends EmitterVisitorContext {
  /** Index of the line the next part is printed on. */
  private line = 0;
  /** Column the next part is printed at, once the current line has a part. */
  private column = 0;
  /** The span text is currently attributed to, or `null` before the first ranged node. */
  private current: ParseSourceSpan | null = null;
  /** Whether a ranged node just started or ended, so the next part printed records a point. */
  private needsPoint = false;
  /**
   * Set by a ranged node whose immediate child must not record its own range, matching the
   * translator overriding the child's range (literal array entries, `$localize` placeholders).
   */
  private suppressNextSpan = false;
  /** Leading comments are emitted before a node's start mapping, so they don't record points. */
  private inComment = false;
  private readonly points: Array<{line: number; column: number; span: ParseSourceSpan}> = [];

  constructor() {
    super(0);
  }

  override print(
    from: {sourceSpan?: ParseSourceSpan | null} | null,
    part: string,
    newLine: boolean = false,
  ): void {
    // An empty line is indented when its first part is printed.
    const column = this.lineIsEmpty() ? this.lineLength() : this.column;
    if (part.length > 0 && !this.inComment) {
      // Once a child prints something, it is no longer the "immediate child" to suppress.
      this.suppressNextSpan = false;
      if (this.current !== null && this.needsPoint) {
        this.record(this.current, this.line, column);
      }
    }
    super.print(from, part, newLine);
    // Parts can span lines, e.g. multi-line JSDoc comments.
    const lastNewline = part.lastIndexOf('\n');
    if (lastNewline === -1) {
      this.column = column + part.length;
    } else {
      for (let i = part.indexOf('\n'); i !== -1; i = part.indexOf('\n', i + 1)) {
        this.line++;
      }
      this.column = part.length - lastNewline - 1;
    }
    if (newLine) {
      this.line++;
    }
  }

  override removeEmptyLastLine(): void {
    if (this.lineIsEmpty()) {
      this.line--;
    }
    super.removeEmptyLastLine();
  }

  override addUniqueSingleLineComment(commentText: string): void {
    const linesBefore = this.lineCount();
    super.addUniqueSingleLineComment(commentText);
    if (this.lineCount() !== linesBefore) {
      // The comment was inserted on its own line before the current one, pushing it down.
      for (const point of this.points) {
        if (point.line >= this.line) {
          point.line++;
        }
      }
      this.line++;
    }
  }

  /** Runs `fn` while printing a node that gets a source-map range of `span`. */
  withSpan(span: ParseSourceSpan | null, fn: () => void, suppressChildSpan = false): void {
    if (this.suppressNextSpan) {
      this.suppressNextSpan = false;
      span = null;
    }
    if (span === null || !span.start.file.url) {
      fn();
      return;
    }
    this.current = span;
    this.needsPoint = true;
    this.suppressNextSpan = suppressChildSpan;
    try {
      fn();
    } finally {
      this.suppressNextSpan = false;
      // Anything printed after the node maps to its end, until the next ranged node starts.
      this.current = new ParseSourceSpan(span.end, span.end);
      this.needsPoint = true;
    }
  }

  /** Runs `fn` while printing leading comments, which precede a node's start mapping. */
  withComments(fn: () => void): void {
    const previous = this.inComment;
    this.inComment = true;
    try {
      fn();
    } finally {
      this.inComment = previous;
    }
  }

  /** Resolves the recorded points into offsets within the final printed `text`. */
  finish(text: string): PrintedMapping[] {
    const lineStarts = [0];
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 10 /* \n */) {
        lineStarts.push(i + 1);
      }
    }
    const mappings: PrintedMapping[] = [];
    for (const {line, column, span} of this.points) {
      if (line >= lineStarts.length) {
        continue;
      }
      mappings.push(toPrintedMapping(lineStarts[line] + column, span));
    }
    // The end of the last ranged node, if nothing was printed after it.
    if (this.current !== null && this.needsPoint) {
      mappings.push(toPrintedMapping(text.length, this.current));
    }
    return mappings;
  }

  private record(span: ParseSourceSpan, line: number, column: number): void {
    const last = this.points[this.points.length - 1];
    if (last !== undefined && last.line === line && last.column === column) {
      // Several nodes starting at the same position: the innermost one wins, as in TypeScript.
      last.span = span;
    } else {
      this.points.push({line, column, span});
    }
    this.needsPoint = false;
  }

  private lineCount(): number {
    return this.lines.length;
  }
}

function toPrintedMapping(offset: number, span: ParseSourceSpan): PrintedMapping {
  const {file, offset: sourceOffset, line, col} = span.start;
  return {
    offset,
    source: file.url,
    sourceContent: file.content || null,
    sourceOffset,
    line,
    column: col,
  };
}

function withSpan(
  ctx: EmitterVisitorContext,
  span: ParseSourceSpan | null,
  fn: () => void,
  suppressChildSpan = false,
): void {
  if (ctx instanceof MappingContext) {
    ctx.withSpan(span, fn, suppressChildSpan);
  } else {
    fn();
  }
}

class EmitterVisitor extends AbstractEmitterVisitor {
  suppressLeadingColon = false;

  constructor(
    private printer: ExpressionPrinter,
    forcePrintTypes = false,
  ) {
    super(true /* printComments */, printer.emitTypes || forcePrintTypes);
  }

  withSuppressedColon(fn: () => void): void {
    const previous = this.suppressLeadingColon;
    this.suppressLeadingColon = true;
    try {
      fn();
    } finally {
      this.suppressLeadingColon = previous;
    }
  }

  override visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: EmitterVisitorContext): void {
    super.visitBinaryOperatorExpr(ast, ctx);

    // We have some internal users who had expressions like `!a > 1` or `'str' + something ?? 'foo'`
    // which normally get flagged by TS as errors, however due to our aggressive parenthesizing
    // in TCBs were not being flagged. This logic adds a `ts-ignore` if we detect cases like that,
    // because we emit expressions in runtime code (more or less) as they were written.
    if (this.printTypes && binaryNeedsTsIgnore(ast)) {
      ctx.addUniqueSingleLineComment(' @ts-ignore');
    }
  }

  // The nodes below are the ones ngtsc's translator attaches a source-map range to. Keep this
  // list in sync with `ExpressionTranslatorVisitor`.

  override visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, ast.sourceSpan, () => super.visitReadVarExpr(ast, ctx));
  }

  override visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, expr.sourceSpan, () => super.visitInvokeFunctionExpr(expr, ctx));
  }

  override visitTaggedTemplateLiteralExpr(
    expr: o.TaggedTemplateLiteralExpr,
    ctx: EmitterVisitorContext,
  ): void {
    withSpan(ctx, expr.sourceSpan, () => super.visitTaggedTemplateLiteralExpr(expr, ctx));
  }

  override visitTemplateLiteralExpr(expr: o.TemplateLiteralExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, expr.sourceSpan ?? expr.elements[0]?.sourceSpan ?? null, () =>
      super.visitTemplateLiteralExpr(expr, ctx),
    );
  }

  override visitTemplateLiteralElementExpr(
    expr: o.TemplateLiteralElementExpr,
    ctx: EmitterVisitorContext,
  ): void {
    withSpan(ctx, expr.sourceSpan, () => super.visitTemplateLiteralElementExpr(expr, ctx));
  }

  override visitLiteralExpr(ast: o.LiteralExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, ast.sourceSpan, () => super.visitLiteralExpr(ast, ctx));
  }

  override visitRegularExpressionLiteral(
    ast: o.RegularExpressionLiteralExpr,
    ctx: EmitterVisitorContext,
  ): void {
    withSpan(ctx, ast.sourceSpan, () => super.visitRegularExpressionLiteral(ast, ctx));
  }

  override visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, ast.sourceSpan, () => super.visitLiteralMapExpr(ast, ctx));
  }

  override visitSpreadElementExpr(ast: o.SpreadElementExpr, ctx: EmitterVisitorContext): void {
    withSpan(ctx, ast.sourceSpan, () => super.visitSpreadElementExpr(ast, ctx));
  }

  protected override printLeadingComments(
    node: {leadingComments?: o.LeadingComment[]; sourceSpan?: ParseSourceSpan | null},
    ctx: EmitterVisitorContext,
  ): void {
    if (ctx instanceof MappingContext) {
      ctx.withComments(() => super.printLeadingComments(node, ctx));
    } else {
      super.printLeadingComments(node, ctx);
    }
  }

  override visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): void {
    const moduleName = ast.value.moduleName;
    const symbolName = ast.value.name;

    if (moduleName) {
      const namespace = this.printer.getOrCreateNamespace(moduleName);
      // `name` is `null` when the module itself is referenced (e.g. the namespaces an HMR
      // initializer captures).
      ctx.print(
        ast,
        symbolName == null
          ? namespace
          : `${namespace}.${this.printer.rewriteSymbol(symbolName, moduleName)}`,
      );
    } else {
      ctx.print(ast, symbolName || '');
    }

    if (this.printTypes && ast.typeParams && ast.typeParams.length > 0) {
      const typeParams = ast.typeParams;
      ctx.print(ast, '<');
      this.withSuppressedColon(() => {
        this.visitAllObjects((param) => param.visitType(this, ctx), typeParams, ctx, ', ');
      });
      ctx.print(ast, '>');
    }
  }

  override visitReadPropExpr(ast: o.ReadPropExpr, ctx: EmitterVisitorContext): void {
    // Add a `ts-ignore` since `import.meta` is only valid when es2020 is enabled.
    if (
      this.printTypes &&
      ast.name === 'meta' &&
      ast.receiver instanceof o.ReadVarExpr &&
      ast.receiver.name === 'import'
    ) {
      ctx.addUniqueSingleLineComment(' @ts-ignore');
    }
    super.visitReadPropExpr(ast, ctx);
  }

  override visitDynamicImportExpr(ast: o.DynamicImportExpr, ctx: EmitterVisitorContext): void {
    if (ast.urlComment == null) {
      super.visitDynamicImportExpr(ast, ctx);
      return;
    }

    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `import(/* ${ast.urlComment} */ `);

    const url = typeof ast.url === 'string' ? o.literal(ast.url) : ast.url;
    url.visitExpression(this, ctx);

    ctx.print(ast, `)`);
  }

  override visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): void {
    // Ranges follow the translator: the tagged template gets the message's span, the template
    // literal the head part's span, each middle/tail part its own span (its node starts at the
    // `}` closing the placeholder) and each placeholder expression the placeholder's span.
    withSpan(ctx, ast.sourceSpan, () => {
      this.printLeadingComments(ast, ctx);
      ctx.print(ast, '$localize ');
      const head = ast.serializeI18nHead();
      const count = ast.expressions.length;
      withSpan(ctx, head.range, () => {
        ctx.print(ast, '`' + head.raw + (count > 0 ? '${' : '`'));
        for (let i = 0; i < count; i++) {
          const expr = ast.expressions[i] || o.literal('');
          withSpan(
            ctx,
            ast.getPlaceholderSourceSpan(i),
            () => expr.visitExpression(this, ctx),
            /* suppressChildSpan */ true,
          );
          const part = ast.serializeI18nTemplatePart(i + 1);
          withSpan(ctx, part.range, () => {
            ctx.print(ast, '}' + part.raw + (i < count - 1 ? '${' : '`'));
          });
        }
      });
    });
  }

  override visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, '[');
    for (let i = 0; i < ast.entries.length; i++) {
      const entry = ast.entries[i];
      const hasLeadingComments =
        entry.leadingComments !== undefined && entry.leadingComments.length > 0;
      if (i > 0) {
        ctx.print(ast, ',', hasLeadingComments);
        if (!hasLeadingComments) {
          ctx.print(ast, ' ');
        }
      } else if (hasLeadingComments) {
        // First entry: break after `[` so the comment isn't inlined with the entry.
        ctx.println(ast);
      }
      // The translator maps each entry to the array's span, in place of the entry's own range.
      withSpan(
        ctx,
        ast.sourceSpan,
        () => entry.visitExpression(this, ctx),
        /* suppressChildSpan */ true,
      );
    }
    ctx.print(ast, ']');
  }

  override visitBuiltinType(type: o.BuiltinType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }
    if (type.name === o.BuiltinTypeName.Inferred) {
      return;
    }
    let typeStr = 'any';
    switch (type.name) {
      case o.BuiltinTypeName.Bool:
        typeStr = 'boolean';
        break;
      case o.BuiltinTypeName.Dynamic:
        typeStr = 'any';
        break;
      case o.BuiltinTypeName.Int:
      case o.BuiltinTypeName.Number:
        typeStr = 'number';
        break;
      case o.BuiltinTypeName.String:
        typeStr = 'string';
        break;
      case o.BuiltinTypeName.None:
        typeStr = 'never';
        break;
      case o.BuiltinTypeName.Function:
        typeStr = 'Function';
        break;
    }
    if (this.suppressLeadingColon) {
      ctx.print(null, typeStr);
    } else {
      ctx.print(null, `: ${typeStr}`);
    }
  }

  override visitExpressionType(type: o.ExpressionType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }
    if (!this.suppressLeadingColon) {
      ctx.print(null, ': ');
    }
    type.value.visitExpression(this, ctx);

    if (type.typeParams && type.typeParams.length > 0) {
      const typeParams = type.typeParams;
      ctx.print(null, '<');
      this.withSuppressedColon(() => {
        this.visitAllObjects((param) => param.visitType(this, ctx), typeParams, ctx, ', ');
      });
      ctx.print(null, '>');
    }
  }

  override visitArrayType(type: o.ArrayType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }
    if (!this.suppressLeadingColon) {
      ctx.print(null, ': ');
    }
    this.withSuppressedColon(() => {
      type.of.visitType(this, ctx);
    });
    ctx.print(null, '[]');
  }

  override visitMapType(type: o.MapType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }
    if (this.suppressLeadingColon) {
      ctx.print(null, '{ [key: string]: ');
    } else {
      ctx.print(null, ': { [key: string]: ');
    }
    this.withSuppressedColon(() => {
      if (type.valueType) {
        type.valueType.visitType(this, ctx);
      } else {
        ctx.print(null, 'unknown');
      }
    });
    ctx.print(null, '; }');
  }

  override visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): void {
    if (ast.node instanceof RawSource) {
      ctx.print(ast, ast.node.source);
    } else {
      throw new Error('Unsupported WrappedNodeExpr');
    }
  }

  override visitTransplantedType(): void {
    throw new Error('TransplantedType nodes are not supported');
  }

  protected override shouldParenthesize(
    expression: o.Expression,
    containingExpression: o.Expression,
  ): boolean {
    return (
      super.shouldParenthesize(expression, containingExpression) ||
      (containingExpression instanceof o.InvokeFunctionExpr &&
        expression instanceof o.WrappedNodeExpr &&
        expression.node instanceof RawSource &&
        expression.node.source.includes('=>'))
    );
  }
}
