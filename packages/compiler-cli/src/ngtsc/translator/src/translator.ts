/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler';
import {createTaggedTemplate} from 'typescript';

import {AstFactory, BinaryOperator, ObjectLiteralProperty, SourceMapRange, TemplateElement, TemplateLiteral, UnaryOperator} from './api/ast_factory';
import {ImportGenerator} from './api/import_generator';
import {Context} from './context';

const UNARY_OPERATORS = new Map<o.UnaryOperator, UnaryOperator>([
  [o.UnaryOperator.Minus, '-'],
  [o.UnaryOperator.Plus, '+'],
]);

const BINARY_OPERATORS = new Map<o.BinaryOperator, BinaryOperator>([
  [o.BinaryOperator.And, '&&'],
  [o.BinaryOperator.Bigger, '>'],
  [o.BinaryOperator.BiggerEquals, '>='],
  [o.BinaryOperator.BitwiseAnd, '&'],
  [o.BinaryOperator.Divide, '/'],
  [o.BinaryOperator.Equals, '=='],
  [o.BinaryOperator.Identical, '==='],
  [o.BinaryOperator.Lower, '<'],
  [o.BinaryOperator.LowerEquals, '<='],
  [o.BinaryOperator.Minus, '-'],
  [o.BinaryOperator.Modulo, '%'],
  [o.BinaryOperator.Multiply, '*'],
  [o.BinaryOperator.NotEquals, '!='],
  [o.BinaryOperator.NotIdentical, '!=='],
  [o.BinaryOperator.Or, '||'],
  [o.BinaryOperator.Plus, '+'],
  [o.BinaryOperator.NullishCoalesce, '??'],
]);

export type RecordWrappedNodeFn<TExpression> = (node: o.WrappedNodeExpr<TExpression>) => void;

export interface TranslatorOptions<TExpression> {
  downlevelTaggedTemplates?: boolean;
  downlevelVariableDeclarations?: boolean;
  recordWrappedNode?: RecordWrappedNodeFn<TExpression>;
  annotateForClosureCompiler?: boolean;
}

export class ExpressionTranslatorVisitor<TStatement, TExpression> implements o.ExpressionVisitor,
                                                                             o.StatementVisitor {
  private downlevelTaggedTemplates: boolean;
  private downlevelVariableDeclarations: boolean;
  private recordWrappedNode: RecordWrappedNodeFn<TExpression>;

  constructor(
      private factory: AstFactory<TStatement, TExpression>,
      private imports: ImportGenerator<TExpression>, options: TranslatorOptions<TExpression>) {
    this.downlevelTaggedTemplates = options.downlevelTaggedTemplates === true;
    this.downlevelVariableDeclarations = options.downlevelVariableDeclarations === true;
    this.recordWrappedNode = options.recordWrappedNode || (() => {});
  }

  visitDeclareVarStmt(stmt: o.DeclareVarStmt, context: Context): TStatement {
    const varType = this.downlevelVariableDeclarations ?
        'var' :
        stmt.hasModifier(o.StmtModifier.Final) ? 'const' : 'let';
    return this.attachComments(
        this.factory.createVariableDeclaration(
            stmt.name, stmt.value?.visitExpression(this, context.withExpressionMode), varType),
        stmt.leadingComments);
  }

  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, context: Context): TStatement {
    return this.attachComments(
        this.factory.createFunctionDeclaration(
            stmt.name, stmt.params.map(param => param.name),
            this.factory.createBlock(
                this.visitStatements(stmt.statements, context.withStatementMode))),
        stmt.leadingComments);
  }

  visitExpressionStmt(stmt: o.ExpressionStatement, context: Context): TStatement {
    return this.attachComments(
        this.factory.createExpressionStatement(
            stmt.expr.visitExpression(this, context.withStatementMode)),
        stmt.leadingComments);
  }

  visitReturnStmt(stmt: o.ReturnStatement, context: Context): TStatement {
    return this.attachComments(
        this.factory.createReturnStatement(
            stmt.value.visitExpression(this, context.withExpressionMode)),
        stmt.leadingComments);
  }

  visitDeclareClassStmt(_stmt: o.ClassStmt, _context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitIfStmt(stmt: o.IfStmt, context: Context): TStatement {
    return this.attachComments(
        this.factory.createIfStatement(
            stmt.condition.visitExpression(this, context),
            this.factory.createBlock(
                this.visitStatements(stmt.trueCase, context.withStatementMode)),
            stmt.falseCase.length > 0 ? this.factory.createBlock(this.visitStatements(
                                            stmt.falseCase, context.withStatementMode)) :
                                        null),
        stmt.leadingComments);
  }

  visitTryCatchStmt(_stmt: o.TryCatchStmt, _context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitThrowStmt(stmt: o.ThrowStmt, context: Context): TStatement {
    return this.attachComments(
        this.factory.createThrowStatement(
            stmt.error.visitExpression(this, context.withExpressionMode)),
        stmt.leadingComments);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, _context: Context): TExpression {
    const identifier = this.factory.createIdentifier(ast.name!);
    this.setSourceMapRange(identifier, ast.sourceSpan);
    return identifier;
  }

  visitWriteVarExpr(expr: o.WriteVarExpr, context: Context): TExpression {
    const assignment = this.factory.createAssignment(
        this.setSourceMapRange(this.factory.createIdentifier(expr.name), expr.sourceSpan),
        expr.value.visitExpression(this, context),
    );
    return context.isStatement ? assignment :
                                 this.factory.createParenthesizedExpression(assignment);
  }

  visitWriteKeyExpr(expr: o.WriteKeyExpr, context: Context): TExpression {
    const exprContext = context.withExpressionMode;
    const target = this.factory.createElementAccess(
        expr.receiver.visitExpression(this, exprContext),
        expr.index.visitExpression(this, exprContext),
    );
    const assignment =
        this.factory.createAssignment(target, expr.value.visitExpression(this, exprContext));
    return context.isStatement ? assignment :
                                 this.factory.createParenthesizedExpression(assignment);
  }

  visitWritePropExpr(expr: o.WritePropExpr, context: Context): TExpression {
    const target =
        this.factory.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name);
    return this.factory.createAssignment(target, expr.value.visitExpression(this, context));
  }

  visitInvokeMethodExpr(ast: o.InvokeMethodExpr, context: Context): TExpression {
    const target = ast.receiver.visitExpression(this, context);
    return this.setSourceMapRange(
        this.factory.createCallExpression(
            ast.name !== null ? this.factory.createPropertyAccess(target, ast.name) : target,
            ast.args.map(arg => arg.visitExpression(this, context)),
            /* pure */ false),
        ast.sourceSpan);
  }

  visitInvokeFunctionExpr(ast: o.InvokeFunctionExpr, context: Context): TExpression {
    return this.setSourceMapRange(
        this.factory.createCallExpression(
            ast.fn.visitExpression(this, context),
            ast.args.map(arg => arg.visitExpression(this, context)), ast.pure),
        ast.sourceSpan);
  }

  visitTaggedTemplateExpr(ast: o.TaggedTemplateExpr, context: Context): TExpression {
    return this.setSourceMapRange(
        this.createTaggedTemplateExpression(ast.tag.visitExpression(this, context), {
          elements: ast.template.elements.map(e => createTemplateElement({
                                                cooked: e.text,
                                                raw: e.rawText,
                                                range: e.sourceSpan ?? ast.sourceSpan,
                                              })),
          expressions: ast.template.expressions.map(e => e.visitExpression(this, context))
        }),
        ast.sourceSpan);
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, context: Context): TExpression {
    return this.factory.createNewExpression(
        ast.classExpr.visitExpression(this, context),
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitLiteralExpr(ast: o.LiteralExpr, _context: Context): TExpression {
    return this.setSourceMapRange(this.factory.createLiteral(ast.value), ast.sourceSpan);
  }

  visitLocalizedString(ast: o.LocalizedString, context: Context): TExpression {
    // A `$localize` message consists of `messageParts` and `expressions`, which get interleaved
    // together. The interleaved pieces look like:
    // `[messagePart0, expression0, messagePart1, expression1, messagePart2]`
    //
    // Note that there is always a message part at the start and end, and so therefore
    // `messageParts.length === expressions.length + 1`.
    //
    // Each message part may be prefixed with "metadata", which is wrapped in colons (:) delimiters.
    // The metadata is attached to the first and subsequent message parts by calls to
    // `serializeI18nHead()` and `serializeI18nTemplatePart()` respectively.
    //
    // The first message part (i.e. `ast.messageParts[0]`) is used to initialize `messageParts`
    // array.
    const elements: TemplateElement[] = [createTemplateElement(ast.serializeI18nHead())];
    const expressions: TExpression[] = [];
    for (let i = 0; i < ast.expressions.length; i++) {
      const placeholder = this.setSourceMapRange(
          ast.expressions[i].visitExpression(this, context), ast.getPlaceholderSourceSpan(i));
      expressions.push(placeholder);
      elements.push(createTemplateElement(ast.serializeI18nTemplatePart(i + 1)));
    }

    const localizeTag = this.factory.createIdentifier('$localize');
    return this.setSourceMapRange(
        this.createTaggedTemplateExpression(localizeTag, {elements, expressions}), ast.sourceSpan);
  }

  private createTaggedTemplateExpression(tag: TExpression, template: TemplateLiteral<TExpression>):
      TExpression {
    return this.downlevelTaggedTemplates ? this.createES5TaggedTemplateFunctionCall(tag, template) :
                                           this.factory.createTaggedTemplate(tag, template);
  }

  /**
   * Translate the tagged template literal into a call that is compatible with ES5, using the
   * imported `__makeTemplateObject` helper for ES5 formatted output.
   */
  private createES5TaggedTemplateFunctionCall(
      tagHandler: TExpression, {elements, expressions}: TemplateLiteral<TExpression>): TExpression {
    // Ensure that the `__makeTemplateObject()` helper has been imported.
    const {moduleImport, symbol} =
        this.imports.generateNamedImport('tslib', '__makeTemplateObject');
    const __makeTemplateObjectHelper = (moduleImport === null) ?
        this.factory.createIdentifier(symbol) :
        this.factory.createPropertyAccess(moduleImport, symbol);

    // Collect up the cooked and raw strings into two separate arrays.
    const cooked: TExpression[] = [];
    const raw: TExpression[] = [];
    for (const element of elements) {
      cooked.push(this.factory.setSourceMapRange(
          this.factory.createLiteral(element.cooked), element.range));
      raw.push(
          this.factory.setSourceMapRange(this.factory.createLiteral(element.raw), element.range));
    }

    // Generate the helper call in the form: `__makeTemplateObject([cooked], [raw]);`
    const templateHelperCall = this.factory.createCallExpression(
        __makeTemplateObjectHelper,
        [this.factory.createArrayLiteral(cooked), this.factory.createArrayLiteral(raw)],
        /* pure */ false);

    // Finally create the tagged handler call in the form:
    // `tag(__makeTemplateObject([cooked], [raw]), ...expressions);`
    return this.factory.createCallExpression(
        tagHandler, [templateHelperCall, ...expressions],
        /* pure */ false);
  }

  visitExternalExpr(ast: o.ExternalExpr, _context: Context): TExpression {
    if (ast.value.name === null) {
      if (ast.value.moduleName === null) {
        throw new Error('Invalid import without name nor moduleName');
      }
      return this.imports.generateNamespaceImport(ast.value.moduleName);
    }
    // If a moduleName is specified, this is a normal import. If there's no module name, it's a
    // reference to a global/ambient symbol.
    if (ast.value.moduleName !== null) {
      // This is a normal import. Find the imported module.
      const {moduleImport, symbol} =
          this.imports.generateNamedImport(ast.value.moduleName, ast.value.name);
      if (moduleImport === null) {
        // The symbol was ambient after all.
        return this.factory.createIdentifier(symbol);
      } else {
        return this.factory.createPropertyAccess(moduleImport, symbol);
      }
    } else {
      // The symbol is ambient, so just reference it.
      return this.factory.createIdentifier(ast.value.name);
    }
  }

  visitConditionalExpr(ast: o.ConditionalExpr, context: Context): TExpression {
    let cond: TExpression = ast.condition.visitExpression(this, context);

    // Ordinarily the ternary operator is right-associative. The following are equivalent:
    //   `a ? b : c ? d : e` => `a ? b : (c ? d : e)`
    //
    // However, occasionally Angular needs to produce a left-associative conditional, such as in
    // the case of a null-safe navigation production: `{{a?.b ? c : d}}`. This template produces
    // a ternary of the form:
    //   `a == null ? null : rest of expression`
    // If the rest of the expression is also a ternary though, this would produce the form:
    //   `a == null ? null : a.b ? c : d`
    // which, if left as right-associative, would be incorrectly associated as:
    //   `a == null ? null : (a.b ? c : d)`
    //
    // In such cases, the left-associativity needs to be enforced with parentheses:
    //   `(a == null ? null : a.b) ? c : d`
    //
    // Such parentheses could always be included in the condition (guaranteeing correct behavior) in
    // all cases, but this has a code size cost. Instead, parentheses are added only when a
    // conditional expression is directly used as the condition of another.
    //
    // TODO(alxhub): investigate better logic for precendence of conditional operators
    if (ast.condition instanceof o.ConditionalExpr) {
      // The condition of this ternary needs to be wrapped in parentheses to maintain
      // left-associativity.
      cond = this.factory.createParenthesizedExpression(cond);
    }

    return this.factory.createConditional(
        cond, ast.trueCase.visitExpression(this, context),
        ast.falseCase!.visitExpression(this, context));
  }

  visitNotExpr(ast: o.NotExpr, context: Context): TExpression {
    return this.factory.createUnaryExpression('!', ast.condition.visitExpression(this, context));
  }

  visitAssertNotNullExpr(ast: o.AssertNotNull, context: Context): TExpression {
    return ast.condition.visitExpression(this, context);
  }

  visitCastExpr(ast: o.CastExpr, context: Context): TExpression {
    return ast.value.visitExpression(this, context);
  }

  visitFunctionExpr(ast: o.FunctionExpr, context: Context): TExpression {
    return this.factory.createFunctionExpression(
        ast.name ?? null, ast.params.map(param => param.name),
        this.factory.createBlock(this.visitStatements(ast.statements, context)));
  }

  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, context: Context): TExpression {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${o.BinaryOperator[ast.operator]}`);
    }
    return this.factory.createBinaryExpression(
        ast.lhs.visitExpression(this, context),
        BINARY_OPERATORS.get(ast.operator)!,
        ast.rhs.visitExpression(this, context),
    );
  }

  visitReadPropExpr(ast: o.ReadPropExpr, context: Context): TExpression {
    return this.factory.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
  }

  visitReadKeyExpr(ast: o.ReadKeyExpr, context: Context): TExpression {
    return this.factory.createElementAccess(
        ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context));
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, context: Context): TExpression {
    return this.factory.createArrayLiteral(ast.entries.map(
        expr => this.setSourceMapRange(expr.visitExpression(this, context), ast.sourceSpan)));
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: Context): TExpression {
    const properties: ObjectLiteralProperty<TExpression>[] = ast.entries.map(entry => {
      return {
        propertyName: entry.key,
        quoted: entry.quoted,
        value: entry.value.visitExpression(this, context)
      };
    });
    return this.setSourceMapRange(this.factory.createObjectLiteral(properties), ast.sourceSpan);
  }

  visitCommaExpr(ast: o.CommaExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, _context: Context): any {
    this.recordWrappedNode(ast);
    return ast.node;
  }

  visitTypeofExpr(ast: o.TypeofExpr, context: Context): TExpression {
    return this.factory.createTypeOfExpression(ast.expr.visitExpression(this, context));
  }

  visitUnaryOperatorExpr(ast: o.UnaryOperatorExpr, context: Context): TExpression {
    if (!UNARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown unary operator: ${o.UnaryOperator[ast.operator]}`);
    }
    return this.factory.createUnaryExpression(
        UNARY_OPERATORS.get(ast.operator)!, ast.expr.visitExpression(this, context));
  }

  private visitStatements(statements: o.Statement[], context: Context): TStatement[] {
    return statements.map(stmt => stmt.visitStatement(this, context))
        .filter(stmt => stmt !== undefined);
  }

  private setSourceMapRange<T extends TExpression|TStatement>(ast: T, span: o.ParseSourceSpan|null):
      T {
    return this.factory.setSourceMapRange(ast, createRange(span));
  }

  private attachComments(statement: TStatement, leadingComments: o.LeadingComment[]|undefined):
      TStatement {
    if (leadingComments !== undefined) {
      this.factory.attachComments(statement, leadingComments);
    }
    return statement;
  }
}

/**
 * Convert a cooked-raw string object into one that can be used by the AST factories.
 */
function createTemplateElement(
    {cooked, raw, range}: {cooked: string, raw: string, range: o.ParseSourceSpan|null}):
    TemplateElement {
  return {cooked, raw, range: createRange(range)};
}

/**
 * Convert an OutputAST source-span into a range that can be used by the AST factories.
 */
function createRange(span: o.ParseSourceSpan|null): SourceMapRange|null {
  if (span === null) {
    return null;
  }
  const {start, end} = span;
  const {url, content} = start.file;
  if (!url) {
    return null;
  }
  return {
    url,
    content,
    start: {offset: start.offset, line: start.line, column: start.col},
    end: {offset: end.offset, line: end.line, column: end.col},
  };
}
