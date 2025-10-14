/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from './output_ast';
import {SourceMapGenerator} from './source_map';
const _SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
const _LEGAL_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
const _INDENT_WITH = '  ';
class _EmittedLine {
  constructor(indent) {
    this.indent = indent;
    this.partsLength = 0;
    this.parts = [];
    this.srcSpans = [];
  }
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
  static createRoot() {
    return new EmitterVisitorContext(0);
  }
  constructor(_indent) {
    this._indent = _indent;
    this._lines = [new _EmittedLine(_indent)];
  }
  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  get _currentLine() {
    return this._lines[this._lines.length - 1];
  }
  println(from, lastPart = '') {
    this.print(from || null, lastPart, true);
  }
  lineIsEmpty() {
    return this._currentLine.parts.length === 0;
  }
  lineLength() {
    return this._currentLine.indent * _INDENT_WITH.length + this._currentLine.partsLength;
  }
  print(from, part, newLine = false) {
    if (part.length > 0) {
      this._currentLine.parts.push(part);
      this._currentLine.partsLength += part.length;
      this._currentLine.srcSpans.push((from && from.sourceSpan) || null);
    }
    if (newLine) {
      this._lines.push(new _EmittedLine(this._indent));
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
  toSource() {
    return this.sourceLines
      .map((l) => (l.parts.length > 0 ? _createIndent(l.indent) + l.parts.join('') : ''))
      .join('\n');
  }
  toSourceMapGenerator(genFilePath, startsAtLine = 0) {
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
      let col0 = line.indent * _INDENT_WITH.length;
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
        const span = spans[spanIdx];
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
  spanOf(line, column) {
    const emittedLine = this._lines[line];
    if (emittedLine) {
      let columnsLeft = column - _createIndent(emittedLine.indent).length;
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
  get sourceLines() {
    if (this._lines.length && this._lines[this._lines.length - 1].parts.length === 0) {
      return this._lines.slice(0, -1);
    }
    return this._lines;
  }
}
export class AbstractEmitterVisitor {
  constructor(_escapeDollarInStrings) {
    this._escapeDollarInStrings = _escapeDollarInStrings;
    this.lastIfCondition = null;
  }
  printLeadingComments(stmt, ctx) {
    if (stmt.leadingComments === undefined) {
      return;
    }
    for (const comment of stmt.leadingComments) {
      if (comment instanceof o.JSDocComment) {
        ctx.print(stmt, `/*${comment.toString()}*/`, comment.trailingNewline);
      } else {
        if (comment.multiline) {
          ctx.print(stmt, `/* ${comment.text} */`, comment.trailingNewline);
        } else {
          comment.text.split('\n').forEach((line) => {
            ctx.println(stmt, `// ${line}`);
          });
        }
      }
    }
  }
  visitExpressionStmt(stmt, ctx) {
    this.printLeadingComments(stmt, ctx);
    stmt.expr.visitExpression(this, ctx);
    ctx.println(stmt, ';');
    return null;
  }
  visitReturnStmt(stmt, ctx) {
    this.printLeadingComments(stmt, ctx);
    ctx.print(stmt, `return `);
    stmt.value.visitExpression(this, ctx);
    ctx.println(stmt, ';');
    return null;
  }
  visitIfStmt(stmt, ctx) {
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
    return null;
  }
  visitInvokeFunctionExpr(expr, ctx) {
    const shouldParenthesize = expr.fn instanceof o.ArrowFunctionExpr;
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
    return null;
  }
  visitTaggedTemplateLiteralExpr(expr, ctx) {
    expr.tag.visitExpression(this, ctx);
    expr.template.visitExpression(this, ctx);
    return null;
  }
  visitTemplateLiteralExpr(expr, ctx) {
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
  visitTemplateLiteralElementExpr(expr, ctx) {
    ctx.print(expr, expr.rawText);
  }
  visitWrappedNodeExpr(ast, ctx) {
    throw new Error('Abstract emitter cannot visit WrappedNodeExpr.');
  }
  visitTypeofExpr(expr, ctx) {
    ctx.print(expr, 'typeof ');
    expr.expr.visitExpression(this, ctx);
  }
  visitVoidExpr(expr, ctx) {
    ctx.print(expr, 'void ');
    expr.expr.visitExpression(this, ctx);
  }
  visitReadVarExpr(ast, ctx) {
    ctx.print(ast, ast.name);
    return null;
  }
  visitInstantiateExpr(ast, ctx) {
    ctx.print(ast, `new `);
    ast.classExpr.visitExpression(this, ctx);
    ctx.print(ast, `(`);
    this.visitAllExpressions(ast.args, ctx, ',');
    ctx.print(ast, `)`);
    return null;
  }
  visitLiteralExpr(ast, ctx) {
    const value = ast.value;
    if (typeof value === 'string') {
      ctx.print(ast, escapeIdentifier(value, this._escapeDollarInStrings));
    } else {
      ctx.print(ast, `${value}`);
    }
    return null;
  }
  visitRegularExpressionLiteral(ast, ctx) {
    ctx.print(ast, `/${ast.body}/${ast.flags || ''}`);
    return null;
  }
  visitLocalizedString(ast, ctx) {
    const head = ast.serializeI18nHead();
    ctx.print(ast, '$localize `' + head.raw);
    for (let i = 1; i < ast.messageParts.length; i++) {
      ctx.print(ast, '${');
      ast.expressions[i - 1].visitExpression(this, ctx);
      ctx.print(ast, `}${ast.serializeI18nTemplatePart(i).raw}`);
    }
    ctx.print(ast, '`');
    return null;
  }
  visitConditionalExpr(ast, ctx) {
    ctx.print(ast, `(`);
    ast.condition.visitExpression(this, ctx);
    ctx.print(ast, '? ');
    ast.trueCase.visitExpression(this, ctx);
    ctx.print(ast, ': ');
    ast.falseCase.visitExpression(this, ctx);
    ctx.print(ast, `)`);
    return null;
  }
  visitDynamicImportExpr(ast, ctx) {
    ctx.print(ast, `import(${ast.url})`);
  }
  visitNotExpr(ast, ctx) {
    ctx.print(ast, '!');
    ast.condition.visitExpression(this, ctx);
    return null;
  }
  visitUnaryOperatorExpr(ast, ctx) {
    let opStr;
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
    return null;
  }
  visitBinaryOperatorExpr(ast, ctx) {
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
    return null;
  }
  visitReadPropExpr(ast, ctx) {
    ast.receiver.visitExpression(this, ctx);
    ctx.print(ast, `.`);
    ctx.print(ast, ast.name);
    return null;
  }
  visitReadKeyExpr(ast, ctx) {
    ast.receiver.visitExpression(this, ctx);
    ctx.print(ast, `[`);
    ast.index.visitExpression(this, ctx);
    ctx.print(ast, `]`);
    return null;
  }
  visitLiteralArrayExpr(ast, ctx) {
    ctx.print(ast, `[`);
    this.visitAllExpressions(ast.entries, ctx, ',');
    ctx.print(ast, `]`);
    return null;
  }
  visitLiteralMapExpr(ast, ctx) {
    ctx.print(ast, `{`);
    this.visitAllObjects(
      (entry) => {
        ctx.print(
          ast,
          `${escapeIdentifier(entry.key, this._escapeDollarInStrings, entry.quoted)}:`,
        );
        entry.value.visitExpression(this, ctx);
      },
      ast.entries,
      ctx,
      ',',
    );
    ctx.print(ast, `}`);
    return null;
  }
  visitCommaExpr(ast, ctx) {
    ctx.print(ast, '(');
    this.visitAllExpressions(ast.parts, ctx, ',');
    ctx.print(ast, ')');
    return null;
  }
  visitParenthesizedExpr(ast, ctx) {
    // We parenthesize everything regardless of an explicit ParenthesizedExpr, so we can just visit
    // the inner expression.
    // TODO: Do we *need* to parenthesize everything?
    ast.expr.visitExpression(this, ctx);
  }
  visitAllExpressions(expressions, ctx, separator) {
    this.visitAllObjects((expr) => expr.visitExpression(this, ctx), expressions, ctx, separator);
  }
  visitAllObjects(handler, expressions, ctx, separator) {
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
  visitAllStatements(statements, ctx) {
    statements.forEach((stmt) => stmt.visitStatement(this, ctx));
  }
}
export function escapeIdentifier(input, escapeDollar, alwaysQuote = true) {
  if (input == null) {
    return null;
  }
  const body = input.replace(_SINGLE_QUOTE_ESCAPE_STRING_RE, (...match) => {
    if (match[0] == '$') {
      return escapeDollar ? '\\$' : '$';
    } else if (match[0] == '\n') {
      return '\\n';
    } else if (match[0] == '\r') {
      return '\\r';
    } else {
      return `\\${match[0]}`;
    }
  });
  const requiresQuotes = alwaysQuote || !_LEGAL_IDENTIFIER_RE.test(body);
  return requiresQuotes ? `'${body}'` : body;
}
function _createIndent(count) {
  let res = '';
  for (let i = 0; i < count; i++) {
    res += _INDENT_WITH;
  }
  return res;
}
//# sourceMappingURL=abstract_emitter.js.map
