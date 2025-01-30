/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {Reference} from '../../imports';
import {DependencyTracker} from '../../incremental/api';
import {getDeclaration, makeProgram} from '../../testing';
import {DynamicValue} from '../src/dynamic';
import {EnumValue} from '../src/result';

import {
  arrowReturnValueFfr,
  evaluate,
  firstArgFfr,
  makeEvaluator,
  makeExpression,
  owningModuleOf,
  returnTypeFfr,
} from './utils';

runInEachFileSystem(() => {
  describe('ngtsc metadata', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => (_ = absoluteFrom));

    it('reads a file correctly', () => {
      const value = evaluate(
        `
        import {Y} from './other';
        const A = Y;
    `,
        'A',
        [
          {
            name: _('/other.ts'),
            contents: `
      export const Y = 'test';
      `,
          },
        ],
      );

      expect(value).toEqual('test');
    });

    it('map access works', () => {
      expect(evaluate('const obj = {a: "test"};', 'obj.a')).toEqual('test');
    });

    it('resolves undefined property access', () => {
      expect(evaluate('const obj: any = {}', 'obj.bar')).toEqual(undefined);
    });

    it('function calls work', () => {
      expect(evaluate(`function foo(bar) { return bar; }`, 'foo("test")')).toEqual('test');
    });

    it('function call default value works', () => {
      expect(evaluate(`function foo(bar = 1) { return bar; }`, 'foo()')).toEqual(1);
      expect(evaluate(`function foo(bar = 1) { return bar; }`, 'foo(2)')).toEqual(2);
      expect(evaluate(`function foo(a, c = a) { return c; }; const a = 1;`, 'foo(2)')).toEqual(2);
    });

    it('function call spread works', () => {
      expect(evaluate(`function foo(a, ...b) { return [a, b]; }`, 'foo(1, ...[2, 3])')).toEqual([
        1,
        [2, 3],
      ]);
    });

    it('conditionals work', () => {
      expect(evaluate(`const x = false; const y = x ? 'true' : 'false';`, 'y')).toEqual('false');
    });

    it('addition works', () => {
      expect(evaluate(`const x = 1 + 2;`, 'x')).toEqual(3);
    });

    it('static property on class works', () => {
      expect(evaluate(`class Foo { static bar = 'test'; }`, 'Foo.bar')).toEqual('test');
    });

    it('static property call works', () => {
      expect(
        evaluate(`class Foo { static bar(test) { return test; } }`, 'Foo.bar("test")'),
      ).toEqual('test');
    });

    it('indirected static property call works', () => {
      expect(
        evaluate(
          `class Foo { static bar(test) { return test; } }; const fn = Foo.bar;`,
          'fn("test")',
        ),
      ).toEqual('test');
    });

    it('array works', () => {
      expect(evaluate(`const x = 'test'; const y = [1, x, 2];`, 'y')).toEqual([1, 'test', 2]);
    });

    it('array spread works', () => {
      expect(
        evaluate(`const a = [1, 2]; const b = [4, 5]; const c = [...a, 3, ...b];`, 'c'),
      ).toEqual([1, 2, 3, 4, 5]);
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

    it('evaluates arithmetic operators', () => {
      expect(evaluate('const a = 6, b = 3;', 'a + b')).toEqual(9);
      expect(evaluate('const a = 6, b = 3;', 'a - b')).toEqual(3);
      expect(evaluate('const a = 6, b = 3;', 'a * b')).toEqual(18);
      expect(evaluate('const a = 6, b = 3;', 'a / b')).toEqual(2);
      expect(evaluate('const a = 6, b = 3;', 'a % b')).toEqual(0);
      expect(evaluate('const a = 6, b = 3;', 'a & b')).toEqual(2);
      expect(evaluate('const a = 6, b = 3;', 'a | b')).toEqual(7);
      expect(evaluate('const a = 6, b = 3;', 'a ^ b')).toEqual(5);
      expect(evaluate('const a = 6, b = 3;', 'a ** b')).toEqual(216);
      expect(evaluate('const a = 6, b = 3;', 'a << b')).toEqual(48);
      expect(evaluate('const a = -6, b = 2;', 'a >> b')).toEqual(-2);
      expect(evaluate('const a = -6, b = 2;', 'a >>> b')).toEqual(1073741822);
    });

    it('evaluates comparison operators', () => {
      expect(evaluate('const a = 2, b = 3;', 'a < b')).toEqual(true);
      expect(evaluate('const a = 3, b = 3;', 'a < b')).toEqual(false);

      expect(evaluate('const a = 3, b = 3;', 'a <= b')).toEqual(true);
      expect(evaluate('const a = 4, b = 3;', 'a <= b')).toEqual(false);

      expect(evaluate('const a = 4, b = 3;', 'a > b')).toEqual(true);
      expect(evaluate('const a = 3, b = 3;', 'a > b')).toEqual(false);

      expect(evaluate('const a = 3, b = 3;', 'a >= b')).toEqual(true);
      expect(evaluate('const a = 2, b = 3;', 'a >= b')).toEqual(false);

      expect(evaluate('const a: any = 3, b = "3";', 'a == b')).toEqual(true);
      expect(evaluate('const a: any = 2, b = "3";', 'a == b')).toEqual(false);

      expect(evaluate('const a: any = 2, b = "3";', 'a != b')).toEqual(true);
      expect(evaluate('const a: any = 3, b = "3";', 'a != b')).toEqual(false);

      expect(evaluate('const a: any = 3, b = 3;', 'a === b')).toEqual(true);
      expect(evaluate('const a: any = 3, b = "3";', 'a === b')).toEqual(false);

      expect(evaluate('const a: any = 3, b = "3";', 'a !== b')).toEqual(true);
      expect(evaluate('const a: any = 3, b = 3;', 'a !== b')).toEqual(false);
    });

    it('parentheticals work', () => {
      expect(evaluate(`const a = 3, b = 4;`, 'a * (a + b)')).toEqual(21);
    });

    it('array access works', () => {
      expect(evaluate(`const a = [1, 2, 3];`, 'a[1] + a[0]')).toEqual(3);
    });

    it('array access out of bounds is `undefined`', () => {
      expect(evaluate(`const a = [1, 2, 3];`, 'a[-1]')).toEqual(undefined);
      expect(evaluate(`const a = [1, 2, 3];`, 'a[3]')).toEqual(undefined);
    });

    it('array `length` property access works', () => {
      expect(evaluate(`const a = [1, 2, 3];`, "a['length'] + 1")).toEqual(4);
    });

    it('array `slice` function works', () => {
      expect(evaluate(`const a = [1, 2, 3];`, "a['slice']()")).toEqual([1, 2, 3]);
    });

    it('array `concat` function works', () => {
      expect(evaluate(`const a = [1, 2], b = [3, 4];`, "a['concat'](b)")).toEqual([1, 2, 3, 4]);
      expect(evaluate(`const a = [1, 2], b = 3;`, "a['concat'](b)")).toEqual([1, 2, 3]);
      expect(evaluate(`const a = [1, 2], b = 3, c = [4, 5];`, "a['concat'](b, c)")).toEqual([
        1, 2, 3, 4, 5,
      ]);
      expect(evaluate(`const a = [1, 2], b = [3, 4]`, "a['concat'](...b)")).toEqual([1, 2, 3, 4]);
    });

    it('negation works', () => {
      expect(evaluate(`const x = 3;`, '!x')).toEqual(false);
      expect(evaluate(`const x = 3;`, '!!x')).toEqual(true);
    });

    it('supports boolean literals', () => {
      expect(evaluate('const a = true;', 'a')).toEqual(true);
      expect(evaluate('const a = false;', 'a')).toEqual(false);
    });

    it('supports undefined', () => {
      expect(evaluate('const a = undefined;', 'a')).toEqual(undefined);
    });

    it('supports null', () => {
      expect(evaluate('const a = null;', 'a')).toEqual(null);
    });

    it('supports negative numbers', () => {
      expect(evaluate('const a = -123;', 'a')).toEqual(-123);
    });

    it('supports destructuring array variable declarations', () => {
      const code = `
        const [a, b, c, d] = [0, 1, 2, 3];
        const e = c;
      `;

      expect(evaluate(code, 'a')).toBe(0);
      expect(evaluate(code, 'b')).toBe(1);
      expect(evaluate(code, 'c')).toBe(2);
      expect(evaluate(code, 'd')).toBe(3);
      expect(evaluate(code, 'e')).toBe(2);
    });

    it('supports destructuring object variable declaration', () => {
      const code = `
        const {a, b, c, d} = {a: 0, b: 1, c: 2, d: 3};
        const e = c;
      `;

      expect(evaluate(code, 'a')).toBe(0);
      expect(evaluate(code, 'b')).toBe(1);
      expect(evaluate(code, 'c')).toBe(2);
      expect(evaluate(code, 'd')).toBe(3);
      expect(evaluate(code, 'e')).toBe(2);
    });

    it('supports destructuring object variable declaration with an alias', () => {
      expect(evaluate(`const {a: value} = {a: 5}; const e = value;`, 'e')).toBe(5);
    });

    it('supports nested destructuring object variable declarations', () => {
      expect(evaluate(`const {a: {b: {c}}} = {a: {b: {c: 0}}};`, 'c')).toBe(0);
    });

    it('supports nested destructuring array variable declarations', () => {
      expect(evaluate(`const [[[a]]] = [[[1]]];`, 'a')).toBe(1);
    });

    it('supports nested destructuring variable declarations mixing arrays and objects', () => {
      expect(evaluate(`const {a: {b: [[c]]}} = {a: {b: [[1337]]}};`, 'c')).toBe(1337);
    });

    it('resolves unknown values in a destructured variable declaration as dynamic values', () => {
      const value = evaluate(`const {a: {body}} = {a: window};`, 'body', [
        {name: _('/window.ts'), contents: `declare const window: any;`},
      ]);
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toBe('body');
    });

    it('resolves unknown binary operators as dynamic value', () => {
      const value = evaluate('declare const window: any;', '"location" in window');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('"location" in window');
      expect(value.isFromUnsupportedSyntax()).toBe(true);
    });

    it('resolves unknown unary operators as dynamic value', () => {
      const value = evaluate('let index = 0;', '++index');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('++index');
      expect(value.isFromUnsupportedSyntax()).toBe(true);
    });

    it('resolves invalid element accesses as dynamic value', () => {
      const value = evaluate('const a = {}; const index: any = true;', 'a[index]');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('a[index]');
      if (!value.isFromInvalidExpressionType()) {
        return fail('Should have an invalid expression type as reason');
      }
      expect(value.reason).toEqual(true);
    });

    it('resolves invalid array accesses as dynamic value', () => {
      const value = evaluate('const a = []; const index = 1.5;', 'a[index]');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('a[index]');
      if (!value.isFromInvalidExpressionType()) {
        return fail('Should have an invalid expression type as reason');
      }
      expect(value.reason).toEqual(1.5);
    });

    it('resolves binary operator on non-literals as dynamic value', () => {
      const value = evaluate('const a: any = []; const b: any = [];', 'a + b');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('a + b');
      if (!(value.reason instanceof DynamicValue)) {
        return fail(`Should have a DynamicValue as reason`);
      }
      if (!value.reason.isFromInvalidExpressionType()) {
        return fail('Should have an invalid expression type as reason');
      }
      expect(value.reason.node.getText()).toEqual('a');
      expect(value.reason.reason).toEqual([]);
    });

    it('resolves invalid spreads in array literals as dynamic value', () => {
      const array = evaluate('const a: any = true;', '[1, ...a]');
      if (!Array.isArray(array)) {
        return fail(`Should have resolved to an array`);
      }
      expect(array[0]).toBe(1);
      const value = array[1];
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('...a');
      if (!value.isFromInvalidExpressionType()) {
        return fail('Should have an invalid spread element as reason');
      }
      expect(value.reason).toEqual(true);
    });

    it('resolves invalid spreads in object literals as dynamic value', () => {
      const value = evaluate('const a: any = true;', '{b: true, ...a}');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('{b: true, ...a}');
      if (!value.isFromDynamicInput()) {
        return fail('Should have a dynamic input as reason');
      }
      expect(value.reason.node.getText()).toEqual('...a');
      if (!value.reason.isFromInvalidExpressionType()) {
        return fail('Should have an invalid spread element as reason');
      }
      expect(value.reason.reason).toEqual(true);
    });

    it('resolves access from external variable declarations as dynamic value', () => {
      const value = evaluate('declare const window: any;', 'window.location');
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.isFromDynamicInput()).toEqual(true);
      expect(value.node.getText()).toEqual('window.location');
      if (!(value.reason instanceof DynamicValue)) {
        return fail(`Should have a DynamicValue as reason`);
      }
      expect(value.reason.isFromExternalReference()).toEqual(true);
      expect(value.reason.node.getText()).toEqual('window: any');
    });

    it('supports declarations of primitive constant types', () => {
      expect(evaluate(`declare const x: 'foo';`, `x`)).toEqual('foo');
      expect(evaluate(`declare const x: 42;`, `x`)).toEqual(42);
      expect(evaluate(`declare const x: null;`, `x`)).toEqual(null);
      expect(evaluate(`declare const x: true;`, `x`)).toEqual(true);
    });

    it('supports declarations of tuples', () => {
      expect(evaluate(`declare const x: ['foo', 42, null, true];`, `x`)).toEqual([
        'foo',
        42,
        null,
        true,
      ]);
      expect(evaluate(`declare const x: ['bar'];`, `[...x]`)).toEqual(['bar']);
    });

    // https://github.com/angular/angular/issues/48089
    it('supports declarations of readonly tuples with class references', () => {
      const tuple = evaluate(
        `
        import {External} from 'external';
        declare class Local {}
        declare const x: readonly [typeof External, typeof Local];`,
        `x`,
        [
          {
            name: _('/node_modules/external/index.d.ts'),
            contents: 'export declare class External {}',
          },
        ],
      );
      if (!Array.isArray(tuple)) {
        return fail('Should have evaluated tuple as an array');
      }
      const [external, local] = tuple;
      if (!(external instanceof Reference)) {
        return fail('Should have evaluated `typeof A` to a Reference');
      }
      expect(ts.isClassDeclaration(external.node)).toBe(true);
      expect(external.debugName).toBe('External');
      expect(external.ownedByModuleGuess).toBe('external');

      if (!(local instanceof Reference)) {
        return fail('Should have evaluated `typeof B` to a Reference');
      }
      expect(ts.isClassDeclaration(local.node)).toBe(true);
      expect(local.debugName).toBe('Local');
      expect(local.ownedByModuleGuess).toBeNull();
    });

    it('evaluates tuple elements it cannot understand to DynamicValue', () => {
      const value = evaluate(`declare const x: ['foo', string];`, `x`) as [string, DynamicValue];

      expect(Array.isArray(value)).toBeTrue();
      expect(value[0]).toEqual('foo');
      expect(value[1] instanceof DynamicValue).toBeTrue();
      expect(value[1].isFromDynamicType()).toBe(true);
    });

    it('imports work', () => {
      const {program} = makeProgram([
        {name: _('/second.ts'), contents: 'export function foo(bar) { return bar; }'},
        {
          name: _('/entry.ts'),
          contents: `
          import {foo} from './second';
          const target$ = foo;
      `,
        },
      ]);
      const checker = program.getTypeChecker();
      const result = getDeclaration(program, _('/entry.ts'), 'target$', ts.isVariableDeclaration);
      const expr = result.initializer!;
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(expr);
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to a reference');
      }
      expect(ts.isFunctionDeclaration(resolved.node)).toBe(true);
      const reference = resolved.getIdentityIn(getSourceFileOrError(program, _('/entry.ts')));
      if (reference === null) {
        return fail('Expected to get an identifier');
      }
      expect(reference.getSourceFile()).toEqual(getSourceFileOrError(program, _('/entry.ts')));
    });

    it('absolute imports work', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/some_library/index.d.ts'),
          contents: 'export declare function foo(bar);',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {foo} from 'some_library';
          const target$ = foo;
      `,
        },
      ]);
      const checker = program.getTypeChecker();
      const result = getDeclaration(program, _('/entry.ts'), 'target$', ts.isVariableDeclaration);
      const expr = result.initializer!;
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(expr);
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to an absolute reference');
      }
      expect(owningModuleOf(resolved)).toBe('some_library');
      expect(ts.isFunctionDeclaration(resolved.node)).toBe(true);
      const reference = resolved.getIdentityIn(getSourceFileOrError(program, _('/entry.ts')));
      expect(reference).not.toBeNull();
      expect(reference!.getSourceFile()).toEqual(getSourceFileOrError(program, _('/entry.ts')));
    });

    it('reads values from default exports', () => {
      const value = evaluate(
        `
      import mod from './second';
      `,
        'mod.property',
        [{name: _('/second.ts'), contents: 'export default {property: "test"}'}],
      );
      expect(value).toEqual('test');
    });

    it('reads values from named exports', () => {
      const value = evaluate(`import * as mod from './second';`, 'mod.a.property', [
        {name: _('/second.ts'), contents: 'export const a = {property: "test"};'},
      ]);
      expect(value).toEqual('test');
    });

    it('chain of re-exports works', () => {
      const value = evaluate(`import * as mod from './direct-reexport';`, 'mod.value.property', [
        {name: _('/const.ts'), contents: 'export const value = {property: "test"};'},
        {name: _('/def.ts'), contents: `import {value} from './const'; export default value;`},
        {name: _('/indirect-reexport.ts'), contents: `import value from './def'; export {value};`},
        {name: _('/direct-reexport.ts'), contents: `export {value} from './indirect-reexport';`},
      ]);
      expect(value).toEqual('test');
    });

    it('map spread works', () => {
      const map: Map<string, number> = evaluate<Map<string, number>>(
        `const a = {a: 1}; const b = {b: 2, c: 1}; const c = {...a, ...b, c: 3};`,
        'c',
      );

      const obj: {[key: string]: number} = {};
      map.forEach((value, key) => (obj[key] = value));
      expect(obj).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });

    it('module spread works', () => {
      const map = evaluate<Map<string, number>>(
        `import * as mod from './module'; const c = {...mod, c: 3};`,
        'c',
        [{name: _('/module.ts'), contents: `export const a = 1; export const b = 2;`}],
      );

      const obj: {[key: string]: number} = {};
      map.forEach((value, key) => (obj[key] = value));
      expect(obj).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });

    it('evaluates module exports lazily to avoid infinite recursion', () => {
      const value = evaluate(`import * as mod1 from './mod1';`, 'mod1.primary', [
        {
          name: _('/mod1.ts'),
          contents: `
            import * as mod2 from './mod2';
            export const primary = mod2.indirection;
            export const secondary = 2;`,
        },
        {
          name: _('/mod2.ts'),
          contents: `import * as mod1 from './mod1'; export const indirection = mod1.secondary;`,
        },
      ]);
      expect(value).toEqual(2);
    });

    it('indirected-via-object function call works', () => {
      expect(
        evaluate(
          `
      function fn(res) { return res; }
      const obj = {fn};
    `,
          'obj.fn("test")',
        ),
      ).toEqual('test');
    });

    it('template expressions work', () => {
      expect(evaluate('const a = 2, b = 4;', '`1${a}3${b}5`')).toEqual('12345');
    });

    it('template expressions should resolve enums', () => {
      expect(evaluate('enum Test { VALUE = "test" };', '`a.${Test.VALUE}.b`')).toBe('a.test.b');
    });

    it('string concatenation should resolve enums', () => {
      expect(evaluate('enum Test { VALUE = "test" };', '"a." + Test.VALUE + ".b"')).toBe(
        'a.test.b',
      );
    });

    it('string `concat` function works', () => {
      expect(evaluate(`const a = '12', b = '34';`, "a['concat'](b)")).toBe('1234');
      expect(evaluate(`const a = '12', b = '3';`, "a['concat'](b)")).toBe('123');
      expect(evaluate(`const a = '12', b = '3', c = '45';`, "a['concat'](b,c)")).toBe('12345');
      expect(
        evaluate(`const a = '1', b = 2, c = '3', d = true, e = null;`, "a['concat'](b,c,d,e)"),
      ).toBe('123truenull');
      expect(evaluate('enum Test { VALUE = "test" };', '"a."[\'concat\'](Test.VALUE, ".b")')).toBe(
        'a.test.b',
      );
    });

    it('should resolve non-literals as dynamic string', () => {
      const value = evaluate(`const a: any = [];`, '`a.${a}.b`');

      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      expect(value.node.getText()).toEqual('`a.${a}.b`');

      if (!value.isFromDynamicInput()) {
        return fail('Should originate from dynamic input');
      } else if (!value.reason.isFromDynamicString()) {
        return fail('Should refer to a dynamic string part');
      }
      expect(value.reason.node.getText()).toEqual('a');
    });

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
        'r',
      );
      if (!(result instanceof EnumValue)) {
        return fail(`result is not an EnumValue`);
      }
      expect((result.enumRef.node as ts.EnumDeclaration).name.text).toBe('Foo');
      expect(result.name).toBe('B');
      expect(result.resolved).toBe(1);
    });

    it('variable declaration resolution works', () => {
      const value = evaluate(`import {value} from './decl';`, 'value', [
        {name: _('/decl.d.ts'), contents: 'export declare let value: number;'},
      ]);
      expect(value instanceof Reference).toBe(true);
    });

    it('should resolve shorthand properties to values', () => {
      const {program} = makeProgram([
        {name: _('/entry.ts'), contents: `const prop = 42; const target$ = {prop};`},
      ]);
      const checker = program.getTypeChecker();
      const result = getDeclaration(program, _('/entry.ts'), 'target$', ts.isVariableDeclaration);
      const expr = result.initializer! as ts.ObjectLiteralExpression;
      const prop = expr.properties[0] as ts.ShorthandPropertyAssignment;
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(prop.name);
      expect(resolved).toBe(42);
    });

    it('should resolve dynamic values in object literals', () => {
      const {program} = makeProgram([
        {name: _('/decl.d.ts'), contents: 'export declare const fn: any;'},
        {
          name: _('/entry.ts'),
          contents: `import {fn} from './decl'; const prop = fn.foo(); const target$ = {value: prop};`,
        },
      ]);
      const checker = program.getTypeChecker();
      const result = getDeclaration(program, _('/entry.ts'), 'target$', ts.isVariableDeclaration);
      const expr = result.initializer! as ts.ObjectLiteralExpression;
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(expr);
      if (!(resolved instanceof Map)) {
        return fail('Should have resolved to a Map');
      }
      const value = resolved.get('value')!;
      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved 'value' to a DynamicValue`);
      }
      const prop = expr.properties[0] as ts.PropertyAssignment;
      expect(value.node).toBe(prop.initializer);
    });

    it('should not attach identifiers to FFR-resolved values', () => {
      const value = evaluate(
        `
    declare function foo(arg: any): any;
    class Target {}

    const indir = foo(Target);
    const value = indir;
  `,
        'value',
        [],
        firstArgFfr,
      );
      if (!(value instanceof Reference)) {
        return fail('Expected value to be a Reference');
      }
      const id = value.getIdentityIn(value.node.getSourceFile());
      if (id === null) {
        return fail('Expected value to have an identity');
      }
      expect(id.text).toEqual('Target');
    });

    it('should not associate an owning module when a FFR-resolved expression is within the originating source file', () => {
      const resolved = evaluate(
        `import {forwardRef} from 'forward';
              class Foo {}`,
        'forwardRef(() => Foo)',
        [
          {
            name: _('/node_modules/forward/index.d.ts'),
            contents: `export declare function forwardRef<T>(fn: () => T): T;`,
          },
        ],
        arrowReturnValueFfr,
      );
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to a reference');
      }
      expect((resolved.node as ts.ClassDeclaration).name!.text).toBe('Foo');
      expect(resolved.bestGuessOwningModule).toBeNull();
    });

    it('should not associate an owning module when a FFR-resolved expression is imported using a relative import', () => {
      const resolved = evaluate(
        `import {forwardRef} from 'forward';
              import {Foo} from './foo';`,
        'forwardRef(() => Foo)',
        [
          {
            name: _('/node_modules/forward/index.d.ts'),
            contents: `export declare function forwardRef<T>(fn: () => T): T;`,
          },
          {
            name: _('/foo.ts'),
            contents: `export class Foo {}`,
          },
        ],
        arrowReturnValueFfr,
      );
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to a reference');
      }
      expect((resolved.node as ts.ClassDeclaration).name!.text).toBe('Foo');
      expect(resolved.bestGuessOwningModule).toBeNull();
    });

    it('should associate an owning module when a FFR-resolved expression is imported using an absolute import', () => {
      const {expression, checker} = makeExpression(
        `import {forwardRef} from 'forward';
              import {Foo} from 'external';`,
        `forwardRef(() => Foo)`,
        [
          {
            name: _('/node_modules/forward/index.d.ts'),
            contents: `export declare function forwardRef<T>(fn: () => T): T;`,
          },
          {
            name: _('/node_modules/external/index.d.ts'),
            contents: `export declare class Foo {}`,
          },
        ],
      );
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(expression, arrowReturnValueFfr);
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to a reference');
      }
      expect((resolved.node as ts.ClassDeclaration).name!.text).toBe('Foo');
      expect(resolved.bestGuessOwningModule).toEqual({
        specifier: 'external',
        resolutionContext: expression.getSourceFile().fileName,
      });
    });

    it('should associate an owning module when a FFR-resolved expression is within the foreign file', () => {
      const {expression, checker} = makeExpression(
        `import {external} from 'external';`,
        `external()`,
        [
          {
            name: _('/node_modules/external/index.d.ts'),
            contents: `
                                export declare class Foo {}
                                export declare function external(): Foo;
                              `,
          },
        ],
      );
      const evaluator = makeEvaluator(checker);
      const resolved = evaluator.evaluate(expression, returnTypeFfr);
      if (!(resolved instanceof Reference)) {
        return fail('Expected expression to resolve to a reference');
      }
      expect((resolved.node as ts.ClassDeclaration).name!.text).toBe('Foo');
      expect(resolved.bestGuessOwningModule).toEqual({
        specifier: 'external',
        resolutionContext: expression.getSourceFile().fileName,
      });
    });

    it('should resolve functions with more than one statement to a complex function call', () => {
      const value = evaluate(`function foo(bar) { const b = bar; return b; }`, 'foo("test")');

      if (!(value instanceof DynamicValue)) {
        return fail(`Should have resolved to a DynamicValue`);
      }
      if (!value.isFromComplexFunctionCall()) {
        return fail('Expected DynamicValue to be from complex function call');
      }
      expect((value.node as ts.CallExpression).expression.getText()).toBe('foo');
      expect((value.reason.node as ts.FunctionDeclaration).getText()).toContain(
        'const b = bar; return b;',
      );
    });

    describe('(visited file tracking)', () => {
      it('should track each time a source file is visited', () => {
        const addDependency =
          jasmine.createSpy<DependencyTracker['addDependency']>('DependencyTracker');
        const {expression, checker, program} = makeExpression(
          `class A { static foo = 42; } function bar() { return A.foo; }`,
          'bar()',
        );
        const entryPath = getSourceFileOrError(program, _('/entry.ts')).fileName;
        const evaluator = makeEvaluator(checker, {...fakeDepTracker, addDependency});
        evaluator.evaluate(expression);
        expect(addDependency).toHaveBeenCalledTimes(2); // two declaration visited
        expect(
          addDependency.calls
            .allArgs()
            .map((args: Parameters<typeof addDependency>) => [args[0].fileName, args[1].fileName]),
        ).toEqual([
          [entryPath, entryPath],
          [entryPath, entryPath],
        ]);
      });

      it('should track imported source files', () => {
        const addDependency =
          jasmine.createSpy<DependencyTracker['addDependency']>('DependencyTracker');
        const {expression, checker, program} = makeExpression(
          `import {Y} from './other'; const A = Y;`,
          'A',
          [
            {name: _('/other.ts'), contents: `export const Y = 'test';`},
            {name: _('/not-visited.ts'), contents: `export const Z = 'nope';`},
          ],
        );
        const entryPath = getSourceFileOrError(program, _('/entry.ts')).fileName;
        const otherPath = getSourceFileOrError(program, _('/other.ts')).fileName;
        const evaluator = makeEvaluator(checker, {...fakeDepTracker, addDependency});
        evaluator.evaluate(expression);
        expect(addDependency).toHaveBeenCalledTimes(2);
        expect(
          addDependency.calls
            .allArgs()
            .map((args: Parameters<typeof addDependency>) => [args[0].fileName, args[1].fileName]),
        ).toEqual([
          [entryPath, entryPath],
          [entryPath, otherPath],
        ]);
      });

      it('should track files passed through during re-exports', () => {
        const addDependency =
          jasmine.createSpy<DependencyTracker['addDependency']>('DependencyTracker');
        const {expression, checker, program} = makeExpression(
          `import * as mod from './direct-reexport';`,
          'mod.value.property',
          [
            {name: _('/const.ts'), contents: 'export const value = {property: "test"};'},
            {
              name: _('/def.ts'),
              contents: `import {value} from './const'; export default value;`,
            },
            {
              name: _('/indirect-reexport.ts'),
              contents: `import value from './def'; export {value};`,
            },
            {
              name: _('/direct-reexport.ts'),
              contents: `export {value} from './indirect-reexport';`,
            },
          ],
        );
        const evaluator = makeEvaluator(checker, {...fakeDepTracker, addDependency});
        const entryPath = getSourceFileOrError(program, _('/entry.ts')).fileName;
        const directReexportPath = getSourceFileOrError(program, _('/direct-reexport.ts')).fileName;
        const constPath = getSourceFileOrError(program, _('/const.ts')).fileName;
        evaluator.evaluate(expression);
        expect(addDependency).toHaveBeenCalledTimes(2);
        expect(
          addDependency.calls
            .allArgs()
            .map((args: Parameters<typeof addDependency>) => [args[0].fileName, args[1].fileName]),
        ).toEqual([
          [entryPath, directReexportPath],
          // Not '/indirect-reexport.ts' or '/def.ts'.
          // TS skips through them when finding the original symbol for `value`
          [entryPath, constPath],
        ]);
      });
    });
  });
});

const fakeDepTracker: DependencyTracker = {
  addDependency: () => undefined,
  addResourceDependency: () => undefined,
  recordDependencyAnalysisFailure: () => undefined,
};
