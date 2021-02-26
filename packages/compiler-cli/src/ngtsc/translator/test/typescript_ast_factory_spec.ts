/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {leadingComment} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeScriptAstFactory} from '../src/typescript_ast_factory';

describe('TypeScriptAstFactory', () => {
  let factory: TypeScriptAstFactory;
  beforeEach(() => factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false));

  describe('attachComments()', () => {
    it('should add the comments to the given statement', () => {
      const {items: [stmt], generate} = setupStatements('x = 10;');
      factory.attachComments(
          stmt, [leadingComment('comment 1', true), leadingComment('comment 2', false)]);

      expect(generate(stmt)).toEqual([
        '/* comment 1 */',
        '//comment 2',
        'x = 10;',
      ].join('\n'));
    });
  });

  describe('createArrayLiteral()', () => {
    it('should create an array node containing the provided expressions', () => {
      const {items: [expr1, expr2], generate} = setupExpressions(`42`, '"moo"');
      const array = factory.createArrayLiteral([expr1, expr2]);
      expect(generate(array)).toEqual('[42, "moo"]');
    });
  });

  describe('createAssignment()', () => {
    it('should create an assignment node using the target and value expressions', () => {
      const {items: [target, value], generate} = setupExpressions(`x`, `42`);
      const assignment = factory.createAssignment(target, value);
      expect(generate(assignment)).toEqual('x = 42');
    });
  });

  describe('createBinaryExpression()', () => {
    it('should create a binary operation node using the left and right expressions', () => {
      const {items: [left, right], generate} = setupExpressions(`17`, `42`);
      const assignment = factory.createBinaryExpression(left, '+', right);
      expect(generate(assignment)).toEqual('17 + 42');
    });
  });

  describe('createBlock()', () => {
    it('should create a block statement containing the given statements', () => {
      const {items: stmts, generate} = setupStatements('x = 10; y = 20;');
      const block = factory.createBlock(stmts);
      expect(generate(block)).toEqual([
        '{',
        '    x = 10;',
        '    y = 20;',
        '}',
      ].join('\n'));
    });
  });

  describe('createCallExpression()', () => {
    it('should create a call on the `callee` with the given `args`', () => {
      const {items: [callee, arg1, arg2], generate} = setupExpressions('foo', '42', '"moo"');
      const call = factory.createCallExpression(callee, [arg1, arg2], false);
      expect(generate(call)).toEqual('foo(42, "moo")');
    });

    it('should create a call marked with a PURE comment if `pure` is true', () => {
      const {items: [callee, arg1, arg2], generate} = setupExpressions(`foo`, `42`, `"moo"`);
      const call = factory.createCallExpression(callee, [arg1, arg2], true);
      expect(generate(call)).toEqual('/*@__PURE__*/ foo(42, "moo")');
    });

    it('should create a call marked with a closure-style pure comment if `pure` is true', () => {
      factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ true);

      const {items: [callee, arg1, arg2], generate} = setupExpressions(`foo`, `42`, `"moo"`);
      const call = factory.createCallExpression(callee, [arg1, arg2], true);
      expect(generate(call)).toEqual('/** @pureOrBreakMyCode */ foo(42, "moo")');
    });
  });

  describe('createConditional()', () => {
    it('should create a condition expression', () => {
      const {items: [test, thenExpr, elseExpr], generate} =
          setupExpressions(`!test`, `42`, `"moo"`);
      const conditional = factory.createConditional(test, thenExpr, elseExpr);
      expect(generate(conditional)).toEqual('!test ? 42 : "moo"');
    });
  });

  describe('createElementAccess()', () => {
    it('should create an expression accessing the element of an array/object', () => {
      const {items: [expr, element], generate} = setupExpressions(`obj`, `"moo"`);
      const access = factory.createElementAccess(expr, element);
      expect(generate(access)).toEqual('obj["moo"]');
    });
  });

  describe('createExpressionStatement()', () => {
    it('should create a statement node from the given expression', () => {
      const {items: [expr], generate} = setupExpressions(`x = 10`);
      const stmt = factory.createExpressionStatement(expr);
      expect(ts.isExpressionStatement(stmt)).toBe(true);
      expect(generate(stmt)).toEqual('x = 10;');
    });
  });

  describe('createFunctionDeclaration()', () => {
    it('should create a function declaration node with the given name, parameters and body statements',
       () => {
         const {items: [body], generate} = setupStatements('{x = 10; y = 20;}');
         const fn = factory.createFunctionDeclaration('foo', ['arg1', 'arg2'], body);
         expect(generate(fn))
             .toEqual(
                 'function foo(arg1, arg2) { x = 10; y = 20; }',
             );
       });
  });

  describe('createFunctionExpression()', () => {
    it('should create a function expression node with the given name, parameters and body statements',
       () => {
         const {items: [body], generate} = setupStatements('{x = 10; y = 20;}');
         const fn = factory.createFunctionExpression('foo', ['arg1', 'arg2'], body);
         expect(ts.isExpressionStatement(fn)).toBe(false);
         expect(generate(fn)).toEqual('function foo(arg1, arg2) { x = 10; y = 20; }');
       });

    it('should create an anonymous function expression node if the name is null', () => {
      const {items: [body], generate} = setupStatements('{x = 10; y = 20;}');
      const fn = factory.createFunctionExpression(null, ['arg1', 'arg2'], body);
      expect(generate(fn)).toEqual('function (arg1, arg2) { x = 10; y = 20; }');
    });
  });

  describe('createIdentifier()', () => {
    it('should create an identifier with the given name', () => {
      const id = factory.createIdentifier('someId') as ts.Identifier;
      expect(ts.isIdentifier(id)).toBe(true);
      expect(id.text).toEqual('someId');
    });
  });

  describe('createIfStatement()', () => {
    it('should create an if-else statement', () => {
      const {items: [testStmt, thenStmt, elseStmt], generate} =
          setupStatements('!test;x = 10;x = 42;');
      const test = (testStmt as ts.ExpressionStatement).expression;
      const ifStmt = factory.createIfStatement(test, thenStmt, elseStmt);
      expect(generate(ifStmt)).toEqual([
        'if (!test)',
        '    x = 10;',
        'else',
        '    x = 42;',
      ].join('\n'));
    });

    it('should create an if statement if the else expression is null', () => {
      const {items: [testStmt, thenStmt], generate} = setupStatements('!test;x = 10;');
      const test = (testStmt as ts.ExpressionStatement).expression;
      const ifStmt = factory.createIfStatement(test, thenStmt, null);
      expect(generate(ifStmt)).toEqual([
        'if (!test)',
        '    x = 10;',
      ].join('\n'));
    });
  });

  describe('createLiteral()', () => {
    it('should create a string literal', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral('moo');
      expect(ts.isStringLiteral(literal)).toBe(true);
      expect(generate(literal)).toEqual('"moo"');
    });

    it('should create a number literal', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral(42);
      expect(ts.isNumericLiteral(literal)).toBe(true);
      expect(generate(literal)).toEqual('42');
    });

    it('should create a number literal for `NaN`', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral(NaN);
      expect(ts.isNumericLiteral(literal)).toBe(true);
      expect(generate(literal)).toEqual('NaN');
    });

    it('should create a boolean literal', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral(true);
      expect(ts.isToken(literal)).toBe(true);
      expect(generate(literal)).toEqual('true');
    });

    it('should create an `undefined` literal', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral(undefined);
      expect(ts.isIdentifier(literal)).toBe(true);
      expect(generate(literal)).toEqual('undefined');
    });

    it('should create a `null` literal', () => {
      const {generate} = setupStatements();
      const literal = factory.createLiteral(null);
      expect(ts.isToken(literal)).toBe(true);
      expect(generate(literal)).toEqual('null');
    });
  });

  describe('createNewExpression()', () => {
    it('should create a `new` operation on the constructor `expression` with the given `args`',
       () => {
         const {items: [expr, arg1, arg2], generate} = setupExpressions('Foo', '42', '"moo"');
         const call = factory.createNewExpression(expr, [arg1, arg2]);
         expect(generate(call)).toEqual('new Foo(42, "moo")');
       });
  });

  describe('createObjectLiteral()', () => {
    it('should create an object literal node, with the given properties', () => {
      const {items: [prop1, prop2], generate} = setupExpressions('42', '"moo"');
      const obj = factory.createObjectLiteral([
        {propertyName: 'prop1', value: prop1, quoted: false},
        {propertyName: 'prop2', value: prop2, quoted: true},
      ]);
      expect(generate(obj)).toEqual('{ prop1: 42, "prop2": "moo" }');
    });
  });

  describe('createParenthesizedExpression()', () => {
    it('should add parentheses around the given expression', () => {
      const {items: [expr], generate} = setupExpressions(`a + b`);
      const paren = factory.createParenthesizedExpression(expr);
      expect(generate(paren)).toEqual('(a + b)');
    });
  });

  describe('createPropertyAccess()', () => {
    it('should create a property access expression node', () => {
      const {items: [expr], generate} = setupExpressions(`obj`);
      const access = factory.createPropertyAccess(expr, 'moo');
      expect(generate(access)).toEqual('obj.moo');
    });
  });

  describe('createReturnStatement()', () => {
    it('should create a return statement returning the given expression', () => {
      const {items: [expr], generate} = setupExpressions(`42`);
      const returnStmt = factory.createReturnStatement(expr);
      expect(generate(returnStmt)).toEqual('return 42;');
    });

    it('should create a void return statement if the expression is null', () => {
      const {generate} = setupStatements();
      const returnStmt = factory.createReturnStatement(null);
      expect(generate(returnStmt)).toEqual('return;');
    });
  });

  describe('createTaggedTemplate()', () => {
    it('should create a tagged template node from the tag, elements and expressions', () => {
      const elements = [
        {raw: 'raw\\n1', cooked: 'raw\n1', range: null},
        {raw: 'raw\\n2', cooked: 'raw\n2', range: null},
        {raw: 'raw\\n3', cooked: 'raw\n3', range: null},
      ];
      const {items: [tag, ...expressions], generate} = setupExpressions('tagFn', '42', '"moo"');
      const template = factory.createTaggedTemplate(tag, {elements, expressions});
      expect(generate(template)).toEqual('tagFn `raw\\n1${42}raw\\n2${"moo"}raw\\n3`');
    });
  });

  describe('createThrowStatement()', () => {
    it('should create a throw statement, throwing the given expression', () => {
      const {items: [expr], generate} = setupExpressions(`new Error("bad")`);
      const throwStmt = factory.createThrowStatement(expr);
      expect(generate(throwStmt)).toEqual('throw new Error("bad");');
    });
  });

  describe('createTypeOfExpression()', () => {
    it('should create a typeof expression node', () => {
      const {items: [expr], generate} = setupExpressions(`42`);
      const typeofExpr = factory.createTypeOfExpression(expr);
      expect(generate(typeofExpr)).toEqual('typeof 42');
    });
  });

  describe('createUnaryExpression()', () => {
    it('should create a unary expression with the operator and operand', () => {
      const {items: [expr], generate} = setupExpressions(`value`);
      const unaryExpr = factory.createUnaryExpression('!', expr);
      expect(generate(unaryExpr)).toEqual('!value');
    });
  });

  describe('createVariableDeclaration()', () => {
    it('should create a variable declaration statement node for the given variable name and initializer',
       () => {
         const {items: [initializer], generate} = setupExpressions(`42`);
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'let');
         expect(generate(varDecl)).toEqual('let foo = 42;');
       });

    it('should create a constant declaration statement node for the given variable name and initializer',
       () => {
         const {items: [initializer], generate} = setupExpressions(`42`);
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'const');
         expect(generate(varDecl)).toEqual('const foo = 42;');
       });

    it('should create a downleveled declaration statement node for the given variable name and initializer',
       () => {
         const {items: [initializer], generate} = setupExpressions(`42`);
         const varDecl = factory.createVariableDeclaration('foo', initializer, 'var');
         expect(generate(varDecl)).toEqual('var foo = 42;');
       });

    it('should create an uninitialized variable declaration statement node for the given variable name and a null initializer',
       () => {
         const {generate} = setupStatements();
         const varDecl = factory.createVariableDeclaration('foo', null, 'let');
         expect(generate(varDecl)).toEqual('let foo;');
       });
  });

  describe('setSourceMapRange()', () => {
    it('should attach the `sourceMapRange` to the given `node`', () => {
      const {items: [expr]} = setupExpressions(`42`);

      factory.setSourceMapRange(expr, {
        start: {line: 0, column: 1, offset: 1},
        end: {line: 2, column: 3, offset: 15},
        content: '-****\n*****\n****',
        url: 'original.ts'
      });

      const range = ts.getSourceMapRange(expr);
      expect(range.pos).toEqual(1);
      expect(range.end).toEqual(15);
      expect(range.source?.getLineAndCharacterOfPosition(range.pos))
          .toEqual({line: 0, character: 1});
      expect(range.source?.getLineAndCharacterOfPosition(range.end))
          .toEqual({line: 2, character: 3});
    });
  });
});

/**
 * Setup some statements to use in a test, along with a generate function to print the created nodes
 * out.
 *
 * The TypeScript printer requires access to the original source of non-synthesized nodes.
 * It uses the source content to output things like text between parts of nodes, which it doesn't
 * store in the AST node itself.
 *
 * So this helper (and its sister `setupExpressions()`) capture the original source file used to
 * provide the original statements/expressions that are used in the tests so that the printing will
 * work via the returned `generate()` function.
 */
function setupStatements(stmts: string = ''): SetupResult<ts.Statement> {
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  const sf = ts.createSourceFile('test.ts', stmts, ts.ScriptTarget.ES2015, true);
  return {
    items: Array.from(sf.statements),
    generate: (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, sf),
  };
}

/**
 * Setup some statements to use in a test, along with a generate function to print the created nodes
 * out.
 *
 * See `setupStatements()` for more information about this helper function.
 */
function setupExpressions(...exprs: string[]): SetupResult<ts.Expression> {
  const {items: [arrayStmt], generate} = setupStatements(`[${exprs.join(',')}];`);
  const expressions = Array.from(
      ((arrayStmt as ts.ExpressionStatement).expression as ts.ArrayLiteralExpression).elements);
  return {items: expressions, generate};
}

interface SetupResult<TNode extends ts.Node> {
  items: TNode[];
  generate(node: ts.Node): string;
}
