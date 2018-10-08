/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ResolvedValue, staticallyResolve} from '../src/resolver';

import {getDeclaration, makeProgram} from './in_memory_typescript';

function makeSimpleProgram(contents: string): ts.Program {
  return makeProgram([{name: 'entry.ts', contents}]);
}

function makeExpression(
    code: string, expr: string): {expression: ts.Expression, checker: ts.TypeChecker} {
  const program = makeProgram([{name: 'entry.ts', contents: `${code}; const target$ = ${expr};`}]);
  const checker = program.getTypeChecker();
  const decl = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
  return {
    expression: decl.initializer !,
    checker,
  };
}

function evaluate<T extends ResolvedValue>(code: string, expr: string): T {
  const {expression, checker} = makeExpression(code, expr);
  return staticallyResolve(expression, checker) as T;
}

describe('ngtsc metadata', () => {
  it('reads a file correctly', () => {
    const program = makeProgram([
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

    const value = staticallyResolve(decl.initializer !, program.getTypeChecker());
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

  it('negation works', () => {
    expect(evaluate(`const x = 3;`, '!x')).toEqual(false);
    expect(evaluate(`const x = 3;`, '!!x')).toEqual(true);
  });

  it('reads values from default exports', () => {
    const program = makeProgram([
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
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    debugger;
    expect(staticallyResolve(expr, checker)).toEqual('test');
  });

  it('reads values from named exports', () => {
    const program = makeProgram([
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
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    expect(staticallyResolve(expr, checker)).toEqual('test');
  });

  it('chain of re-exports works', () => {
    const program = makeProgram([
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
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    expect(staticallyResolve(expr, checker)).toEqual('test');
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
});
