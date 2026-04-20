/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {
  AstFactory,
  BinaryOperator,
  BuiltInType,
  LeadingComment,
  ObjectLiteralProperty,
  Parameter,
  SourceMapRange,
  TemplateLiteral,
  UnaryOperator,
  VariableDeclarationType,
} from './api/ast_factory';
import {tsNumericExpression} from './ts_util';

/**
 * Different optimizers use different annotations on a function or method call to indicate its pure
 * status.
 */
enum PureAnnotation {
  /**
   * Closure's annotation for purity is `@pureOrBreakMyCode`, but this needs to be in a semantic
   * (jsdoc) enabled comment. Thus, the actual comment text for Closure must include the `*` that
   * turns a `/*` comment into a `/**` comment, as well as surrounding whitespace.
   */
  CLOSURE = '* @pureOrBreakMyCode ',

  TERSER = '@__PURE__',
}

/**
 * A TypeScript flavoured implementation of the AstFactory.
 */
export class TypeScriptAstFactory implements AstFactory<ts.Statement, ts.Expression, ts.TypeNode> {
  private externalSourceFiles = new Map<string, ts.SourceMapSource>();

  private readonly UNARY_OPERATORS: Record<UnaryOperator, ts.PrefixUnaryOperator> =
    /* @__PURE__ */ (() => ({
      '+': ts.SyntaxKind.PlusToken,
      '-': ts.SyntaxKind.MinusToken,
      '!': ts.SyntaxKind.ExclamationToken,
    }))();

  private readonly BINARY_OPERATORS: Record<BinaryOperator, ts.BinaryOperator> =
    /* @__PURE__ */ (() => ({
      '&&': ts.SyntaxKind.AmpersandAmpersandToken,
      '>': ts.SyntaxKind.GreaterThanToken,
      '>=': ts.SyntaxKind.GreaterThanEqualsToken,
      '&': ts.SyntaxKind.AmpersandToken,
      '|': ts.SyntaxKind.BarToken,
      '/': ts.SyntaxKind.SlashToken,
      '==': ts.SyntaxKind.EqualsEqualsToken,
      '===': ts.SyntaxKind.EqualsEqualsEqualsToken,
      '<': ts.SyntaxKind.LessThanToken,
      '<=': ts.SyntaxKind.LessThanEqualsToken,
      '-': ts.SyntaxKind.MinusToken,
      '%': ts.SyntaxKind.PercentToken,
      '*': ts.SyntaxKind.AsteriskToken,
      '**': ts.SyntaxKind.AsteriskAsteriskToken,
      '!=': ts.SyntaxKind.ExclamationEqualsToken,
      '!==': ts.SyntaxKind.ExclamationEqualsEqualsToken,
      '||': ts.SyntaxKind.BarBarToken,
      '+': ts.SyntaxKind.PlusToken,
      '??': ts.SyntaxKind.QuestionQuestionToken,
      '=': ts.SyntaxKind.EqualsToken,
      '+=': ts.SyntaxKind.PlusEqualsToken,
      '-=': ts.SyntaxKind.MinusEqualsToken,
      '*=': ts.SyntaxKind.AsteriskEqualsToken,
      '/=': ts.SyntaxKind.SlashEqualsToken,
      '%=': ts.SyntaxKind.PercentEqualsToken,
      '**=': ts.SyntaxKind.AsteriskAsteriskEqualsToken,
      '&&=': ts.SyntaxKind.AmpersandAmpersandEqualsToken,
      '||=': ts.SyntaxKind.BarBarEqualsToken,
      '??=': ts.SyntaxKind.QuestionQuestionEqualsToken,
      'in': ts.SyntaxKind.InKeyword,
      'instanceof': ts.SyntaxKind.InstanceOfKeyword,
    }))();

  private readonly VAR_TYPES: Record<VariableDeclarationType, ts.NodeFlags> =
    /* @__PURE__ */ (() => ({
      'const': ts.NodeFlags.Const,
      'let': ts.NodeFlags.Let,
      'var': ts.NodeFlags.None,
    }))();

  constructor(private annotateForClosureCompiler: boolean) {}

  attachComments = attachComments;

  createArrayLiteral = ts.factory.createArrayLiteralExpression;

  createAssignment(
    target: ts.Expression,
    operator: BinaryOperator,
    value: ts.Expression,
  ): ts.Expression {
    return ts.factory.createBinaryExpression(target, this.BINARY_OPERATORS[operator], value);
  }

  createBinaryExpression(
    leftOperand: ts.Expression,
    operator: BinaryOperator,
    rightOperand: ts.Expression,
  ): ts.Expression {
    return ts.factory.createBinaryExpression(
      leftOperand,
      this.BINARY_OPERATORS[operator],
      rightOperand,
    );
  }

  createBlock(body: ts.Statement[]): ts.Statement {
    return ts.factory.createBlock(body);
  }

  createCallChain(
    callee: ts.Expression,
    args: ts.Expression[],
    pure: boolean,
    isOptional: boolean,
  ): ts.Expression {
    const call = ts.factory.createCallChain(
      callee,
      isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
      undefined,
      args,
    );
    if (pure) {
      this.markAsPure(call);
    }
    return call;
  }

  createCallExpression(callee: ts.Expression, args: ts.Expression[], pure: boolean): ts.Expression {
    const call = ts.factory.createCallExpression(callee, undefined, args);
    if (pure) {
      this.markAsPure(call);
    }
    return call;
  }

  private markAsPure<T extends ts.Node>(node: T): T {
    return ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      this.annotateForClosureCompiler ? PureAnnotation.CLOSURE : PureAnnotation.TERSER,
      /* trailing newline */ false,
    );
  }

  createConditional(
    condition: ts.Expression,
    whenTrue: ts.Expression,
    whenFalse: ts.Expression,
  ): ts.Expression {
    return ts.factory.createConditionalExpression(
      condition,
      undefined,
      whenTrue,
      undefined,
      whenFalse,
    );
  }

  createElementAccess = ts.factory.createElementAccessExpression;

  createElementAccessChain(
    expression: ts.Expression,
    element: ts.Expression,
    isOptional: boolean,
  ): ts.Expression {
    return ts.factory.createElementAccessChain(
      expression,
      isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
      element,
    );
  }

  createExpressionStatement = ts.factory.createExpressionStatement;

  createDynamicImport(url: string | ts.Expression) {
    return ts.factory.createCallExpression(
      ts.factory.createToken(ts.SyntaxKind.ImportKeyword) as ts.ImportExpression,
      /* type */ undefined,
      [typeof url === 'string' ? ts.factory.createStringLiteral(url) : url],
    );
  }

  createFunctionDeclaration(
    functionName: string,
    parameters: Parameter<ts.TypeNode>[],
    body: ts.Statement,
  ): ts.Statement {
    if (!ts.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts.SyntaxKind[body.kind]}.`);
    }
    return ts.factory.createFunctionDeclaration(
      undefined,
      undefined,
      functionName,
      undefined,
      parameters.map((param) => this.createParameter(param)),
      undefined,
      body,
    );
  }

  createFunctionExpression(
    functionName: string | null,
    parameters: Parameter<ts.TypeNode>[],
    body: ts.Statement,
  ): ts.Expression {
    if (!ts.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts.SyntaxKind[body.kind]}.`);
    }
    return ts.factory.createFunctionExpression(
      undefined,
      undefined,
      functionName ?? undefined,
      undefined,
      parameters.map((param) => this.createParameter(param)),
      undefined,
      body,
    );
  }

  createArrowFunctionExpression(
    parameters: Parameter<ts.TypeNode>[],
    body: ts.Statement | ts.Expression,
  ): ts.Expression {
    if (ts.isStatement(body) && !ts.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts.SyntaxKind[body.kind]}.`);
    }

    return ts.factory.createArrowFunction(
      undefined,
      undefined,
      parameters.map((param) => this.createParameter(param)),
      undefined,
      undefined,
      body,
    );
  }

  private createParameter(param: Parameter<ts.TypeNode>): ts.ParameterDeclaration {
    return ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      param.name,
      undefined,
      param.type ?? undefined,
    );
  }

  createIdentifier = ts.factory.createIdentifier;

  createIfStatement(
    condition: ts.Expression,
    thenStatement: ts.Statement,
    elseStatement: ts.Statement | null,
  ): ts.Statement {
    return ts.factory.createIfStatement(condition, thenStatement, elseStatement ?? undefined);
  }

  createLiteral(value: string | number | boolean | null | undefined): ts.Expression {
    if (value === undefined) {
      return ts.factory.createIdentifier('undefined');
    } else if (value === null) {
      return ts.factory.createNull();
    } else if (typeof value === 'boolean') {
      return value ? ts.factory.createTrue() : ts.factory.createFalse();
    } else if (typeof value === 'number') {
      return tsNumericExpression(value);
    } else {
      return ts.factory.createStringLiteral(value);
    }
  }

  createNewExpression(expression: ts.Expression, args: ts.Expression[]): ts.Expression {
    return ts.factory.createNewExpression(expression, undefined, args);
  }

  createObjectLiteral(properties: ObjectLiteralProperty<ts.Expression>[]): ts.Expression {
    return ts.factory.createObjectLiteralExpression(
      properties.map((prop) => {
        if (prop.kind === 'spread') {
          return ts.factory.createSpreadAssignment(prop.expression);
        }

        return ts.factory.createPropertyAssignment(
          prop.quoted
            ? ts.factory.createStringLiteral(prop.propertyName)
            : ts.factory.createIdentifier(prop.propertyName),
          prop.value,
        );
      }),
    );
  }

  createParenthesizedExpression = ts.factory.createParenthesizedExpression;

  createPropertyAccess = ts.factory.createPropertyAccessExpression;

  createPropertyAccessChain(
    expression: ts.Expression,
    propertyName: string,
    isOptional: boolean,
  ): ts.Expression {
    return ts.factory.createPropertyAccessChain(
      expression,
      isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
      propertyName,
    );
  }

  createSpreadElement = ts.factory.createSpreadElement;

  createReturnStatement(expression: ts.Expression | null): ts.Statement {
    return ts.factory.createReturnStatement(expression ?? undefined);
  }

  createTaggedTemplate(
    tag: ts.Expression,
    template: TemplateLiteral<ts.Expression>,
  ): ts.Expression {
    return ts.factory.createTaggedTemplateExpression(
      tag,
      undefined,
      this.createTemplateLiteral(template),
    );
  }

  createTemplateLiteral(template: TemplateLiteral<ts.Expression>): ts.TemplateLiteral {
    let templateLiteral: ts.TemplateLiteral;
    const length = template.elements.length;
    const head = template.elements[0];
    if (length === 1) {
      templateLiteral = ts.factory.createNoSubstitutionTemplateLiteral(head.cooked, head.raw);
    } else {
      const spans: ts.TemplateSpan[] = [];
      // Create the middle parts
      for (let i = 1; i < length - 1; i++) {
        const {cooked, raw, range} = template.elements[i];
        const middle = createTemplateMiddle(cooked, raw);
        if (range !== null) {
          this.setSourceMapRange(middle, range);
        }
        spans.push(ts.factory.createTemplateSpan(template.expressions[i - 1], middle));
      }
      // Create the tail part
      const resolvedExpression = template.expressions[length - 2];
      const templatePart = template.elements[length - 1];
      const templateTail = createTemplateTail(templatePart.cooked, templatePart.raw);
      if (templatePart.range !== null) {
        this.setSourceMapRange(templateTail, templatePart.range);
      }
      spans.push(ts.factory.createTemplateSpan(resolvedExpression, templateTail));
      // Put it all together
      templateLiteral = ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(head.cooked, head.raw),
        spans,
      );
    }
    if (head.range !== null) {
      this.setSourceMapRange(templateLiteral, head.range);
    }
    return templateLiteral;
  }

  createThrowStatement = ts.factory.createThrowStatement;

  createTypeOfExpression = ts.factory.createTypeOfExpression;

  createVoidExpression = ts.factory.createVoidExpression;

  createUnaryExpression(operator: UnaryOperator, operand: ts.Expression): ts.Expression {
    return ts.factory.createPrefixUnaryExpression(this.UNARY_OPERATORS[operator], operand);
  }

  createVariableDeclaration(
    variableName: string,
    initializer: ts.Expression | null,
    variableType: VariableDeclarationType,
    type: ts.TypeNode | null,
  ): ts.Statement {
    return ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            variableName,
            undefined,
            type ?? undefined,
            initializer ?? undefined,
          ),
        ],
        this.VAR_TYPES[variableType],
      ),
    );
  }

  createRegularExpressionLiteral(body: string, flags: string | null): ts.Expression {
    return ts.factory.createRegularExpressionLiteral(`/${body}/${flags ?? ''}`);
  }

  setSourceMapRange<T extends ts.Node>(node: T, sourceMapRange: SourceMapRange | null): T {
    if (sourceMapRange === null) {
      return node;
    }

    const url = sourceMapRange.url;
    if (!this.externalSourceFiles.has(url)) {
      this.externalSourceFiles.set(
        url,
        ts.createSourceMapSource(url, sourceMapRange.content, (pos) => pos),
      );
    }
    const source = this.externalSourceFiles.get(url);
    ts.setSourceMapRange(node, {
      pos: sourceMapRange.start.offset,
      end: sourceMapRange.end.offset,
      source,
    });
    return node;
  }

  createBuiltInType(type: BuiltInType): ts.TypeNode {
    switch (type) {
      case 'any':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
      case 'boolean':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case 'number':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case 'string':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case 'function':
        return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Function'));
      case 'never':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
      case 'unknown':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    }
  }

  createExpressionType(expression: ts.Expression, typeParams: ts.TypeNode[] | null): ts.TypeNode {
    const typeName = getEntityTypeFromExpression(expression);
    return ts.factory.createTypeReferenceNode(typeName, typeParams ?? undefined);
  }

  createArrayType(elementType: ts.TypeNode): ts.TypeNode {
    return ts.factory.createArrayTypeNode(elementType);
  }

  createMapType(valueType: ts.TypeNode): ts.TypeNode {
    return ts.factory.createTypeLiteralNode([
      ts.factory.createIndexSignature(
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            'key',
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ),
        ],
        valueType,
      ),
    ]);
  }

  transplantType(type: ts.TypeNode): ts.TypeNode {
    if (
      typeof type.kind === 'number' &&
      typeof type.getSourceFile === 'function' &&
      ts.isTypeNode(type)
    ) {
      return type;
    }
    throw new Error('Attempting to transplant a type node from a non-TypeScript AST: ' + type);
  }
}

// HACK: Use this in place of `ts.createTemplateMiddle()`.
// Revert once https://github.com/microsoft/TypeScript/issues/35374 is fixed.
export function createTemplateMiddle(cooked: string, raw: string): ts.TemplateMiddle {
  const node: ts.TemplateLiteralLikeNode = ts.factory.createTemplateHead(cooked, raw);
  (node.kind as ts.SyntaxKind) = ts.SyntaxKind.TemplateMiddle;
  return node as ts.TemplateMiddle;
}

// HACK: Use this in place of `ts.createTemplateTail()`.
// Revert once https://github.com/microsoft/TypeScript/issues/35374 is fixed.
export function createTemplateTail(cooked: string, raw: string): ts.TemplateTail {
  const node: ts.TemplateLiteralLikeNode = ts.factory.createTemplateHead(cooked, raw);
  (node.kind as ts.SyntaxKind) = ts.SyntaxKind.TemplateTail;
  return node as ts.TemplateTail;
}

/**
 * Attach the given `leadingComments` to the `statement` node.
 *
 * @param statement The statement that will have comments attached.
 * @param leadingComments The comments to attach to the statement.
 */
export function attachComments(
  statement: ts.Statement | ts.Expression,
  leadingComments: LeadingComment[],
): void {
  for (const comment of leadingComments) {
    const commentKind = comment.multiline
      ? ts.SyntaxKind.MultiLineCommentTrivia
      : ts.SyntaxKind.SingleLineCommentTrivia;
    if (comment.multiline) {
      ts.addSyntheticLeadingComment(
        statement,
        commentKind,
        comment.toString(),
        comment.trailingNewline,
      );
    } else {
      for (const line of comment.toString().split('\n')) {
        ts.addSyntheticLeadingComment(statement, commentKind, line, comment.trailingNewline);
      }
    }
  }
}

function getEntityTypeFromExpression(expression: ts.Expression): ts.EntityName {
  if (ts.isIdentifier(expression)) {
    return expression;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    const left = getEntityTypeFromExpression(expression.expression);
    if (!ts.isIdentifier(expression.name)) {
      throw new Error(`Unsupported property access for type reference: ${expression.name.text}`);
    }
    return ts.factory.createQualifiedName(left, expression.name);
  }
  throw new Error(`Unsupported expression for type reference: ${ts.SyntaxKind[expression.kind]}`);
}
