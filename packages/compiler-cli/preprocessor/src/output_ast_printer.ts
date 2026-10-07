/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {outputAst as o, AbstractEmitterVisitor, EmitterVisitorContext} from '@angular/compiler';

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
  constructor(public readonly source: string) {}
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

  constructor(filePath: string) {
    this.emitTypes = filePath.endsWith('.ts') || filePath.endsWith('.mts');
    this.moduleToNamespace.set('@angular/core', 'i0');
    this.generatedNamespaceCount = 1;
    this.exprVisitor = new EmitterVisitor(this);
    this.typeVisitor = new EmitterVisitor(this, true);
  }

  print(expr: o.Expression): string {
    const context = EmitterVisitorContext.createRoot();
    expr.visitExpression(this.exprVisitor, context);
    return context.toSource();
  }

  printStatement(stmt: o.Statement): string {
    const context = EmitterVisitorContext.createRoot();
    stmt.visitStatement(this.exprVisitor, context);
    return context.toSource();
  }

  printType(type: o.Type): string {
    const context = EmitterVisitorContext.createRoot();
    this.typeVisitor.withSuppressedColon(() => {
      type.visitType(this.typeVisitor, context);
    });
    return context.toSource();
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

  addNamespaceImport(moduleSpecifier: string, namespaceAlias: string): void {
    this.moduleToNamespace.set(moduleSpecifier, namespaceAlias);
    this.existingNamespaces.add(moduleSpecifier);
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
        statements.push(`// @ts-ignore\nimport * as ${namespace} from '${moduleName}';`);
      }
    }

    for (const moduleName of this.sideEffectImports) {
      // A module already bound as a namespace import (generated or pre-existing) carries the
      // same edge, so a bare import on top of it would be redundant.
      if (this.usedNamespaces.has(moduleName) || this.existingNamespaces.has(moduleName)) {
        continue;
      }

      statements.push(`// @ts-ignore\nimport '${moduleName}';`);
    }

    return statements.length > 0 ? statements.join('\n') : null;
  }

  reset(): void {
    this.moduleToNamespace.clear();
    this.existingNamespaces.clear();
    this.sideEffectImports.clear();
    this.usedNamespaces.clear();
    this.generatedNamespaceCount = 1;
    this.moduleToNamespace.set('@angular/core', 'i0');
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

  override visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): void {
    const moduleName = ast.value.moduleName;
    const symbolName = ast.value.name;

    if (moduleName) {
      const namespace = this.printer.getOrCreateNamespace(moduleName);
      ctx.print(ast, `${namespace}.${symbolName}`);
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

  override visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    const head = ast.serializeI18nHead();
    ctx.print(ast, '$localize `' + head.raw);
    for (let i = 0; i < ast.expressions.length; i++) {
      ctx.print(ast, '${');
      const expr = ast.expressions[i] || o.literal('');
      expr.visitExpression(this, ctx);
      ctx.print(ast, `}${ast.serializeI18nTemplatePart(i + 1).raw}`);
    }
    ctx.print(ast, '`');
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
      entry.visitExpression(this, ctx);
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
