/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteReference, Reference, TsReferenceResolver} from '../../imports';
import {TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {PartialEvaluator} from '../src/interface';
import {EnumValue, ResolvedValue} from '../src/result';

function makeSimpleProgram(contents: string): ts.Program {
  return makeProgram([{name: 'entry.ts', contents}]).program;
}

function makeExpression(
    code: string, expr: string, supportingFiles: {name: string, contents: string}[] = []): {
  expression: ts.Expression,
  host: ts.CompilerHost,
  checker: ts.TypeChecker,
  program: ts.Program,
  options: ts.CompilerOptions
} {
  const {program, options, host} = makeProgram(
      [{name: 'entry.ts', contents: `${code}; const target$ = ${expr};`}, ...supportingFiles]);
  const checker = program.getTypeChecker();
  const decl = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
  return {
    expression: decl.initializer !,
    host,
    options,
    checker,
    program,
  };
}

function evaluate<T extends ResolvedValue>(
    code: string, expr: string, supportingFiles: {name: string, contents: string}[] = []): T {
  const {expression, checker, program, options, host} = makeExpression(code, expr, supportingFiles);
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const resolver = new TsReferenceResolver(program, checker, options, host);
  const evaluator = new PartialEvaluator(reflectionHost, checker, resolver);
  return evaluator.evaluate(expression) as T;
}

describe('ngtsc metadata', () => {
  it('reads a file correctly', () => {
    const value = evaluate(
        `
        import {Y} from './other';
        const A = Y;
    `,
        'A', [
          {
            name: 'other.ts',
            contents: `
      export const Y = 'test';
      `
          },
        ]);

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

  it('array `slice` function works', () => {
    expect(evaluate(`const a = [1, 2, 3];`, 'a[\'slice\']()')).toEqual([1, 2, 3]);
  });

  it('negation works', () => {
    expect(evaluate(`const x = 3;`, '!x')).toEqual(false);
    expect(evaluate(`const x = 3;`, '!!x')).toEqual(true);
  });

  it('imports work', () => {
    const {program, options, host} = makeProgram([
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
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    const resolver = new TsReferenceResolver(program, checker, options, host);
    const evaluator = new PartialEvaluator(reflectionHost, checker, resolver);
    const resolved = evaluator.evaluate(expr);
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
    const {program, options, host} = makeProgram([
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
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const result = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
    const expr = result.initializer !;
    const resolver = new TsReferenceResolver(program, checker, options, host);
    const evaluator = new PartialEvaluator(reflectionHost, checker, resolver);
    const resolved = evaluator.evaluate(expr);
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
    const value = evaluate(
        `
      import mod from './second';
      `,
        'mod.property', [
          {name: 'second.ts', contents: 'export default {property: "test"}'},
        ]);
    expect(value).toEqual('test');
  });

  it('reads values from named exports', () => {
    const value = evaluate(`import * as mod from './second';`, 'mod.a.property', [
      {name: 'second.ts', contents: 'export const a = {property: "test"};'},
    ]);
    expect(value).toEqual('test');
  });

  it('chain of re-exports works', () => {
    const value = evaluate(`import * as mod from './direct-reexport';`, 'mod.value.property', [
      {name: 'const.ts', contents: 'export const value = {property: "test"};'},
      {name: 'def.ts', contents: `import {value} from './const'; export default value;`},
      {name: 'indirect-reexport.ts', contents: `import value from './def'; export {value};`},
      {name: 'direct-reexport.ts', contents: `export {value} from './indirect-reexport';`},
    ]);
    expect(value).toEqual('test');
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
    const value = evaluate(`import {value} from './decl';`, 'value', [
      {name: 'decl.d.ts', contents: 'export declare let value: number;'},
    ]);
    expect(value instanceof Reference).toBe(true);
  });
});
