/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// A Huge thanks to Alex Rickabaugh for writing this 🙏.

import * as ng from '@angular/compiler';

const UNARY_OPERATORS = new Map<ng.UnaryOperator, string>([
  [ng.UnaryOperator.Minus, '-'],
  [ng.UnaryOperator.Plus, '+'],
]);

const BINARY_OPERATORS = new Map<ng.BinaryOperator, string>([
  [ng.BinaryOperator.And, '&&'],
  [ng.BinaryOperator.Bigger, '>'],
  [ng.BinaryOperator.BiggerEquals, '>='],
  [ng.BinaryOperator.BitwiseAnd, '&'],
  [ng.BinaryOperator.BitwiseOr, '|'],
  [ng.BinaryOperator.Divide, '/'],
  [ng.BinaryOperator.Equals, '=='],
  [ng.BinaryOperator.Identical, '==='],
  [ng.BinaryOperator.Lower, '<'],
  [ng.BinaryOperator.LowerEquals, '<='],
  [ng.BinaryOperator.Minus, '-'],
  [ng.BinaryOperator.Modulo, '%'],
  [ng.BinaryOperator.Multiply, '*'],
  [ng.BinaryOperator.NotEquals, '!='],
  [ng.BinaryOperator.NotIdentical, '!=='],
  [ng.BinaryOperator.Or, '||'],
  [ng.BinaryOperator.Plus, '+'],
  [ng.BinaryOperator.NullishCoalesce, '??'],
]);

export class Context {
  constructor(readonly isStatement: boolean) {}

  get withExpressionMode(): Context {
    return this.isStatement ? new Context(false) : this;
  }

  get withStatementMode(): Context {
    return !this.isStatement ? new Context(true) : this;
  }
}

export class Printer implements ng.ExpressionVisitor, ng.StatementVisitor {
  visitDeclareVarStmt(stmt: ng.DeclareVarStmt, context: Context): string {
    let varStmt = stmt.hasModifier(ng.StmtModifier.Final) ? 'const' : 'let';
    varStmt += ' ' + stmt.name;
    if (stmt.value) {
      varStmt += ' = ' + stmt.value.visitExpression(this, context.withExpressionMode);
    }
    return this.attachComments(varStmt, stmt.leadingComments);
  }

  visitDeclareFunctionStmt(stmt: ng.DeclareFunctionStmt, context: Context): string {
    let fn = `function ${stmt.name}(${stmt.params.map((p) => p.name).join(', ')}) {`;
    fn += this.visitStatements(stmt.statements, context.withStatementMode);
    fn += '}';
    return this.attachComments(fn, stmt.leadingComments);
  }

  visitExpressionStmt(stmt: ng.ExpressionStatement, context: Context): string {
    return this.attachComments(
      stmt.expr.visitExpression(this, context.withStatementMode) + ';',
      stmt.leadingComments,
    );
  }

  visitReturnStmt(stmt: ng.ReturnStatement, context: Context): string {
    return this.attachComments(
      'return ' + stmt.value.visitExpression(this, context.withExpressionMode) + ';',
      stmt.leadingComments,
    );
  }

  visitIfStmt(stmt: ng.IfStmt, context: Context): string {
    let ifStmt = 'if (';
    ifStmt += stmt.condition.visitExpression(this, context);
    ifStmt += ') {' + this.visitStatements(stmt.trueCase, context.withStatementMode) + '}';
    if (stmt.falseCase.length > 0) {
      ifStmt += ' else {';
      ifStmt += this.visitStatements(stmt.falseCase, context.withStatementMode);
      ifStmt += '}';
    }
    return this.attachComments(ifStmt, stmt.leadingComments);
  }

  visitReadVarExpr(ast: ng.ReadVarExpr, _context: Context): string {
    return ast.name;
  }

  visitInvokeFunctionExpr(ast: ng.InvokeFunctionExpr, context: Context): string {
    const fn = ast.fn.visitExpression(this, context);
    const args = ast.args.map((arg) => arg.visitExpression(this, context));
    return this.setSourceMapRange(
      // TODO: purity (ast.pure)
      `${fn}(${args.join(', ')})`,
      ast.sourceSpan,
    );
  }

  visitTaggedTemplateExpr(ast: ng.TaggedTemplateLiteralExpr, context: Context): string {
    throw new Error('only important for i18n');
  }

  visitInstantiateExpr(ast: ng.InstantiateExpr, context: Context): string {
    const ctor = ast.classExpr.visitExpression(this, context);
    const args = ast.args.map((arg) => arg.visitExpression(this, context));
    return `new ${ctor}(${args.join(', ')})`;
  }

  visitLiteralExpr(ast: ng.LiteralExpr, _context: Context): string {
    let value: string;
    if (typeof ast.value === 'string') {
      value = `'${ast.value.replaceAll(`'`, `\\'`).replaceAll('\n', '\\n')}'`;
    } else if (ast.value === undefined) {
      value = 'undefined';
    } else if (ast.value === null) {
      value = 'null';
    } else {
      value = ast.value.toString();
    }
    return this.setSourceMapRange(value, ast.sourceSpan);
  }

  visitLocalizedString(ast: ng.LocalizedString, context: Context): string {
    throw new Error('only important for i18n');
  }

  visitExternalExpr(ast: ng.ExternalExpr, _context: Context): string {
    if (ast.value.name === null) {
      if (ast.value.moduleName === null) {
        throw new Error('Invalid import without name nor moduleName');
      }
      return 'ng';
    }
    // If a moduleName is specified, this is a normal import. If there's no
    // module name, it's a reference to a global/ambient symbol.
    if (ast.value.moduleName !== null) {
      return `${ast.value.name}`;
    } else {
      // The symbol is ambient, so just reference it.
      return ast.value.name;
    }
  }

  visitConditionalExpr(ast: ng.ConditionalExpr, context: Context): string {
    let cond: string = ast.condition.visitExpression(this, context);

    // Ordinarily the ternary operator is right-associative. The following are
    // equivalent:
    //   `a ? b : c ? d : e` => `a ? b : (c ? d : e)`
    //
    // However, occasionally Angular needs to produce a left-associative
    // conditional, such as in the case of a null-safe navigation production:
    // `{{a?.b ? c : d}}`. This template produces a ternary of the form:
    //   `a == null ? null : rest of expression`
    // If the rest of the expression is also a ternary though, this would
    // produce the form:
    //   `a == null ? null : a.b ? c : d`
    // which, if left as right-associative, would be incorrectly associated as:
    //   `a == null ? null : (a.b ? c : d)`
    //
    // In such cases, the left-associativity needs to be enforced with
    // parentheses:
    //   `(a == null ? null : a.b) ? c : d`
    //
    // Such parentheses could always be included in the condition (guaranteeing
    // correct behavior) in all cases, but this has a code size cost. Instead,
    // parentheses are added only when a conditional expression is directly used
    // as the condition of another.
    //
    // TODO(alxhub): investigate better logic for precendence of conditional
    // operators
    if (ast.condition instanceof ng.ConditionalExpr) {
      // The condition of this ternary needs to be wrapped in parentheses to
      // maintain left-associativity.
      cond = `(${cond})`;
    }

    return (
      cond +
      ' ? ' +
      ast.trueCase.visitExpression(this, context) +
      ' : ' +
      ast.falseCase!.visitExpression(this, context)
    );
  }

  visitDynamicImportExpr(ast: ng.DynamicImportExpr, context: any) {
    return `import('${ast.url}')`;
  }

  visitNotExpr(ast: ng.NotExpr, context: Context): string {
    return '!' + ast.condition.visitExpression(this, context);
  }

  visitFunctionExpr(ast: ng.FunctionExpr, context: Context): string {
    let fn = `function `;
    if (ast.name) {
      fn += ast.name;
    }
    fn += `(` + ast.params.map((param) => param.name).join(', ') + ') {';
    fn += this.visitStatements(ast.statements, context);
    fn += '}';
    return fn;
  }

  visitArrowFunctionExpr(ast: ng.ArrowFunctionExpr, context: any) {
    const params = ast.params.map((param) => param.name).join(', ');
    let body: string;
    if (Array.isArray(ast.body)) {
      body = '{' + this.visitStatements(ast.body, context) + '}';
    } else {
      body = ast.body.visitExpression(this, context);
    }
    return `(${params}) => (${body})`;
  }

  visitBinaryOperatorExpr(ast: ng.BinaryOperatorExpr, context: Context): string {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${ng.BinaryOperator[ast.operator]}`);
    }
    return (
      ast.lhs.visitExpression(this, context) +
      BINARY_OPERATORS.get(ast.operator)! +
      '(' +
      ast.rhs.visitExpression(this, context) +
      ')'
    );
  }

  visitReadPropExpr(ast: ng.ReadPropExpr, context: Context): string {
    return ast.receiver.visitExpression(this, context) + '.' + ast.name;
  }

  visitReadKeyExpr(ast: ng.ReadKeyExpr, context: Context): string {
    const receiver = ast.receiver.visitExpression(this, context);
    const key = ast.index.visitExpression(this, context);
    return `${receiver}[${key}]`;
  }

  visitLiteralArrayExpr(ast: ng.LiteralArrayExpr, context: Context): string {
    const entries = ast.entries.map((expr) =>
      this.setSourceMapRange(expr.visitExpression(this, context), ast.sourceSpan),
    );
    return '[' + entries.join(', ') + ']';
  }

  visitLiteralMapExpr(ast: ng.LiteralMapExpr, context: Context): string {
    const properties: string[] = ast.entries.map((entry) => {
      let key = entry.key;
      if (entry.quoted) {
        key = `'` + key.replaceAll(`'`, `\\'`) + `'`;
      }
      return key + ': ' + entry.value.visitExpression(this, context);
    });
    return this.setSourceMapRange('{' + properties.join(', ') + '}', ast.sourceSpan);
  }

  visitCommaExpr(ast: ng.CommaExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: ng.WrappedNodeExpr<string>, _context: Context): string {
    return ast.node;
  }

  visitTypeofExpr(ast: ng.TypeofExpr, context: Context): string {
    return 'typeof ' + ast.expr.visitExpression(this, context);
  }

  visitUnaryOperatorExpr(ast: ng.UnaryOperatorExpr, context: Context): string {
    if (!UNARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown unary operator: ${ng.UnaryOperator[ast.operator]}`);
    }
    return UNARY_OPERATORS.get(ast.operator)! + ast.expr.visitExpression(this, context);
  }

  visitTaggedTemplateLiteralExpr(ast: ng.TaggedTemplateLiteralExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitTemplateLiteralExpr(ast: ng.TemplateLiteralExpr, context: any) {
    let str = '`';
    for (let i = 0; i < ast.elements.length; i++) {
      str += ast.elements[i].visitExpression(this, this);
      const expression = i < ast.expressions.length ? ast.expressions[i] : null;
      if (expression !== null) {
        str += '${' + expression.visitExpression(this, this) + '}';
      }
    }
    str += '`';
    return str;
  }

  visitTemplateLiteralElementExpr(ast: ng.TemplateLiteralElementExpr, context: any) {
    return ast.text;
  }

  visitVoidExpr(ast: ng.VoidExpr, context: any) {
    return 'void ' + ast.expr.visitExpression(this, context);
  }
  visitParenthesizedExpr(ast: ng.ParenthesizedExpr, context: any) {
    return '(' + ast.expr.visitExpression(this, context) + ')';
  }

  private visitStatements(statements: ng.Statement[], context: Context): string {
    return statements
      .map((stmt) => stmt.visitStatement(this, context))
      .filter((stmt) => stmt !== undefined)
      .join('\n');
  }

  private setSourceMapRange(ast: string, span: ng.ParseSourceSpan | null): string {
    return ast;
  }

  private attachComments(
    statement: string,
    leadingComments: ng.LeadingComment[] | undefined,
  ): string {
    // if (leadingComments !== undefined) {
    //   this.factory.attachComments(statement, leadingComments);
    // }
    return statement;
  }
}
