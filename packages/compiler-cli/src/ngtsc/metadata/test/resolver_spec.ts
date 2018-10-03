/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeScriptReflectionHost} from '..';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {AbsoluteReference, EnumValue, Reference, ResolvedValue, staticallyResolve} from '../src/resolver';

function makeSimpleProgram(contents: string): ts.Program {
  return makeProgram([{name: 'entry.ts', contents}]).program;
}

function makeExpression(
    code: string, expr: string): {expression: ts.Expression, checker: ts.TypeChecker} {
  const {program} =
      makeProgram([{name: 'entry.ts', contents: `${code}; const target$ = ${expr};`}]);
  const checker = program.getTypeChecker();
  const decl = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
  return {
    expression: decl.initializer !,
    checker,
  };
}

function evaluate<T extends ResolvedValue>(code: string, expr: string): T {
  const {expression, checker} = makeExpression(code, expr);
  const host = new TypeScriptReflectionHost(checker);
  return staticallyResolve(expression, host, checker) as T;
}

describe('ngtsc metadata', () => {
  it('reads a file correctly', () => {
    const {program} = makeProgram([
      {
        name: 'entry.ts',
        contents: `
      import {Y} from './other';
      const A = Y;
        export const X = A;
      `
      },
      {
        name: 'other.ts',
        contents: `
      export const Y = 'test';
      `
      }
    ]);
    const decl = getDeclaration(program, 'entry.ts', 'X', ts.isVariableDeclaration);
    const host = new TypeScriptReflectionHost(program.getTypeChecker());

    const value = staticallyResolve(decl.initializer !, host, program.getTypeChecker());
    expect(value).toEqual('test');
  });

  it('map access works',
     () => { expect(evaluate('const obj = {a: "test"};', 'obj.a')).toEqual('test'); });

  it('function calls work', () => {
    expect(evaluate(`function foo(bar) { return bar; }`, 'foo("test")')).toEqual('test');
  });

  it('conditionals work', () => {
    expect(evaluate(`const x = false; const y = x ? 'true' : 'false';`, 'y')).toEqual('false');
  });

  it('addition works', () => { expect(evaluate(`const x = 1 + 2;`, 'x')).toEqual(3); });

  it('static property on class works',
     () => { expect(evaluate(`class Foo { static bar = 'test'; }`, 'Foo.bar')).toEqual('test'); });

  it('static property call works', () => {
    expect(evaluate(`class Foo { static bar(test) { return test; } }`, 'Foo.bar("test")'))
        .toEqual('test');
  });

  it('indirected static property call works', () => {
    expect(
        evaluate(
            `class Foo { static bar(test) { return test; } }; const fn = Foo.bar;`, 'fn("test")'))
        .toEqual('test');
  });

  it('array works', () => {
    expect(evaluate(`const x = 'test'; const y = [1, x, 2];`, 'y')).toEqual([1, 'test', 2]);
  });

  it('array spread works', () => {
    expect(evaluate(`const a = [1, 2]; const b = [4, 5]; const c = [...a, 3, ...b];`, 'c'))
        .toEqual([1, 2, 3, 4, 5]);
  });

  it('&& operations work', () => {
    expect(evaluate(`const a = 'hello', b = 'world';`, 'a && b')).toEqual('world');
    expect(evaluate(`const a = false, b = 'world';`, 'a && b')).toEqual(false);
    expect(evaluate(`const a = 'hello', b = 0;`, 'a && b')).toEqual(0);
  });

  it('|| operations work', () => {
    expect(evaluate(`const a = 'hello', b = 'world';`, 'a || b')).toEqual('hello');
    expect(evaluate(`const a = false, b = 'world';`, 'a || b')).toEqual('world');
    expect(evaluate(`const a = 'hello', b = 0;`, 'a || b')).toEqual('hello');
  });

  it('parentheticals work',
     () => { expect(evaluate(`const a = 3, b = 4;`, 'a * (a + b)')).toEqual(21); });

  it('array access works',
     () => { expect(evaluate(`const a = [1, 2, 3];`, 'a[1] + a[0]')).toEqual(3); });

  it('array `length` property access works',
     () => { expect(evaluate(`const a = [1, 2, 3];`, 'a[\'length\'] + 1')).toEqual(4); });

  it('negation works', () => {
    expect(evaluate(`const x = 3;`, '!x')).toEqual(false);
    expect(evaluate(`const x = 3;`, '!!x')).toEqual(true);
  });

  it('imports work', () => {
    const {program} = makeProgram([
      {name: 'second.ts', contents: 'export function foo(bar) { return bar; }'},
      {
        name: 'entry.ts',
        contents: `
          import {foo} from './second';
          const target$ = foo;
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    const resolved = staticallyResolve(expr, host, checker);
    if (!(resolved instanceof Reference)) {
      return fail('Expected expression to resolve to a reference');
    }
    expect(ts.isFunctionDeclaration(resolved.node)).toBe(true);
    expect(resolved.expressable).toBe(true);
    const reference = resolved.toExpression(program.getSourceFile('entry.ts') !);
    if (!(reference instanceof WrappedNodeExpr)) {
      return fail('Expected expression reference to be a wrapped node');
    }
    if (!ts.isIdentifier(reference.node)) {
      return fail('Expected expression to be an Identifier');
    }
    expect(reference.node.getSourceFile()).toEqual(program.getSourceFile('entry.ts') !);
  });

  it('absolute imports work', () => {
    const {program} = makeProgram([
      {name: 'node_modules/some_library/index.d.ts', contents: 'export declare function foo(bar);'},
      {
        name: 'entry.ts',
        contents: `
          import {foo} from 'some_library';
          const target$ = foo;
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    const resolved = staticallyResolve(expr, host, checker);
    if (!(resolved instanceof AbsoluteReference)) {
      return fail('Expected expression to resolve to an absolute reference');
    }
    expect(resolved.moduleName).toBe('some_library');
    expect(ts.isFunctionDeclaration(resolved.node)).toBe(true);
    expect(resolved.expressable).toBe(true);
    const reference = resolved.toExpression(program.getSourceFile('entry.ts') !);
    if (!(reference instanceof WrappedNodeExpr)) {
      return fail('Expected expression reference to be a wrapped node');
    }
    if (!ts.isIdentifier(reference.node)) {
      return fail('Expected expression to be an Identifier');
    }
    expect(reference.node.getSourceFile()).toEqual(program.getSourceFile('entry.ts') !);
  });

  it('reads values from default exports', () => {
    const {program} = makeProgram([
      {name: 'second.ts', contents: 'export default {property: "test"}'},
      {
        name: 'entry.ts',
        contents: `
          import mod from './second';
          const target$ = mod.property;
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    expect(staticallyResolve(expr, host, checker)).toEqual('test');
  });

  it('reads values from named exports', () => {
    const {program} = makeProgram([
      {name: 'second.ts', contents: 'export const a = {property: "test"};'},
      {
        name: 'entry.ts',
        contents: `
          import * as mod from './second';
          const target$ = mod.a.property;
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    expect(staticallyResolve(expr, host, checker)).toEqual('test');
  });

  it('chain of re-exports works', () => {
    const {program} = makeProgram([
      {name: 'const.ts', contents: 'export const value = {property: "test"};'},
      {name: 'def.ts', contents: `import {value} from './const'; export default value;`},
      {name: 'indirect-reexport.ts', contents: `import value from './def'; export {value};`},
      {name: 'direct-reexport.ts', contents: `export {value} from './indirect-reexport';`},
      {
        name: 'entry.ts',
        contents: `import * as mod from './direct-reexport'; const target$ = mod.value.property;`
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    expect(staticallyResolve(expr, host, checker)).toEqual('test');
  });

  it('map spread works', () => {
    const map: Map<string, number> = evaluate<Map<string, number>>(
        `const a = {a: 1}; const b = {b: 2, c: 1}; const c = {...a, ...b, c: 3};`, 'c');

    const obj: {[key: string]: number} = {};
    map.forEach((value, key) => obj[key] = value);
    expect(obj).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('indirected-via-object function call works', () => {
    expect(evaluate(
               `
      function fn(res) { return res; }
      const obj = {fn};
    `,
               'obj.fn("test")'))
        .toEqual('test');
  });

  it('template expressions work',
     () => { expect(evaluate('const a = 2, b = 4;', '`1${a}3${b}5`')).toEqual('12345'); });

  it('enum resolution works', () => {
    const result = evaluate(
        `
      enum Foo {
        A,
        B,
        C,
      }

      const r = Foo.B;
    `,
        'r');
    if (!(result instanceof EnumValue)) {
      return fail(`result is not an EnumValue`);
    }
    expect(result.enumRef.node.name.text).toBe('Foo');
    expect(result.name).toBe('B');
  });

  it('variable declaration resolution works', () => {
    const {program} = makeProgram([
      {name: 'decl.d.ts', contents: 'export declare let value: number;'},
      {name: 'entry.ts', contents: `import {value} from './decl'; const target$ = value;`},
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const res = staticallyResolve(result.initializer !, host, checker);
    expect(res instanceof Reference).toBe(true);
  });
});
