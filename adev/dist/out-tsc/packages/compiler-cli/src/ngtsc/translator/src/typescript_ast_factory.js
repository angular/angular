/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {tsNumericExpression} from './ts_util';
/**
 * Different optimizers use different annotations on a function or method call to indicate its pure
 * status.
 */
var PureAnnotation;
(function (PureAnnotation) {
  /**
   * Closure's annotation for purity is `@pureOrBreakMyCode`, but this needs to be in a semantic
   * (jsdoc) enabled comment. Thus, the actual comment text for Closure must include the `*` that
   * turns a `/*` comment into a `/**` comment, as well as surrounding whitespace.
   */
  PureAnnotation['CLOSURE'] = '* @pureOrBreakMyCode ';
  PureAnnotation['TERSER'] = '@__PURE__';
})(PureAnnotation || (PureAnnotation = {}));
/**
 * A TypeScript flavoured implementation of the AstFactory.
 */
export class TypeScriptAstFactory {
  annotateForClosureCompiler;
  externalSourceFiles = new Map();
  UNARY_OPERATORS = /* @__PURE__ */ (() => ({
    '+': ts.SyntaxKind.PlusToken,
    '-': ts.SyntaxKind.MinusToken,
    '!': ts.SyntaxKind.ExclamationToken,
  }))();
  BINARY_OPERATORS = /* @__PURE__ */ (() => ({
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
  }))();
  VAR_TYPES = /* @__PURE__ */ (() => ({
    'const': ts.NodeFlags.Const,
    'let': ts.NodeFlags.Let,
    'var': ts.NodeFlags.None,
  }))();
  constructor(annotateForClosureCompiler) {
    this.annotateForClosureCompiler = annotateForClosureCompiler;
  }
  attachComments = attachComments;
  createArrayLiteral = ts.factory.createArrayLiteralExpression;
  createAssignment(target, operator, value) {
    return ts.factory.createBinaryExpression(target, this.BINARY_OPERATORS[operator], value);
  }
  createBinaryExpression(leftOperand, operator, rightOperand) {
    return ts.factory.createBinaryExpression(
      leftOperand,
      this.BINARY_OPERATORS[operator],
      rightOperand,
    );
  }
  createBlock(body) {
    return ts.factory.createBlock(body);
  }
  createCallExpression(callee, args, pure) {
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
  createConditional(condition, whenTrue, whenFalse) {
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
  createDynamicImport(url) {
    return ts.factory.createCallExpression(
      ts.factory.createToken(ts.SyntaxKind.ImportKeyword),
      /* type */ undefined,
      [typeof url === 'string' ? ts.factory.createStringLiteral(url) : url],
    );
  }
  createFunctionDeclaration(functionName, parameters, body) {
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
  createFunctionExpression(functionName, parameters, body) {
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
  createArrowFunctionExpression(parameters, body) {
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
  createIfStatement(condition, thenStatement, elseStatement) {
    return ts.factory.createIfStatement(condition, thenStatement, elseStatement ?? undefined);
  }
  createLiteral(value) {
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
  createNewExpression(expression, args) {
    return ts.factory.createNewExpression(expression, undefined, args);
  }
  createObjectLiteral(properties) {
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
  createReturnStatement(expression) {
    return ts.factory.createReturnStatement(expression ?? undefined);
  }
  createTaggedTemplate(tag, template) {
    return ts.factory.createTaggedTemplateExpression(
      tag,
      undefined,
      this.createTemplateLiteral(template),
    );
  }
  createTemplateLiteral(template) {
    let templateLiteral;
    const length = template.elements.length;
    const head = template.elements[0];
    if (length === 1) {
      templateLiteral = ts.factory.createNoSubstitutionTemplateLiteral(head.cooked, head.raw);
    } else {
      const spans = [];
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
  createUnaryExpression(operator, operand) {
    return ts.factory.createPrefixUnaryExpression(this.UNARY_OPERATORS[operator], operand);
  }
  createVariableDeclaration(variableName, initializer, type) {
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
        this.VAR_TYPES[type],
      ),
    );
  }
  createRegularExpressionLiteral(body, flags) {
    return ts.factory.createRegularExpressionLiteral(`/${body}/${flags ?? ''}`);
  }
  setSourceMapRange(node, sourceMapRange) {
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
export function createTemplateMiddle(cooked, raw) {
  const node = ts.factory.createTemplateHead(cooked, raw);
  node.kind = ts.SyntaxKind.TemplateMiddle;
  return node;
}
// HACK: Use this in place of `ts.createTemplateTail()`.
// Revert once https://github.com/microsoft/TypeScript/issues/35374 is fixed.
export function createTemplateTail(cooked, raw) {
  const node = ts.factory.createTemplateHead(cooked, raw);
  node.kind = ts.SyntaxKind.TemplateTail;
  return node;
}
/**
 * Attach the given `leadingComments` to the `statement` node.
 *
 * @param statement The statement that will have comments attached.
 * @param leadingComments The comments to attach to the statement.
 */
export function attachComments(statement, leadingComments) {
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
//# sourceMappingURL=typescript_ast_factory.js.map
