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
  LeadingComment,
  ObjectLiteralProperty,
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

const UNARY_OPERATORS: Record<UnaryOperator, ts.PrefixUnaryOperator> = /* @__PURE__ */ (() => ({
  '+': ts.SyntaxKind.PlusToken,
  '-': ts.SyntaxKind.MinusToken,
  '!': ts.SyntaxKind.ExclamationToken,
}))();

const BINARY_OPERATORS: Record<BinaryOperator, ts.BinaryOperator> = /* @__PURE__ */ (() => ({
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
  'in': ts.SyntaxKind.InKeyword,
}))();

const VAR_TYPES: Record<VariableDeclarationType, ts.NodeFlags> = /* @__PURE__ */ (() => ({
  'const': ts.NodeFlags.Const,
  'let': ts.NodeFlags.Let,
  'var': ts.NodeFlags.None,
}))();

/**
 * A TypeScript flavoured implementation of the AstFactory.
 */
export class TypeScriptAstFactory implements AstFactory<ts.Statement, ts.Expression> {
  private externalSourceFiles = new Map<string, ts.SourceMapSource>();

  constructor(private annotateForClosureCompiler: boolean) {}

  attachComments = attachComments;

  createArrayLiteral = ts.factory.createArrayLiteralExpression;

  createAssignment(target: ts.Expression, value: ts.Expression): ts.Expression {
    return ts.factory.createBinaryExpression(target, ts.SyntaxKind.EqualsToken, value);
  }

  createBinaryExpression(
    leftOperand: ts.Expression,
    operator: BinaryOperator,
    rightOperand: ts.Expression,
  ): ts.Expression {
    return ts.factory.createBinaryExpression(leftOperand, BINARY_OPERATORS[operator], rightOperand);
  }

  createBlock(body: ts.Statement[]): ts.Statement {
    return ts.factory.createBlock(body);
  }

  createCallExpression(callee: ts.Expression, args: ts.Expression[], pure: boolean): ts.Expression {
    const call = ts.factory.createCallExpression(callee, undefined, args);
    if (pure) {
      ts.addSyntheticLeadingComment(
        call,
        ts.SyntaxKind.MultiLineCommentTrivia,
        this.annotateForClosureCompiler ? PureAnnotation.CLOSURE : PureAnnotation.TERSER,
        /* trailing newline */ false,
      );
    }
    return call;
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
    parameters: string[],
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
      parameters.map((param) => ts.factory.createParameterDeclaration(undefined, undefined, param)),
      undefined,
      body,
    );
  }

  createFunctionExpression(
    functionName: string | null,
    parameters: string[],
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
      parameters.map((param) => ts.factory.createParameterDeclaration(undefined, undefined, param)),
      undefined,
      body,
    );
  }

  createArrowFunctionExpression(
    parameters: string[],
    body: ts.Statement | ts.Expression,
  ): ts.Expression {
    if (ts.isStatement(body) && !ts.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts.SyntaxKind[body.kind]}.`);
    }

    return ts.factory.createArrowFunction(
      undefined,
      undefined,
      parameters.map((param) => ts.factory.createParameterDeclaration(undefined, undefined, param)),
      undefined,
      undefined,
      body,
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
      properties.map((prop) =>
        ts.factory.createPropertyAssignment(
          prop.quoted
            ? ts.factory.createStringLiteral(prop.propertyName)
            : ts.factory.createIdentifier(prop.propertyName),
          prop.value,
        ),
      ),
    );
  }

  createParenthesizedExpression = ts.factory.createParenthesizedExpression;

  createPropertyAccess = ts.factory.createPropertyAccessExpression;

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
    return ts.factory.createPrefixUnaryExpression(UNARY_OPERATORS[operator], operand);
  }

  createVariableDeclaration(
    variableName: string,
    initializer: ts.Expression | null,
    type: VariableDeclarationType,
  ): ts.Statement {
    return ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            variableName,
            undefined,
            undefined,
            initializer ?? undefined,
          ),
        ],
        VAR_TYPES[type],
      ),
    );
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
