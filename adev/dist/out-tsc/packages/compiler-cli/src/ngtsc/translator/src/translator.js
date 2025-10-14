/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '@angular/compiler';
const UNARY_OPERATORS = /* @__PURE__ */ new Map([
  [o.UnaryOperator.Minus, '-'],
  [o.UnaryOperator.Plus, '+'],
]);
const BINARY_OPERATORS = /* @__PURE__ */ new Map([
  [o.BinaryOperator.And, '&&'],
  [o.BinaryOperator.Bigger, '>'],
  [o.BinaryOperator.BiggerEquals, '>='],
  [o.BinaryOperator.BitwiseAnd, '&'],
  [o.BinaryOperator.BitwiseOr, '|'],
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
  [o.BinaryOperator.Exponentiation, '**'],
  [o.BinaryOperator.In, 'in'],
  [o.BinaryOperator.Assign, '='],
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
export class ExpressionTranslatorVisitor {
  factory;
  imports;
  contextFile;
  downlevelTaggedTemplates;
  downlevelVariableDeclarations;
  recordWrappedNode;
  constructor(factory, imports, contextFile, options) {
    this.factory = factory;
    this.imports = imports;
    this.contextFile = contextFile;
    this.downlevelTaggedTemplates = options.downlevelTaggedTemplates === true;
    this.downlevelVariableDeclarations = options.downlevelVariableDeclarations === true;
    this.recordWrappedNode = options.recordWrappedNode || (() => {});
  }
  visitDeclareVarStmt(stmt, context) {
    const varType = this.downlevelVariableDeclarations
      ? 'var'
      : stmt.hasModifier(o.StmtModifier.Final)
        ? 'const'
        : 'let';
    return this.attachComments(
      this.factory.createVariableDeclaration(
        stmt.name,
        stmt.value?.visitExpression(this, context.withExpressionMode),
        varType,
      ),
      stmt.leadingComments,
    );
  }
  visitDeclareFunctionStmt(stmt, context) {
    return this.attachComments(
      this.factory.createFunctionDeclaration(
        stmt.name,
        stmt.params.map((param) => param.name),
        this.factory.createBlock(this.visitStatements(stmt.statements, context.withStatementMode)),
      ),
      stmt.leadingComments,
    );
  }
  visitExpressionStmt(stmt, context) {
    return this.attachComments(
      this.factory.createExpressionStatement(
        stmt.expr.visitExpression(this, context.withStatementMode),
      ),
      stmt.leadingComments,
    );
  }
  visitReturnStmt(stmt, context) {
    return this.attachComments(
      this.factory.createReturnStatement(
        stmt.value.visitExpression(this, context.withExpressionMode),
      ),
      stmt.leadingComments,
    );
  }
  visitIfStmt(stmt, context) {
    return this.attachComments(
      this.factory.createIfStatement(
        stmt.condition.visitExpression(this, context),
        this.factory.createBlock(this.visitStatements(stmt.trueCase, context.withStatementMode)),
        stmt.falseCase.length > 0
          ? this.factory.createBlock(
              this.visitStatements(stmt.falseCase, context.withStatementMode),
            )
          : null,
      ),
      stmt.leadingComments,
    );
  }
  visitReadVarExpr(ast, _context) {
    const identifier = this.factory.createIdentifier(ast.name);
    this.setSourceMapRange(identifier, ast.sourceSpan);
    return identifier;
  }
  visitInvokeFunctionExpr(ast, context) {
    return this.setSourceMapRange(
      this.factory.createCallExpression(
        ast.fn.visitExpression(this, context),
        ast.args.map((arg) => arg.visitExpression(this, context)),
        ast.pure,
      ),
      ast.sourceSpan,
    );
  }
  visitTaggedTemplateLiteralExpr(ast, context) {
    return this.setSourceMapRange(
      this.createTaggedTemplateExpression(
        ast.tag.visitExpression(this, context),
        this.getTemplateLiteralFromAst(ast.template, context),
      ),
      ast.sourceSpan,
    );
  }
  visitTemplateLiteralExpr(ast, context) {
    return this.setSourceMapRange(
      this.factory.createTemplateLiteral(this.getTemplateLiteralFromAst(ast, context)),
      ast.sourceSpan,
    );
  }
  visitInstantiateExpr(ast, context) {
    return this.factory.createNewExpression(
      ast.classExpr.visitExpression(this, context),
      ast.args.map((arg) => arg.visitExpression(this, context)),
    );
  }
  visitLiteralExpr(ast, _context) {
    return this.setSourceMapRange(this.factory.createLiteral(ast.value), ast.sourceSpan);
  }
  visitRegularExpressionLiteral(ast, context) {
    return this.setSourceMapRange(
      this.factory.createRegularExpressionLiteral(ast.body, ast.flags),
      ast.sourceSpan,
    );
  }
  visitLocalizedString(ast, context) {
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
    const elements = [createTemplateElement(ast.serializeI18nHead())];
    const expressions = [];
    for (let i = 0; i < ast.expressions.length; i++) {
      const placeholder = this.setSourceMapRange(
        ast.expressions[i].visitExpression(this, context),
        ast.getPlaceholderSourceSpan(i),
      );
      expressions.push(placeholder);
      elements.push(createTemplateElement(ast.serializeI18nTemplatePart(i + 1)));
    }
    const localizeTag = this.factory.createIdentifier('$localize');
    return this.setSourceMapRange(
      this.createTaggedTemplateExpression(localizeTag, {elements, expressions}),
      ast.sourceSpan,
    );
  }
  createTaggedTemplateExpression(tag, template) {
    return this.downlevelTaggedTemplates
      ? this.createES5TaggedTemplateFunctionCall(tag, template)
      : this.factory.createTaggedTemplate(tag, template);
  }
  /**
   * Translate the tagged template literal into a call that is compatible with ES5, using the
   * imported `__makeTemplateObject` helper for ES5 formatted output.
   */
  createES5TaggedTemplateFunctionCall(tagHandler, {elements, expressions}) {
    // Ensure that the `__makeTemplateObject()` helper has been imported.
    const __makeTemplateObjectHelper = this.imports.addImport({
      exportModuleSpecifier: 'tslib',
      exportSymbolName: '__makeTemplateObject',
      requestedFile: this.contextFile,
    });
    // Collect up the cooked and raw strings into two separate arrays.
    const cooked = [];
    const raw = [];
    for (const element of elements) {
      cooked.push(
        this.factory.setSourceMapRange(this.factory.createLiteral(element.cooked), element.range),
      );
      raw.push(
        this.factory.setSourceMapRange(this.factory.createLiteral(element.raw), element.range),
      );
    }
    // Generate the helper call in the form: `__makeTemplateObject([cooked], [raw]);`
    const templateHelperCall = this.factory.createCallExpression(
      __makeTemplateObjectHelper,
      [this.factory.createArrayLiteral(cooked), this.factory.createArrayLiteral(raw)],
      /* pure */ false,
    );
    // Finally create the tagged handler call in the form:
    // `tag(__makeTemplateObject([cooked], [raw]), ...expressions);`
    return this.factory.createCallExpression(
      tagHandler,
      [templateHelperCall, ...expressions],
      /* pure */ false,
    );
  }
  visitExternalExpr(ast, _context) {
    if (ast.value.name === null) {
      if (ast.value.moduleName === null) {
        throw new Error('Invalid import without name nor moduleName');
      }
      return this.imports.addImport({
        exportModuleSpecifier: ast.value.moduleName,
        exportSymbolName: null,
        requestedFile: this.contextFile,
      });
    }
    // If a moduleName is specified, this is a normal import. If there's no module name, it's a
    // reference to a global/ambient symbol.
    if (ast.value.moduleName !== null) {
      // This is a normal import. Find the imported module.
      return this.imports.addImport({
        exportModuleSpecifier: ast.value.moduleName,
        exportSymbolName: ast.value.name,
        requestedFile: this.contextFile,
      });
    } else {
      // The symbol is ambient, so just reference it.
      return this.factory.createIdentifier(ast.value.name);
    }
  }
  visitConditionalExpr(ast, context) {
    return this.factory.createConditional(
      ast.condition.visitExpression(this, context),
      ast.trueCase.visitExpression(this, context),
      ast.falseCase.visitExpression(this, context),
    );
  }
  visitDynamicImportExpr(ast, context) {
    const urlExpression =
      typeof ast.url === 'string'
        ? this.factory.createLiteral(ast.url)
        : ast.url.visitExpression(this, context);
    if (ast.urlComment) {
      this.factory.attachComments(urlExpression, [o.leadingComment(ast.urlComment, true)]);
    }
    return this.factory.createDynamicImport(urlExpression);
  }
  visitNotExpr(ast, context) {
    return this.factory.createUnaryExpression('!', ast.condition.visitExpression(this, context));
  }
  visitFunctionExpr(ast, context) {
    return this.factory.createFunctionExpression(
      ast.name ?? null,
      ast.params.map((param) => param.name),
      this.factory.createBlock(this.visitStatements(ast.statements, context)),
    );
  }
  visitArrowFunctionExpr(ast, context) {
    return this.factory.createArrowFunctionExpression(
      ast.params.map((param) => param.name),
      Array.isArray(ast.body)
        ? this.factory.createBlock(this.visitStatements(ast.body, context))
        : ast.body.visitExpression(this, context),
    );
  }
  visitBinaryOperatorExpr(ast, context) {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${o.BinaryOperator[ast.operator]}`);
    }
    const operator = BINARY_OPERATORS.get(ast.operator);
    if (ast.isAssignment()) {
      return this.factory.createAssignment(
        ast.lhs.visitExpression(this, context),
        operator,
        ast.rhs.visitExpression(this, context),
      );
    }
    return this.factory.createBinaryExpression(
      ast.lhs.visitExpression(this, context),
      operator,
      ast.rhs.visitExpression(this, context),
    );
  }
  visitReadPropExpr(ast, context) {
    return this.factory.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
  }
  visitReadKeyExpr(ast, context) {
    return this.factory.createElementAccess(
      ast.receiver.visitExpression(this, context),
      ast.index.visitExpression(this, context),
    );
  }
  visitLiteralArrayExpr(ast, context) {
    return this.factory.createArrayLiteral(
      ast.entries.map((expr) =>
        this.setSourceMapRange(expr.visitExpression(this, context), ast.sourceSpan),
      ),
    );
  }
  visitLiteralMapExpr(ast, context) {
    const properties = ast.entries.map((entry) => {
      return {
        propertyName: entry.key,
        quoted: entry.quoted,
        value: entry.value.visitExpression(this, context),
      };
    });
    return this.setSourceMapRange(this.factory.createObjectLiteral(properties), ast.sourceSpan);
  }
  visitCommaExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitTemplateLiteralElementExpr(ast, context) {
    throw new Error('Method not implemented');
  }
  visitWrappedNodeExpr(ast, _context) {
    this.recordWrappedNode(ast);
    return ast.node;
  }
  visitTypeofExpr(ast, context) {
    return this.factory.createTypeOfExpression(ast.expr.visitExpression(this, context));
  }
  visitVoidExpr(ast, context) {
    return this.factory.createVoidExpression(ast.expr.visitExpression(this, context));
  }
  visitUnaryOperatorExpr(ast, context) {
    if (!UNARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown unary operator: ${o.UnaryOperator[ast.operator]}`);
    }
    return this.factory.createUnaryExpression(
      UNARY_OPERATORS.get(ast.operator),
      ast.expr.visitExpression(this, context),
    );
  }
  visitParenthesizedExpr(ast, context) {
    const result = ast.expr.visitExpression(this, context);
    return this.factory.createParenthesizedExpression(result);
  }
  visitStatements(statements, context) {
    return statements
      .map((stmt) => stmt.visitStatement(this, context))
      .filter((stmt) => stmt !== undefined);
  }
  setSourceMapRange(ast, span) {
    return this.factory.setSourceMapRange(ast, createRange(span));
  }
  attachComments(statement, leadingComments) {
    if (leadingComments !== undefined) {
      this.factory.attachComments(statement, leadingComments);
    }
    return statement;
  }
  getTemplateLiteralFromAst(ast, context) {
    return {
      elements: ast.elements.map((e) =>
        createTemplateElement({
          cooked: e.text,
          raw: e.rawText,
          range: e.sourceSpan ?? ast.sourceSpan,
        }),
      ),
      expressions: ast.expressions.map((e) => e.visitExpression(this, context)),
    };
  }
}
/**
 * Convert a cooked-raw string object into one that can be used by the AST factories.
 */
function createTemplateElement({cooked, raw, range}) {
  return {cooked, raw, range: createRange(range)};
}
/**
 * Convert an OutputAST source-span into a range that can be used by the AST factories.
 */
function createRange(span) {
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
//# sourceMappingURL=translator.js.map
