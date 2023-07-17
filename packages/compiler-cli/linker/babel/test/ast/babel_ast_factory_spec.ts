/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {leadingComment} from '@angular/compiler';
import {types as t} from '@babel/core';
import _generate from '@babel/generator';
import _template from '@babel/template';

import {BabelAstFactory} from '../../src/ast/babel_ast_factory';

// Babel is a CJS package and misuses the `default` named binding:
// https://github.com/babel/babel/issues/15269.
const generate = (_generate as any)['default'] as typeof _generate;

// Exposes shorthands for the `expression` and `statement`
// methods exposed by `@babel/template`.
const expression = _template.expression;
const statement = _template.statement;

describe('BabelAstFactory', () => {
  let factory: BabelAstFactory;
  beforeEach(() => factory = new BabelAstFactory('/original.ts'));

  describe('attachComments()', () => {
    it('should add the comments to the given statement', () => {
      const stmt = statement.ast`x = 10;`;
      factory.attachComments(
          stmt, [leadingComment('comment 1', true), leadingComment('comment 2', false)]);

      expect(generate(stmt).code).toEqual([
        '/* comment 1 */',
        '//comment 2',
        'x = 10;',
      ].join('\n'));
    });
  });

  describe('createArrayLiteral()', () => {
    it('should create an array node containing the provided expressions', () => {
      const expr1 = expression.ast`42`;
      const expr2 = expression.ast`"moo"`;

      const array = factory.createArrayLiteral([expr1, expr2]);
      expect(generate(array).code).toEqual('[42, "moo"]');
    });
  });

  describe('createAssignment()', () => {
    it('should create an assignment node using the target and value expressions', () => {
      const target = expression.ast`x`;
      const value = expression.ast`42`;
      const assignment = factory.createAssignment(target, value);
      expect(generate(assignment).code).toEqual('x = 42');
    });
  });

  describe('createBinaryExpression()', () => {
    it('should create a binary operation node using the left and right expressions', () => {
      const left = expression.ast`17`;
      const right = expression.ast`42`;
      const expr = factory.createBinaryExpression(left, '+', right);
      expect(generate(expr).code).toEqual('17 + 42');
    });

    it('should create a binary operation node for logical operators', () => {
      const left = expression.ast`17`;
      const right = expression.ast`42`;
      const expr = factory.createBinaryExpression(left, '&&', right);
      expect(t.isLogicalExpression(expr)).toBe(true);
      expect(generate(expr).code).toEqual('17 && 42');
    });
  });

  describe('createBlock()', () => {
    it('should create a block statement containing the given statements', () => {
      const stmt1 = statement.ast`x = 10`;
      const stmt2 = statement.ast`y = 20`;
      const block = factory.createBlock([stmt1, stmt2]);
      expect(generate(block).code).toEqual([
        '{',
        '  x = 10;',
        '  y = 20;',
        '}',
      ].join('\n'));
    });
  });

  describe('createCallExpression()', () => {
    it('should create a call on the `callee` with the given `args`', () => {
      const callee = expression.ast`foo`;
      const arg1 = expression.ast`42`;
      const arg2 = expression.ast`"moo"`;
      const call = factory.createCallExpression(callee, [arg1, arg2], false);
      expect(generate(call).code).toEqual('foo(42, "moo")');
    });

    it('should create a call marked with a PURE comment if `pure` is true', () => {
      const callee = expression.ast`foo`;
      const arg1 = expression.ast`42`;
      const arg2 = expression.ast`"moo"`;
      const call = factory.createCallExpression(callee, [arg1, arg2], true);
      expect(generate(call).code).toEqual('/* @__PURE__ */foo(42, "moo")');
    });
  });

  describe('createConditional()', () => {
    it('should create a condition expression', () => {
      const test = expression.ast`!test`;
      const thenExpr = expression.ast`42`;
      const elseExpr = expression.ast`"moo"`;
      const conditional = factory.createConditional(test, thenExpr, elseExpr);
      expect(generate(conditional).code).toEqual('!test ? 42 : "moo"');
    });
  });

  describe('createElementAccess()', () => {
    it('should create an expression accessing the element of an array/object', () => {
      const expr = expression.ast`obj`;
      const element = expression.ast`"moo"`;
      const access = factory.createElementAccess(expr, element);
      expect(generate(access).code).toEqual('obj["moo"]');
    });
  });

  describe('createExpressionStatement()', () => {
    it('should create a statement node from the given expression', () => {
      const expr = expression.ast`x = 10`;
      const stmt = factory.createExpressionStatement(expr);
      expect(t.isStatement(stmt)).toBe(true);
      expect(generate(stmt).code).toEqual('x = 10;');
    });
  });

  describe('createFunctionDeclaration()', () => {
    it('should create a function declaration node with the given name, parameters and body statements',
       () => {
         const stmts = statement.ast`{x = 10; y = 20;}`;
         const fn = factory.createFunctionDeclaration('foo', ['arg1', 'arg2'], stmts);
         expect(generate(fn).code).toEqual([
           'function foo(arg1, arg2) {',
           '  x = 10;',
           '  y = 20;',
           '}',
         ].join('\n'));
       });
  });

  describe('createFunctionExpression()', () => {
    it('should create a function expression node with the given name, parameters and body statements',
       () => {
         const stmts = statement.ast`{x = 10; y = 20;}`;
         const fn = factory.createFunctionExpression('foo', ['arg1', 'arg2'], stmts);
         expect(t.isStatement(fn)).toBe(false);
         expect(generate(fn).code).toEqual([
           'function foo(arg1, arg2) {',
           '  x = 10;',
           '  y = 20;',
           '}',
         ].join('\n'));
       });

    it('should create an anonymous function expression node if the name is null', () => {
      const stmts = statement.ast`{x = 10; y = 20;}`;
      const fn = factory.createFunctionExpression(null, ['arg1', 'arg2'], stmts);
      expect(generate(fn).code).toEqual([
        'function (arg1, arg2) {',
        '  x = 10;',
        '  y = 20;',
        '}',
      ].join('\n'));
    });
  });

  describe('createIdentifier()', () => {
    it('should create an identifier with the given name', () => {
      const id = factory.createIdentifier('someId') as t.Identifier;
      expect(t.isIdentifier(id)).toBe(true);
      expect(id.name).toEqual('someId');
    });
  });

  describe('createIfStatement()', () => {
    it('should create an if-else statement', () => {
      const test = expression.ast`!test`;
      const thenStmt = statement.ast`x = 10;`;
      const elseStmt = statement.ast`x = 42;`;
      const ifStmt = factory.createIfStatement(test, thenStmt, elseStmt);
      expect(generate(ifStmt).code).toEqual('if (!test) x = 10;else x = 42;');
    });

    it('should create an if statement if the else expression is null', () => {
      const test = expression.ast`!test`;
      const thenStmt = statement.ast`x = 10;`;
      const ifStmt = factory.createIfStatement(test, thenStmt, null);
      expect(generate(ifStmt).code).toEqual('if (!test) x = 10;');
    });
  });

  describe('createLiteral()', () => {
    it('should create a string literal', () => {
      const literal = factory.createLiteral('moo');
      expect(t.isStringLiteral(literal)).toBe(true);
      expect(generate(literal).code).toEqual('"moo"');
    });

    it('should create a number literal', () => {
      const literal = factory.createLiteral(42);
      expect(t.isNumericLiteral(literal)).toBe(true);
      expect(generate(literal).code).toEqual('42');
    });

    it('should create a number literal for `NaN`', () => {
      const literal = factory.createLiteral(NaN);
      expect(t.isNumericLiteral(literal)).toBe(true);
      expect(generate(literal).code).toEqual('NaN');
    });

    it('should create a boolean literal', () => {
      const literal = factory.createLiteral(true);
      expect(t.isBooleanLiteral(literal)).toBe(true);
      expect(generate(literal).code).toEqual('true');
    });

    it('should create an `undefined` literal', () => {
      const literal = factory.createLiteral(undefined);
      expect(t.isIdentifier(literal)).toBe(true);
      expect(generate(literal).code).toEqual('undefined');
    });

    it('should create a null literal', () => {
      const literal = factory.createLiteral(null);
      expect(t.isNullLiteral(literal)).toBe(true);
      expect(generate(literal).code).toEqual('null');
    });
  });

  describe('createNewExpression()', () => {
    it('should create a `new` operation on the constructor `expression` with the given `args`',
       () => {
         const expr = expression.ast`Foo`;
         const arg1 = expression.ast`42`;
         const arg2 = expression.ast`"moo"`;
         const call = factory.createNewExpression(expr, [arg1, arg2]);
         expect(generate(call).code).toEqual('new Foo(42, "moo")');
       });
  });

  describe('createObjectLiteral()', () => {
    it('should create an object literal node, with the given properties', () => {
      const prop1 = expression.ast`42`;
      const prop2 = expression.ast`"moo"`;
      const obj = factory.createObjectLiteral([
        {propertyName: 'prop1', value: prop1, quoted: false},
        {propertyName: 'prop2', value: prop2, quoted: true},
      ]);
      expect(generate(obj).code).toEqual([
        '{',
        '  prop1: 42,',
        '  "prop2": "moo"',
        '}',
      ].join('\n'));
    });
  });

  describe('createParenthesizedExpression()', () => {
    it('should add parentheses around the given expression', () => {
      const expr = expression.ast`a + b`;
      const paren = factory.createParenthesizedExpression(expr);
      expect(generate(paren).code).toEqual('(a + b)');
    });
  });

  describe('createPropertyAccess()', () => {
    it('should create a property access expression node', () => {
      const expr = expression.ast`obj`;
      const access = factory.createPropertyAccess(expr, 'moo');
      expect(generate(access).code).toEqual('obj.moo');
    });
  });

  describe('createReturnStatement()', () => {
    it('should create a return statement returning the given expression', () => {
      const expr = expression.ast`42`;
      const returnStmt = factory.createReturnStatement(expr);
      expect(generate(returnStmt).code).toEqual('return 42;');
    });

    it('should create a void return statement if the expression is null', () => {
      const returnStmt = factory.createReturnStatement(null);
      expect(generate(returnStmt).code).toEqual('return;');
    });
  });

  describe('createTaggedTemplate()', () => {
    it('should create a tagged template node from the tag, elements and expressions', () => {
      const elements = [
        {raw: 'raw1', cooked: 'cooked1', range: null},
        {raw: 'raw2', cooked: 'cooked2', range: null},
        {raw: 'raw3', cooked: 'cooked3', range: null},
      ];
      const expressions = [
        expression.ast`42`,
        expression.ast`"moo"`,
      ];
      const tag = expression.ast`tagFn`;
      const template = factory.createTaggedTemplate(tag, {elements, expressions});
      expect(generate(template).code).toEqual('tagFn`raw1${42}raw2${"moo"}raw3`');
    });
  });

  describe('createThrowStatement()', () => {
    it('should create a throw statement, throwing the given expression', () => {
      const expr = expression.ast`new Error("bad")`;
      const throwStmt = factory.createThrowStatement(expr);
      expect(generate(throwStmt).code).toEqual('throw new Error("bad");');
    });
  });

  describe('createTypeOfExpression()', () => {
    it('should create a typeof expression node', () => {
      const expr = expression.ast`42`;
      const typeofExpr = factory.createTypeOfExpression(expr);
      expect(generate(typeofExpr).code).toEqual('typeof 42');
    });
  });

  describe('createUnaryExpression()', () => {
    it('should create a unary expression with the operator and operand', () => {
      const expr = expression.ast`value`;
      const unaryExpr = factory.createUnaryExpression('!', expr);
      expect(generate(unaryExpr).code).toEqual('!value');
    });
  });

  describe('createVariableDeclaration()', () => {
    it('should create a variable declaration statement node for the given variable name and initializer',
       () => {
         const initializer = expression.ast`42`;
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'let');
         expect(generate(varDecl).code).toEqual('let foo = 42;');
       });

    it('should create a constant declaration statement node for the given variable name and initializer',
       () => {
         const initializer = expression.ast`42`;
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'const');
         expect(generate(varDecl).code).toEqual('const foo = 42;');
       });

    it('should create a downleveled variable declaration statement node for the given variable name and initializer',
       () => {
         const initializer = expression.ast`42`;
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'var');
         expect(generate(varDecl).code).toEqual('var foo = 42;');
       });

    it('should create an uninitialized variable declaration statement node for the given variable name and a null initializer',
       () => {
         const varDecl = factory.createVariableDeclaration('foo', null, 'let');
         expect(generate(varDecl).code).toEqual('let foo;');
       });
  });

  describe('setSourceMapRange()', () => {
    it('should attach the `sourceMapRange` to the given `node`', () => {
      const expr = expression.ast`42`;
      expect(expr.loc).toBeUndefined();
      expect(expr.start).toBeUndefined();
      expect(expr.end).toBeUndefined();

      factory.setSourceMapRange(expr, {
        start: {line: 0, column: 1, offset: 1},
        end: {line: 2, column: 3, offset: 15},
        content: '-****\n*****\n****',
        url: 'other.ts'
      });

      // Lines are 1-based in Babel.
      expect(expr.loc).toEqual({
        filename: 'other.ts',
        start: {line: 1, column: 1},
        end: {line: 3, column: 3},
      } as any);  // The typings for `loc` do not include `filename`.
      expect(expr.start).toEqual(1);
      expect(expr.end).toEqual(15);
    });

    it('should use undefined if the url is the same as the one passed to the constructor', () => {
      const expr = expression.ast`42`;
      factory.setSourceMapRange(expr, {
        start: {line: 0, column: 1, offset: 1},
        end: {line: 2, column: 3, offset: 15},
        content: '-****\n*****\n****',
        url: '/original.ts'
      });

      // Lines are 1-based in Babel.
      expect(expr.loc).toEqual({
        filename: undefined,
        start: {line: 1, column: 1},
        end: {line: 3, column: 3},
      } as any);  // The typings for `loc` do not include `filename`.
    });
  });
});
