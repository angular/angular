/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '../parse_util';

import * as o from './output_ast';
import {SourceMapGenerator} from './source_map';

const SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r/g;
const LEGAL_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
const INDENT_WITH = '  ';

class EmittedLine {
  partsLength = 0;
  readonly parts: string[] = [];
  readonly srcSpans: (ParseSourceSpan | null)[] = [];

  constructor(public indent: number) {}
}

const BINARY_OPERATORS = new Map([
  [o.BinaryOperator.And, '&&'],
  [o.BinaryOperator.Bigger, '>'],
  [o.BinaryOperator.BiggerEquals, '>='],
  [o.BinaryOperator.BitwiseOr, '|'],
  [o.BinaryOperator.BitwiseAnd, '&'],
  [o.BinaryOperator.Divide, '/'],
  [o.BinaryOperator.Assign, '='],
  [o.BinaryOperator.Equals, '=='],
  [o.BinaryOperator.Identical, '==='],
  [o.BinaryOperator.Lower, '<'],
  [o.BinaryOperator.LowerEquals, '<='],
  [o.BinaryOperator.Minus, '-'],
  [o.BinaryOperator.Modulo, '%'],
  [o.BinaryOperator.Exponentiation, '**'],
  [o.BinaryOperator.Multiply, '*'],
  [o.BinaryOperator.NotEquals, '!='],
  [o.BinaryOperator.NotIdentical, '!=='],
  [o.BinaryOperator.NullishCoalesce, '??'],
  [o.BinaryOperator.Or, '||'],
  [o.BinaryOperator.Plus, '+'],
  [o.BinaryOperator.In, 'in'],
  [o.BinaryOperator.InstanceOf, 'instanceof'],
  [o.BinaryOperator.AdditionAssignment, '+='],
  [o.BinaryOperator.SubtractionAssignment, '-='],
  [o.BinaryOperator.MultiplicationAssignment, '*='],
  [o.BinaryOperator.DivisionAssignment, '/='],
  [o.BinaryOperator.RemainderAssignment, '%='],
  [o.BinaryOperator.ExponentiationAssignment, '**='],
  [o.BinaryOperator.AndAssignment, '&&='],
  [o.BinaryOperator.OrAssignment, '||='],
  [o.BinaryOperator.NullishCoalesceAssignment, '??='],
]);

export class EmitterVisitorContext {
  static createRoot(): EmitterVisitorContext {
    return new EmitterVisitorContext(0);
  }

  private _lines: EmittedLine[];

  constructor(private _indent: number) {
    this._lines = [new EmittedLine(_indent)];
  }

  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  private get _currentLine(): EmittedLine {
    return this._lines[this._lines.length - 1];
  }

  println(from?: {sourceSpan: ParseSourceSpan | null} | null, lastPart: string = ''): void {
    this.print(from || null, lastPart, true);
  }

  lineIsEmpty(): boolean {
    return this._currentLine.parts.length === 0;
  }

  lineLength(): number {
    return this._currentLine.indent * INDENT_WITH.length + this._currentLine.partsLength;
  }

  print(from: {sourceSpan: ParseSourceSpan | null} | null, part: string, newLine: boolean = false) {
    if (part.length > 0) {
      this._currentLine.parts.push(part);
      this._currentLine.partsLength += part.length;
      this._currentLine.srcSpans.push((from && from.sourceSpan) || null);
    }
    if (newLine) {
      this._lines.push(new EmittedLine(this._indent));
    }
  }

  removeEmptyLastLine() {
    if (this.lineIsEmpty()) {
      this._lines.pop();
    }
  }

  incIndent() {
    this._indent++;
    if (this.lineIsEmpty()) {
      this._currentLine.indent = this._indent;
    }
  }

  decIndent() {
    this._indent--;
    if (this.lineIsEmpty()) {
      this._currentLine.indent = this._indent;
    }
  }

  toSource(): string {
    return this.sourceLines
      .map((l) => (l.parts.length > 0 ? INDENT_WITH.repeat(l.indent) + l.parts.join('') : ''))
      .join('\n');
  }

  toSourceMapGenerator(genFilePath: string, startsAtLine: number = 0): SourceMapGenerator {
    const map = new SourceMapGenerator(genFilePath);

    let firstOffsetMapped = false;
    const mapFirstOffsetIfNeeded = () => {
      if (!firstOffsetMapped) {
        // Add a single space so that tools won't try to load the file from disk.
        // Note: We are using virtual urls like `ng:///`, so we have to
        // provide a content here.
        map.addSource(genFilePath, ' ').addMapping(0, genFilePath, 0, 0);
        firstOffsetMapped = true;
      }
    };

    for (let i = 0; i < startsAtLine; i++) {
      map.addLine();
      mapFirstOffsetIfNeeded();
    }

    this.sourceLines.forEach((line, lineIdx) => {
      map.addLine();

      const spans = line.srcSpans;
      const parts = line.parts;
      let col0 = line.indent * INDENT_WITH.length;
      let spanIdx = 0;
      // skip leading parts without source spans
      while (spanIdx < spans.length && !spans[spanIdx]) {
        col0 += parts[spanIdx].length;
        spanIdx++;
      }
      if (spanIdx < spans.length && lineIdx === 0 && col0 === 0) {
        firstOffsetMapped = true;
      } else {
        mapFirstOffsetIfNeeded();
      }

      while (spanIdx < spans.length) {
        const span = spans[spanIdx]!;
        const source = span.start.file;
        const sourceLine = span.start.line;
        const sourceCol = span.start.col;
        map
          .addSource(source.url, source.content)
          .addMapping(col0, source.url, sourceLine, sourceCol);

        col0 += parts[spanIdx].length;
        spanIdx++;

        // assign parts without span or the same span to the previous segment
        while (spanIdx < spans.length && (span === spans[spanIdx] || !spans[spanIdx])) {
          col0 += parts[spanIdx].length;
          spanIdx++;
        }
      }
    });

    return map;
  }

  spanOf(line: number, column: number): ParseSourceSpan | null {
    const emittedLine = this._lines[line];
    if (emittedLine) {
      let columnsLeft = column - INDENT_WITH.repeat(emittedLine.indent).length;
      for (let partIndex = 0; partIndex < emittedLine.parts.length; partIndex++) {
        const part = emittedLine.parts[partIndex];
        if (part.length > columnsLeft) {
          return emittedLine.srcSpans[partIndex];
        }
        columnsLeft -= part.length;
      }
    }
    return null;
  }

  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  private get sourceLines(): EmittedLine[] {
    if (this._lines.length && this._lines[this._lines.length - 1].parts.length === 0) {
      return this._lines.slice(0, -1);
    }
    return this._lines;
  }
}

export abstract class AbstractEmitterVisitor
  implements o.StatementVisitor, o.ExpressionVisitor, o.TypeVisitor
{
  private lastIfCondition: o.Expression | null = null;

  constructor(
    protected readonly printComments: boolean,
    protected readonly printTypes: boolean,
  ) {}

  abstract visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): void;
  abstract visitWrappedNodeExpr(ast: o.WrappedNodeExpr<unknown>, ctx: EmitterVisitorContext): void;

  visitExpressionStmt(stmt: o.ExpressionStatement, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(stmt, ctx);
    stmt.expr.visitExpression(this, ctx);
    ctx.println(stmt, ';');
  }

  visitReturnStmt(stmt: o.ReturnStatement, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(stmt, ctx);
    ctx.print(stmt, `return `);
    stmt.value.visitExpression(this, ctx);
    ctx.println(stmt, ';');
  }

  visitIfStmt(stmt: o.IfStmt, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(stmt, ctx);
    ctx.print(stmt, `if (`);
    this.lastIfCondition = stmt.condition; // We can skip redundant parentheses for the condition.
    stmt.condition.visitExpression(this, ctx);
    this.lastIfCondition = null;
    ctx.print(stmt, `) {`);
    const hasElseCase = stmt.falseCase != null && stmt.falseCase.length > 0;
    if (stmt.trueCase.length <= 1 && !hasElseCase) {
      ctx.print(stmt, ` `);
      this.visitAllStatements(stmt.trueCase, ctx);
      ctx.removeEmptyLastLine();
      ctx.print(stmt, ` `);
    } else {
      ctx.println();
      ctx.incIndent();
      this.visitAllStatements(stmt.trueCase, ctx);
      ctx.decIndent();
      if (hasElseCase) {
        ctx.println(stmt, `} else {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.falseCase, ctx);
        ctx.decIndent();
      }
    }
    ctx.println(stmt, `}`);
  }

  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): void {
    const varKind = stmt.hasModifier(o.StmtModifier.Final) ? 'const' : 'let';

    this.printLeadingComments(stmt, ctx);
    ctx.print(stmt, `${varKind} ${stmt.name}`);
    stmt.type?.visitType(this, ctx);

    if (stmt.value) {
      ctx.print(stmt, ' = ');
      stmt.value.visitExpression(this, ctx);
    }

    ctx.println(stmt, `;`);
  }

  visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(expr, ctx);

    const shouldParenthesize = this.shouldParenthesize(expr.fn, expr);

    if (shouldParenthesize) {
      ctx.print(expr.fn, '(');
    }
    expr.fn.visitExpression(this, ctx);
    if (shouldParenthesize) {
      ctx.print(expr.fn, ')');
    }
    ctx.print(expr, `(`);
    this.visitAllExpressions(expr.args, ctx, ',');
    ctx.print(expr, `)`);
  }

  visitTaggedTemplateLiteralExpr(
    expr: o.TaggedTemplateLiteralExpr,
    ctx: EmitterVisitorContext,
  ): void {
    this.printLeadingComments(expr, ctx);
    expr.tag.visitExpression(this, ctx);
    expr.template.visitExpression(this, ctx);
  }

  visitTemplateLiteralExpr(expr: o.TemplateLiteralExpr, ctx: EmitterVisitorContext) {
    this.printLeadingComments(expr, ctx);
    ctx.print(expr, '`');
    for (let i = 0; i < expr.elements.length; i++) {
      expr.elements[i].visitExpression(this, ctx);
      const expression = i < expr.expressions.length ? expr.expressions[i] : null;
      if (expression !== null) {
        ctx.print(expression, '${');
        expression.visitExpression(this, ctx);
        ctx.print(expression, '}');
      }
    }
    ctx.print(expr, '`');
  }

  visitTemplateLiteralElementExpr(expr: o.TemplateLiteralElementExpr, ctx: EmitterVisitorContext) {
    this.printLeadingComments(expr, ctx);
    ctx.print(expr, expr.rawText);
  }

  visitTypeofExpr(expr: o.TypeofExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(expr, ctx);
    ctx.print(expr, 'typeof ');
    expr.expr.visitExpression(this, ctx);
  }

  visitVoidExpr(expr: o.VoidExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(expr, ctx);
    ctx.print(expr, 'void ');
    expr.expr.visitExpression(this, ctx);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, ast.name);
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `new `);
    ast.classExpr.visitExpression(this, ctx);
    ctx.print(ast, `(`);
    this.visitAllExpressions(ast.args, ctx, ',');
    ctx.print(ast, `)`);
  }

  visitLiteralExpr(ast: o.LiteralExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    const value = ast.value;
    if (typeof value === 'string') {
      ctx.print(ast, escapeIdentifier(value)!);
    } else {
      ctx.print(ast, `${value}`);
    }
  }

  visitRegularExpressionLiteral(
    ast: o.RegularExpressionLiteralExpr,
    ctx: EmitterVisitorContext,
  ): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `/${ast.body}/${ast.flags || ''}`);
  }

  visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    const head = ast.serializeI18nHead();
    ctx.print(ast, '$localize `' + head.raw);
    for (let i = 1; i < ast.messageParts.length; i++) {
      ctx.print(ast, '${');
      ast.expressions[i - 1].visitExpression(this, ctx);
      ctx.print(ast, `}${ast.serializeI18nTemplatePart(i).raw}`);
    }
    ctx.print(ast, '`');
  }

  visitConditionalExpr(ast: o.ConditionalExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `(`);
    ast.condition.visitExpression(this, ctx);
    ctx.print(ast, ' ? ');
    ast.trueCase.visitExpression(this, ctx);
    ctx.print(ast, ' : ');
    ast.falseCase?.visitExpression(this, ctx);
    ctx.print(ast, `)`);
  }

  visitDynamicImportExpr(ast: o.DynamicImportExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `import(`);

    if (typeof ast.url === 'string') {
      ctx.print(ast, escapeIdentifier(ast.url, true)!);
    } else {
      ast.url.visitExpression(this, ctx);
    }

    ctx.print(ast, `)`);
  }

  visitNotExpr(ast: o.NotExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, '!');
    ast.condition.visitExpression(this, ctx);
  }

  visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `function${ast.name ? ' ' + ast.name : ''}(`);
    this.visitParams(ast.params, ctx);
    ctx.print(ast, `)`);
    ast.type?.visitType(this, ctx);
    ctx.print(ast, ` {`);
    ctx.println(ast);
    ctx.incIndent();
    this.visitAllStatements(ast.statements, ctx);
    ctx.decIndent();
    ctx.println(ast, `}`);
  }

  visitArrowFunctionExpr(ast: o.ArrowFunctionExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, '(');
    this.visitParams(ast.params, ctx);
    ctx.print(ast, ')');
    ast.type?.visitType(this, ctx);
    ctx.print(ast, ' => ');

    if (Array.isArray(ast.body)) {
      ctx.print(ast, `{`);
      ctx.println(ast);
      ctx.incIndent();
      this.visitAllStatements(ast.body, ctx);
      ctx.decIndent();
      ctx.println(ast, `}`);
    } else {
      const shouldParenthesize = this.shouldParenthesize(ast.body, ast);

      if (shouldParenthesize) {
        ctx.print(ast, '(');
      }

      ast.body.visitExpression(this, ctx);

      if (shouldParenthesize) {
        ctx.print(ast, ')');
      }
    }
  }

  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(stmt, ctx);
    ctx.print(stmt, `function ${stmt.name}(`);
    this.visitParams(stmt.params, ctx);
    ctx.print(stmt, `)`);
    stmt.type?.visitType(this, ctx);
    ctx.print(stmt, ` {`);
    ctx.println(stmt);
    ctx.incIndent();
    this.visitAllStatements(stmt.statements, ctx);
    ctx.decIndent();
    ctx.println(stmt, `}`);
  }

  visitUnaryOperatorExpr(ast: o.UnaryOperatorExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    let opStr: string;
    switch (ast.operator) {
      case o.UnaryOperator.Plus:
        opStr = '+';
        break;
      case o.UnaryOperator.Minus:
        opStr = '-';
        break;
      default:
        throw new Error(`Unknown operator ${ast.operator}`);
    }
    const parens = ast !== this.lastIfCondition;
    if (parens) ctx.print(ast, `(`);
    ctx.print(ast, opStr);
    ast.expr.visitExpression(this, ctx);
    if (parens) ctx.print(ast, `)`);
  }

  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    const operator = BINARY_OPERATORS.get(ast.operator);
    if (!operator) {
      throw new Error(`Unknown operator ${ast.operator}`);
    }
    const parens = ast !== this.lastIfCondition;
    if (parens) ctx.print(ast, `(`);
    ast.lhs.visitExpression(this, ctx);
    ctx.print(ast, ` ${operator} `);
    ast.rhs.visitExpression(this, ctx);
    if (parens) ctx.print(ast, `)`);
  }

  visitReadPropExpr(ast: o.ReadPropExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ast.receiver.visitExpression(this, ctx);
    ctx.print(ast, `.`);
    ctx.print(ast, ast.name);
  }

  visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ast.receiver.visitExpression(this, ctx);
    ctx.print(ast, `[`);
    ast.index.visitExpression(this, ctx);
    ctx.print(ast, `]`);
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `[`);
    this.visitAllExpressions(ast.entries, ctx, ', ');
    ctx.print(ast, `]`);
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, `{`);
    this.visitAllObjects(
      (entry) => {
        if (entry instanceof o.LiteralMapSpreadAssignment) {
          ctx.print(ast, '...');
          entry.expression.visitExpression(this, ctx);
        } else {
          ctx.print(ast, `${escapeIdentifier(entry.key, entry.quoted)}: `);
          entry.value.visitExpression(this, ctx);
        }
      },
      ast.entries,
      ctx,
      ', ',
    );
    ctx.print(ast, `}`);
  }

  visitCommaExpr(ast: o.CommaExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, '(');
    this.visitAllExpressions(ast.parts, ctx, ', ');
    ctx.print(ast, ')');
  }

  visitParenthesizedExpr(ast: o.ParenthesizedExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    // We parenthesize everything regardless of an explicit ParenthesizedExpr, so we can just visit
    // the inner expression.
    // TODO: Do we *need* to parenthesize everything?
    ast.expr.visitExpression(this, ctx);
  }

  visitSpreadElementExpr(ast: o.SpreadElementExpr, ctx: EmitterVisitorContext): void {
    this.printLeadingComments(ast, ctx);
    ctx.print(ast, '...');
    ast.expression.visitExpression(this, ctx);
  }

  visitBuiltinType(type: o.BuiltinType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }

    switch (type.name) {
      case o.BuiltinTypeName.Bool:
        ctx.print(null, ': boolean');
        break;
      case o.BuiltinTypeName.Dynamic:
        ctx.print(null, ': any');
        break;
      case o.BuiltinTypeName.Int:
      case o.BuiltinTypeName.Number:
        ctx.print(null, ': number');
        break;
      case o.BuiltinTypeName.String:
        ctx.print(null, ': string');
        break;
      case o.BuiltinTypeName.None:
        ctx.print(null, ': void');
        break;
      case o.BuiltinTypeName.Inferred:
        // Emits nothing
        break;
      case o.BuiltinTypeName.Function:
        ctx.print(null, ': Function');
        break;
      default:
        ctx.print(null, ': any');
        break;
    }
  }

  visitExpressionType(type: o.ExpressionType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }

    ctx.print(null, ': ');
    type.value.visitExpression(this, ctx);

    if (type.typeParams && type.typeParams.length > 0) {
      ctx.print(null, '<');
      this.visitAllObjects((param) => param.visitType(this, ctx), type.typeParams, ctx, ',');
      ctx.print(null, '>');
    }
  }

  visitArrayType(type: o.ArrayType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }

    ctx.print(null, ': ');
    type.of.visitType(this, ctx);
    ctx.print(null, '[]');
  }

  visitMapType(type: o.MapType, ctx: EmitterVisitorContext): void {
    if (!this.printTypes) {
      return;
    }

    ctx.print(null, ': { [key: string]: ');

    if (type.valueType) {
      type.valueType.visitType(this, ctx);
    } else {
      ctx.print(null, 'any');
    }

    ctx.print(null, '}');
  }

  visitTransplantedType(type: o.TransplantedType<unknown>, ctx: EmitterVisitorContext): void {
    throw new Error('TransplantedType nodes are not supported');
  }

  visitAllExpressions(
    expressions: o.Expression[],
    ctx: EmitterVisitorContext,
    separator: string,
  ): void {
    this.visitAllObjects((expr) => expr.visitExpression(this, ctx), expressions, ctx, separator);
  }

  visitAllObjects<T>(
    handler: (t: T) => void,
    expressions: T[],
    ctx: EmitterVisitorContext,
    separator: string,
  ): void {
    let incrementedIndent = false;
    for (let i = 0; i < expressions.length; i++) {
      if (i > 0) {
        if (ctx.lineLength() > 80) {
          ctx.print(null, separator, true);
          if (!incrementedIndent) {
            // continuation are marked with double indent.
            ctx.incIndent();
            ctx.incIndent();
            incrementedIndent = true;
          }
        } else {
          ctx.print(null, separator, false);
        }
      }
      handler(expressions[i]);
    }
    if (incrementedIndent) {
      // continuation are marked with double indent.
      ctx.decIndent();
      ctx.decIndent();
    }
  }

  visitAllStatements(statements: o.Statement[], ctx: EmitterVisitorContext): void {
    statements.forEach((stmt) => stmt.visitStatement(this, ctx));
  }

  protected visitParams(params: o.FnParam[], ctx: EmitterVisitorContext): void {
    this.visitAllObjects(
      (param) => {
        ctx.print(null, param.name);
        param.type?.visitType(this, ctx);
      },
      params,
      ctx,
      ', ',
    );
  }

  protected shouldParenthesize(
    expression: o.Expression,
    containingExpression: o.Expression,
  ): boolean {
    // Note: this method is protected so consumers can override it, e.g. in case a
    // `WrappedNodeExpr` wraps an expression that needs to be parenthesized.
    return (
      // e.g. `(() => foo)()` or `(function() {})()`.
      ((expression instanceof o.ArrowFunctionExpr || expression instanceof o.FunctionExpr) &&
        containingExpression instanceof o.InvokeFunctionExpr) ||
      // e.g. `() => ({a: 1, b: 2})`
      (expression instanceof o.LiteralMapExpr &&
        containingExpression instanceof o.ArrowFunctionExpr)
    );
  }

  protected printLeadingComments(
    node: o.Expression | o.Statement,
    ctx: EmitterVisitorContext,
  ): void {
    if (!this.printComments || node.leadingComments === undefined) {
      return;
    }
    for (const comment of node.leadingComments) {
      if (comment instanceof o.JSDocComment) {
        ctx.print(node, `/*${comment.toString()}*/`, comment.trailingNewline);
      } else {
        if (comment.multiline) {
          ctx.print(node, `/* ${comment.text} */`, comment.trailingNewline);
        } else {
          comment.text.split('\n').forEach((line) => ctx.println(node, `// ${line}`));
        }
      }
    }
  }
}

export function escapeIdentifier(input: string, alwaysQuote: boolean = true): string | null {
  if (input == null) {
    return null;
  }

  const body = input.replace(SINGLE_QUOTE_ESCAPE_STRING_RE, (...match: string[]) => {
    if (match[0] == '\n') {
      return '\\n';
    } else if (match[0] == '\r') {
      return '\\r';
    } else {
      return `\\${match[0]}`;
    }
  });

  const requiresQuotes = alwaysQuote || !LEGAL_IDENTIFIER_RE.test(body);
  return requiresQuotes ? `'${body}'` : body;
}
