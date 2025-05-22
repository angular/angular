/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {types as t} from '@babel/core';

import {assert} from '../../../../linker';
import {
  AstFactory,
  BinaryOperator,
  LeadingComment,
  ObjectLiteralProperty,
  SourceMapRange,
  TemplateLiteral,
  VariableDeclarationType,
} from '../../../../src/ngtsc/translator/src/api/ast_factory';

/**
 * A Babel flavored implementation of the AstFactory.
 */
export class BabelAstFactory implements AstFactory<t.Statement, t.Expression> {
  constructor(
    /** The absolute path to the source file being compiled. */
    private sourceUrl: string,
  ) {}

  attachComments(statement: t.Statement | t.Expression, leadingComments: LeadingComment[]): void {
    // We must process the comments in reverse because `t.addComment()` will add new ones in front.
    for (let i = leadingComments.length - 1; i >= 0; i--) {
      const comment = leadingComments[i];
      t.addComment(statement, 'leading', comment.toString(), !comment.multiline);
    }
  }

  createArrayLiteral = t.arrayExpression;

  createAssignment(target: t.Expression, value: t.Expression): t.Expression {
    assert(target, isLExpression, 'must be a left hand side expression');
    return t.assignmentExpression('=', target, value);
  }

  createBinaryExpression(
    leftOperand: t.Expression,
    operator: BinaryOperator,
    rightOperand: t.Expression,
  ): t.Expression {
    switch (operator) {
      case '&&':
      case '||':
      case '??':
        return t.logicalExpression(operator, leftOperand, rightOperand);
      default:
        return t.binaryExpression(operator, leftOperand, rightOperand);
    }
  }

  createBlock = t.blockStatement;

  createCallExpression(callee: t.Expression, args: t.Expression[], pure: boolean): t.Expression {
    const call = t.callExpression(callee, args);
    if (pure) {
      t.addComment(call, 'leading', ' @__PURE__ ', /* line */ false);
    }
    return call;
  }

  createConditional = t.conditionalExpression;

  createElementAccess(expression: t.Expression, element: t.Expression): t.Expression {
    return t.memberExpression(expression, element, /* computed */ true);
  }

  createExpressionStatement = t.expressionStatement;

  createFunctionDeclaration(
    functionName: string,
    parameters: string[],
    body: t.Statement,
  ): t.Statement {
    assert(body, t.isBlockStatement, 'a block');
    return t.functionDeclaration(
      t.identifier(functionName),
      parameters.map((param) => t.identifier(param)),
      body,
    );
  }

  createArrowFunctionExpression(
    parameters: string[],
    body: t.Statement | t.Expression,
  ): t.Expression {
    if (t.isStatement(body)) {
      assert(body, t.isBlockStatement, 'a block');
    }
    return t.arrowFunctionExpression(
      parameters.map((param) => t.identifier(param)),
      body,
    );
  }

  createFunctionExpression(
    functionName: string | null,
    parameters: string[],
    body: t.Statement,
  ): t.Expression {
    assert(body, t.isBlockStatement, 'a block');
    const name = functionName !== null ? t.identifier(functionName) : null;
    return t.functionExpression(
      name,
      parameters.map((param) => t.identifier(param)),
      body,
    );
  }

  createIdentifier = t.identifier;

  createIfStatement = t.ifStatement;

  createDynamicImport(url: string | t.Expression): t.Expression {
    return this.createCallExpression(
      t.import(),
      [typeof url === 'string' ? t.stringLiteral(url) : url],
      false /* pure */,
    );
  }

  createLiteral(value: string | number | boolean | null | undefined): t.Expression {
    if (typeof value === 'string') {
      return t.stringLiteral(value);
    } else if (typeof value === 'number') {
      return t.numericLiteral(value);
    } else if (typeof value === 'boolean') {
      return t.booleanLiteral(value);
    } else if (value === undefined) {
      return t.identifier('undefined');
    } else if (value === null) {
      return t.nullLiteral();
    } else {
      throw new Error(`Invalid literal: ${value} (${typeof value})`);
    }
  }

  createNewExpression = t.newExpression;

  createObjectLiteral(properties: ObjectLiteralProperty<t.Expression>[]): t.Expression {
    return t.objectExpression(
      properties.map((prop) => {
        const key = prop.quoted
          ? t.stringLiteral(prop.propertyName)
          : t.identifier(prop.propertyName);
        return t.objectProperty(key, prop.value);
      }),
    );
  }

  createParenthesizedExpression = t.parenthesizedExpression;

  createPropertyAccess(expression: t.Expression, propertyName: string): t.Expression {
    return t.memberExpression(expression, t.identifier(propertyName), /* computed */ false);
  }

  createReturnStatement = t.returnStatement;

  createTaggedTemplate(tag: t.Expression, template: TemplateLiteral<t.Expression>): t.Expression {
    return t.taggedTemplateExpression(tag, this.createTemplateLiteral(template));
  }

  createTemplateLiteral(template: TemplateLiteral<t.Expression>): t.TemplateLiteral {
    const elements = template.elements.map((element, i) =>
      this.setSourceMapRange(
        t.templateElement(element, i === template.elements.length - 1),
        element.range,
      ),
    );
    return t.templateLiteral(elements, template.expressions);
  }

  createThrowStatement = t.throwStatement;

  createTypeOfExpression(expression: t.Expression): t.Expression {
    return t.unaryExpression('typeof', expression);
  }

  createVoidExpression(expression: t.Expression): t.Expression {
    return t.unaryExpression('void', expression);
  }

  createUnaryExpression = t.unaryExpression;

  createVariableDeclaration(
    variableName: string,
    initializer: t.Expression | null,
    type: VariableDeclarationType,
  ): t.Statement {
    return t.variableDeclaration(type, [
      t.variableDeclarator(t.identifier(variableName), initializer),
    ]);
  }

  setSourceMapRange<T extends t.Statement | t.Expression | t.TemplateElement>(
    node: T,
    sourceMapRange: SourceMapRange | null,
  ): T {
    if (sourceMapRange === null) {
      return node;
    }
    node.loc = {
      // Add in the filename so that we can map to external template files.
      // Note that Babel gets confused if you specify a filename when it is the original source
      // file. This happens when the template is inline, in which case just use `undefined`.
      filename: sourceMapRange.url !== this.sourceUrl ? sourceMapRange.url : undefined,
      start: {
        line: sourceMapRange.start.line + 1, // lines are 1-based in Babel.
        column: sourceMapRange.start.column,
      },
      end: {
        line: sourceMapRange.end.line + 1, // lines are 1-based in Babel.
        column: sourceMapRange.end.column,
      },
    } as any; // Needed because the Babel typings for `loc` don't include `filename`.
    node.start = sourceMapRange.start.offset;
    node.end = sourceMapRange.end.offset;

    return node;
  }
}

function isLExpression(expr: t.Expression): expr is Extract<t.LVal, t.Expression> {
  // Some LVal types are not expressions, which prevents us from using `t.isLVal()`
  // directly with `assert()`.
  return t.isLVal(expr);
}
