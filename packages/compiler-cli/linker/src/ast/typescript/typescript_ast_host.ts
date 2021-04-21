/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {FatalLinkerError} from '../../fatal_linker_error';
import {AstHost, Range} from '../ast_host';
import {assert} from '../utils';


/**
 * This implementation of `AstHost` is able to get information from TypeScript AST nodes.
 *
 * This host is not actually used at runtime in the current code.
 *
 * It is implemented here to ensure that the `AstHost` abstraction is not unfairly skewed towards
 * the Babel implementation. It could also provide a basis for a 3rd TypeScript compiler plugin to
 * do linking in the future.
 */
export class TypeScriptAstHost implements AstHost<ts.Expression> {
  getSymbolName(node: ts.Expression): string|null {
    if (ts.isIdentifier(node)) {
      return node.text;
    } else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
      return node.name.text;
    } else {
      return null;
    }
  }

  isStringLiteral = ts.isStringLiteral;

  parseStringLiteral(str: ts.Expression): string {
    assert(str, this.isStringLiteral, 'a string literal');
    return str.text;
  }

  isNumericLiteral = ts.isNumericLiteral;

  parseNumericLiteral(num: ts.Expression): number {
    assert(num, this.isNumericLiteral, 'a numeric literal');
    return parseInt(num.text);
  }

  isBooleanLiteral(node: ts.Expression): boolean {
    return isBooleanLiteral(node) || isMinifiedBooleanLiteral(node);
  }

  parseBooleanLiteral(bool: ts.Expression): boolean {
    if (isBooleanLiteral(bool)) {
      return bool.kind === ts.SyntaxKind.TrueKeyword;
    } else if (isMinifiedBooleanLiteral(bool)) {
      return !(+bool.operand.text);
    } else {
      throw new FatalLinkerError(bool, 'Unsupported syntax, expected a boolean literal.');
    }
  }

  isArrayLiteral = ts.isArrayLiteralExpression;

  parseArrayLiteral(array: ts.Expression): ts.Expression[] {
    assert(array, this.isArrayLiteral, 'an array literal');
    return array.elements.map(element => {
      assert(element, isNotEmptyElement, 'element in array not to be empty');
      assert(element, isNotSpreadElement, 'element in array not to use spread syntax');
      return element;
    });
  }

  isObjectLiteral = ts.isObjectLiteralExpression;

  parseObjectLiteral(obj: ts.Expression): Map<string, ts.Expression> {
    assert(obj, this.isObjectLiteral, 'an object literal');

    const result = new Map<string, ts.Expression>();
    for (const property of obj.properties) {
      assert(property, ts.isPropertyAssignment, 'a property assignment');
      assert(property.name, isPropertyName, 'a property name');
      result.set(property.name.text, property.initializer);
    }
    return result;
  }

  isFunctionExpression(node: ts.Expression): node is ts.FunctionExpression|ts.ArrowFunction {
    return ts.isFunctionExpression(node) || ts.isArrowFunction(node);
  }

  parseReturnValue(fn: ts.Expression): ts.Expression {
    assert(fn, this.isFunctionExpression, 'a function');
    if (!ts.isBlock(fn.body)) {
      // it is a simple array function expression: `(...) => expr`
      return fn.body;
    }

    // it is a function (arrow or normal) with a body. E.g.:
    // * `(...) => { stmt; ... }`
    // * `function(...) { stmt; ... }`

    if (fn.body.statements.length !== 1) {
      throw new FatalLinkerError(
          fn.body, 'Unsupported syntax, expected a function body with a single return statement.');
    }
    const stmt = fn.body.statements[0];
    assert(stmt, ts.isReturnStatement, 'a function body with a single return statement');
    if (stmt.expression === undefined) {
      throw new FatalLinkerError(stmt, 'Unsupported syntax, expected function to return a value.');
    }

    return stmt.expression;
  }

  isCallExpression = ts.isCallExpression;

  parseCallee(call: ts.Expression): ts.Expression {
    assert(call, ts.isCallExpression, 'a call expression');
    return call.expression;
  }

  parseArguments(call: ts.Expression): ts.Expression[] {
    assert(call, ts.isCallExpression, 'a call expression');
    return call.arguments.map(arg => {
      assert(arg, isNotSpreadElement, 'argument not to use spread syntax');
      return arg;
    });
  }

  getRange(node: ts.Expression): Range {
    const file = node.getSourceFile();
    if (file === undefined) {
      throw new FatalLinkerError(
          node, 'Unable to read range for node - it is missing parent information.');
    }
    const startPos = node.getStart();
    const endPos = node.getEnd();
    const {line: startLine, character: startCol} = ts.getLineAndCharacterOfPosition(file, startPos);
    return {startLine, startCol, startPos, endPos};
  }
}

/**
 * Return true if the expression does not represent an empty element in an array literal.
 * For example in `[,foo]` the first element is "empty".
 */
function isNotEmptyElement(e: ts.Expression|ts.SpreadElement|
                           ts.OmittedExpression): e is ts.Expression|ts.SpreadElement {
  return !ts.isOmittedExpression(e);
}

/**
 * Return true if the expression is not a spread element of an array literal.
 * For example in `[x, ...rest]` the `...rest` expression is a spread element.
 */
function isNotSpreadElement(e: ts.Expression|ts.SpreadElement): e is ts.Expression {
  return !ts.isSpreadElement(e);
}

/**
 * Return true if the expression can be considered a text based property name.
 */
function isPropertyName(e: ts.PropertyName): e is ts.Identifier|ts.StringLiteral|ts.NumericLiteral {
  return ts.isIdentifier(e) || ts.isStringLiteral(e) || ts.isNumericLiteral(e);
}

/**
 * Return true if the node is either `true` or `false` literals.
 */
function isBooleanLiteral(node: ts.Expression): node is ts.TrueLiteral|ts.FalseLiteral {
  return node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword;
}

type MinifiedBooleanLiteral = ts.PrefixUnaryExpression&{operand: ts.NumericLiteral};

/**
 * Return true if the node is either `!0` or `!1`.
 */
function isMinifiedBooleanLiteral(node: ts.Expression): node is MinifiedBooleanLiteral {
  return ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken &&
      ts.isNumericLiteral(node.operand) && (node.operand.text === '0' || node.operand.text === '1');
}
