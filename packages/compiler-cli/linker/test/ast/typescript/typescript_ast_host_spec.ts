/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {TypeScriptAstHost} from '../../../src/ast/typescript/typescript_ast_host';

describe('TypeScriptAstHost', () => {
  let host: TypeScriptAstHost;
  beforeEach(() => host = new TypeScriptAstHost());

  describe('getSymbolName()', () => {
    it('should return the name of an identifier', () => {
      expect(host.getSymbolName(expr('someIdentifier'))).toEqual('someIdentifier');
    });

    it('should return the name of an identifier at the end of a property access chain', () => {
      expect(host.getSymbolName(expr('a.b.c.someIdentifier'))).toEqual('someIdentifier');
    });

    it('should return null if the expression has no identifier', () => {
      expect(host.getSymbolName(expr('42'))).toBe(null);
    });
  });

  describe('isStringLiteral()', () => {
    it('should return true if the expression is a string literal', () => {
      expect(host.isStringLiteral(expr('"moo"'))).toBe(true);
      expect(host.isStringLiteral(expr('\'moo\''))).toBe(true);
    });

    it('should return false if the expression is not a string literal', () => {
      expect(host.isStringLiteral(expr('true'))).toBe(false);
      expect(host.isStringLiteral(expr('someIdentifier'))).toBe(false);
      expect(host.isStringLiteral(expr('42'))).toBe(false);
      expect(host.isStringLiteral(rhs('x = {}'))).toBe(false);
      expect(host.isStringLiteral(expr('[]'))).toBe(false);
      expect(host.isStringLiteral(expr('null'))).toBe(false);
      expect(host.isStringLiteral(expr('\'a\' + \'b\''))).toBe(false);
    });

    it('should return false if the expression is a template string', () => {
      expect(host.isStringLiteral(expr('\`moo\`'))).toBe(false);
    });
  });

  describe('parseStringLiteral()', () => {
    it('should extract the string value', () => {
      expect(host.parseStringLiteral(expr('"moo"'))).toEqual('moo');
      expect(host.parseStringLiteral(expr('\'moo\''))).toEqual('moo');
    });

    it('should error if the value is not a string literal', () => {
      expect(() => host.parseStringLiteral(expr('42')))
          .toThrowError('Unsupported syntax, expected a string literal.');
    });
  });

  describe('isNumericLiteral()', () => {
    it('should return true if the expression is a number literal', () => {
      expect(host.isNumericLiteral(expr('42'))).toBe(true);
    });

    it('should return false if the expression is not a number literal', () => {
      expect(host.isStringLiteral(expr('true'))).toBe(false);
      expect(host.isNumericLiteral(expr('"moo"'))).toBe(false);
      expect(host.isNumericLiteral(expr('\'moo\''))).toBe(false);
      expect(host.isNumericLiteral(expr('someIdentifier'))).toBe(false);
      expect(host.isNumericLiteral(rhs('x = {}'))).toBe(false);
      expect(host.isNumericLiteral(expr('[]'))).toBe(false);
      expect(host.isNumericLiteral(expr('null'))).toBe(false);
      expect(host.isNumericLiteral(expr('\'a\' + \'b\''))).toBe(false);
      expect(host.isNumericLiteral(expr('\`moo\`'))).toBe(false);
    });
  });

  describe('parseNumericLiteral()', () => {
    it('should extract the number value', () => {
      expect(host.parseNumericLiteral(expr('42'))).toEqual(42);
    });

    it('should error if the value is not a numeric literal', () => {
      expect(() => host.parseNumericLiteral(expr('"moo"')))
          .toThrowError('Unsupported syntax, expected a numeric literal.');
    });
  });

  describe('isBooleanLiteral()', () => {
    it('should return true if the expression is a boolean literal', () => {
      expect(host.isBooleanLiteral(expr('true'))).toBe(true);
      expect(host.isBooleanLiteral(expr('false'))).toBe(true);
    });

    it('should return true if the expression is a minified boolean literal', () => {
      expect(host.isBooleanLiteral(expr('!0'))).toBe(true);
      expect(host.isBooleanLiteral(expr('!1'))).toBe(true);
    });

    it('should return false if the expression is not a boolean literal', () => {
      expect(host.isBooleanLiteral(expr('"moo"'))).toBe(false);
      expect(host.isBooleanLiteral(expr('\'moo\''))).toBe(false);
      expect(host.isBooleanLiteral(expr('someIdentifier'))).toBe(false);
      expect(host.isBooleanLiteral(expr('42'))).toBe(false);
      expect(host.isBooleanLiteral(rhs('x = {}'))).toBe(false);
      expect(host.isBooleanLiteral(expr('[]'))).toBe(false);
      expect(host.isBooleanLiteral(expr('null'))).toBe(false);
      expect(host.isBooleanLiteral(expr('\'a\' + \'b\''))).toBe(false);
      expect(host.isBooleanLiteral(expr('\`moo\`'))).toBe(false);
      expect(host.isBooleanLiteral(expr('!2'))).toBe(false);
      expect(host.isBooleanLiteral(expr('~1'))).toBe(false);
    });
  });

  describe('parseBooleanLiteral()', () => {
    it('should extract the boolean value', () => {
      expect(host.parseBooleanLiteral(expr('true'))).toEqual(true);
      expect(host.parseBooleanLiteral(expr('false'))).toEqual(false);
    });

    it('should extract a minified boolean value', () => {
      expect(host.parseBooleanLiteral(expr('!0'))).toEqual(true);
      expect(host.parseBooleanLiteral(expr('!1'))).toEqual(false);
    });

    it('should error if the value is not a boolean literal', () => {
      expect(() => host.parseBooleanLiteral(expr('"moo"')))
          .toThrowError('Unsupported syntax, expected a boolean literal.');
    });
  });

  describe('isArrayLiteral()', () => {
    it('should return true if the expression is an array literal', () => {
      expect(host.isArrayLiteral(expr('[]'))).toBe(true);
      expect(host.isArrayLiteral(expr('[1, 2, 3]'))).toBe(true);
      expect(host.isArrayLiteral(expr('[[], []]'))).toBe(true);
    });

    it('should return false if the expression is not an array literal', () => {
      expect(host.isArrayLiteral(expr('"moo"'))).toBe(false);
      expect(host.isArrayLiteral(expr('\'moo\''))).toBe(false);
      expect(host.isArrayLiteral(expr('someIdentifier'))).toBe(false);
      expect(host.isArrayLiteral(expr('42'))).toBe(false);
      expect(host.isArrayLiteral(rhs('x = {}'))).toBe(false);
      expect(host.isArrayLiteral(expr('null'))).toBe(false);
      expect(host.isArrayLiteral(expr('\'a\' + \'b\''))).toBe(false);
      expect(host.isArrayLiteral(expr('\`moo\`'))).toBe(false);
    });
  });

  describe('parseArrayLiteral()', () => {
    it('should extract the expressions in the array', () => {
      const moo = jasmine.objectContaining({text: 'moo', kind: ts.SyntaxKind.StringLiteral});
      expect(host.parseArrayLiteral(expr('[]'))).toEqual([]);
      expect(host.parseArrayLiteral(expr('[\'moo\']'))).toEqual([moo]);
    });

    it('should error if there is an empty item', () => {
      expect(() => host.parseArrayLiteral(expr('[,]')))
          .toThrowError('Unsupported syntax, expected element in array not to be empty.');
    });

    it('should error if there is a spread element', () => {
      expect(() => host.parseArrayLiteral(expr('[...[0,1]]')))
          .toThrowError('Unsupported syntax, expected element in array not to use spread syntax.');
    });
  });

  describe('isObjectLiteral()', () => {
    it('should return true if the expression is an object literal', () => {
      expect(host.isObjectLiteral(rhs('x = {}'))).toBe(true);
      expect(host.isObjectLiteral(rhs('x = { foo: \'bar\' }'))).toBe(true);
    });

    it('should return false if the expression is not an object literal', () => {
      expect(host.isObjectLiteral(rhs('x = "moo"'))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = \'moo\''))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = someIdentifier'))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = 42'))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = []'))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = null'))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = \'a\' + \'b\''))).toBe(false);
      expect(host.isObjectLiteral(rhs('x = \`moo\`'))).toBe(false);
    });
  });

  describe('parseObjectLiteral()', () => {
    it('should extract the properties from the object', () => {
      const moo = jasmine.objectContaining({text: 'moo', kind: ts.SyntaxKind.StringLiteral});
      expect(host.parseObjectLiteral(rhs('x = {}'))).toEqual(new Map());
      expect(host.parseObjectLiteral(rhs('x = {a: \'moo\'}'))).toEqual(new Map([['a', moo]]));
    });

    it('should error if there is a method', () => {
      expect(() => host.parseObjectLiteral(rhs('x = { foo() {} }')))
          .toThrowError('Unsupported syntax, expected a property assignment.');
    });

    it('should error if there is a spread element', () => {
      expect(() => host.parseObjectLiteral(rhs('x = {...{ a: \'moo\' }}')))
          .toThrowError('Unsupported syntax, expected a property assignment.');
    });
  });

  describe('isFunctionExpression()', () => {
    it('should return true if the expression is a function', () => {
      expect(host.isFunctionExpression(rhs('x = function() {}'))).toBe(true);
      expect(host.isFunctionExpression(rhs('x = function foo() {}'))).toBe(true);
      expect(host.isFunctionExpression(rhs('x = () => {}'))).toBe(true);
      expect(host.isFunctionExpression(rhs('x = () => true'))).toBe(true);
    });

    it('should return false if the expression is not a function', () => {
      expect(host.isFunctionExpression(expr('[]'))).toBe(false);
      expect(host.isFunctionExpression(expr('"moo"'))).toBe(false);
      expect(host.isFunctionExpression(expr('\'moo\''))).toBe(false);
      expect(host.isFunctionExpression(expr('someIdentifier'))).toBe(false);
      expect(host.isFunctionExpression(expr('42'))).toBe(false);
      expect(host.isFunctionExpression(rhs('x = {}'))).toBe(false);
      expect(host.isFunctionExpression(expr('null'))).toBe(false);
      expect(host.isFunctionExpression(expr('\'a\' + \'b\''))).toBe(false);
      expect(host.isFunctionExpression(expr('\`moo\`'))).toBe(false);
    });
  });

  describe('parseReturnValue()', () => {
    it('should extract the return value of a function', () => {
      const moo = jasmine.objectContaining({text: 'moo', kind: ts.SyntaxKind.StringLiteral});
      expect(host.parseReturnValue(rhs('x = function() { return \'moo\'; }'))).toEqual(moo);
    });

    it('should extract the value of a simple arrow function', () => {
      const moo = jasmine.objectContaining({text: 'moo', kind: ts.SyntaxKind.StringLiteral});
      expect(host.parseReturnValue(rhs('x = () => \'moo\''))).toEqual(moo);
    });

    it('should extract the return value of an arrow function', () => {
      const moo = jasmine.objectContaining({text: 'moo', kind: ts.SyntaxKind.StringLiteral});
      expect(host.parseReturnValue(rhs('x = () => { return \'moo\' }'))).toEqual(moo);
    });

    it('should error if the body has 0 statements', () => {
      expect(() => host.parseReturnValue(rhs('x = function () { }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
      expect(() => host.parseReturnValue(rhs('x = () => { }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
    });

    it('should error if the body has more than 1 statement', () => {
      expect(() => host.parseReturnValue(rhs('x = function () { const x = 10; return x; }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
      expect(() => host.parseReturnValue(rhs('x = () => { const x = 10; return x; }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
    });

    it('should error if the single statement is not a return statement', () => {
      expect(() => host.parseReturnValue(rhs('x = function () { const x = 10; }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
      expect(() => host.parseReturnValue(rhs('x = () => { const x = 10; }')))
          .toThrowError(
              'Unsupported syntax, expected a function body with a single return statement.');
    });
  });

  describe('isCallExpression()', () => {
    it('should return true if the expression is a call expression', () => {
      expect(host.isCallExpression(expr('foo()'))).toBe(true);
      expect(host.isCallExpression(expr('foo.bar()'))).toBe(true);
      expect(host.isCallExpression(expr('(foo)(1)'))).toBe(true);
    });

    it('should return false if the expression is not a call expression', () => {
      expect(host.isCallExpression(expr('[]'))).toBe(false);
      expect(host.isCallExpression(expr('"moo"'))).toBe(false);
      expect(host.isCallExpression(expr('\'moo\''))).toBe(false);
      expect(host.isCallExpression(expr('someIdentifier'))).toBe(false);
      expect(host.isCallExpression(expr('42'))).toBe(false);
      expect(host.isCallExpression(rhs('x = {}'))).toBe(false);
      expect(host.isCallExpression(expr('null'))).toBe(false);
      expect(host.isCallExpression(expr('\'a\' + \'b\''))).toBe(false);
      expect(host.isCallExpression(expr('\`moo\`'))).toBe(false);
    });
  });

  describe('parseCallee()', () => {
    it('should return the callee expression', () => {
      const foo = jasmine.objectContaining({text: 'foo', kind: ts.SyntaxKind.Identifier});
      const bar = jasmine.objectContaining({kind: ts.SyntaxKind.PropertyAccessExpression});
      expect(host.parseCallee(expr('foo()'))).toEqual(foo);
      expect(host.parseCallee(expr('foo.bar()'))).toEqual(bar);
    });

    it('should error if the node is not a call expression', () => {
      expect(() => host.parseCallee(expr('[]')))
          .toThrowError('Unsupported syntax, expected a call expression.');
    });
  });

  describe('parseArguments()', () => {
    it('should return the arguments as an array of expressions', () => {
      const arg1 = jasmine.objectContaining({text: '12', kind: ts.SyntaxKind.NumericLiteral});
      const arg2 = jasmine.objectContaining({kind: ts.SyntaxKind.ArrayLiteralExpression});
      expect(host.parseArguments(expr('foo(12, [])'))).toEqual([arg1, arg2]);
      expect(host.parseArguments(expr('foo.bar()'))).toEqual([]);
    });

    it('should error if the node is not a call expression', () => {
      expect(() => host.parseArguments(expr('[]')))
          .toThrowError('Unsupported syntax, expected a call expression.');
    });

    it('should error if an argument uses spread syntax', () => {
      expect(() => host.parseArguments(expr('foo(1, ...[])')))
          .toThrowError('Unsupported syntax, expected argument not to use spread syntax.');
    });
  });

  describe('getRange()', () => {
    it('should extract the range from the expression', () => {
      const moo = rhs('// preamble\nx = \'moo\';');
      expect(host.getRange(moo)).toEqual({startLine: 1, startCol: 4, startPos: 16, endPos: 21});
    });

    it('should error if the nodes do not have attached parents', () => {
      const moo = rhs('// preamble\nx = \'moo\';', false);
      expect(() => host.getRange(moo))
          .toThrowError('Unable to read range for node - it is missing parent information.');
    });
  });
});

function stmt(code: string, attachParents = true): ts.Statement {
  const sf = ts.createSourceFile('test.ts', code, ts.ScriptTarget.ES2015, attachParents);
  return sf.statements[0];
}

function expr(code: string, attachParents = true): ts.Expression {
  return (stmt(code, attachParents) as ts.ExpressionStatement).expression;
}

function rhs(code: string, attachParents = true): ts.Expression {
  const e = expr(code, attachParents);
  if (!ts.isBinaryExpression(e)) {
    throw new Error('Bad test - expected a binary expression');
  }
  return e.right;
}
