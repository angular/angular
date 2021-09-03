/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom, getFileSystem} from '../../file_system';
import {MockFileSystem, runInEachFileSystem} from '../../file_system/testing';
import {loadStandardTestFiles, makeProgram} from '../../testing';
import {createAsyncTransform} from '../src/async_transform';


runInEachFileSystem(() => {
  describe('async transform', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => {
      _ = absoluteFrom;
      const libs = loadStandardTestFiles({fakeCore: false});
      const fs = getFileSystem() as MockFileSystem;
      fs.init(libs);
    });

    it('should not change code that does not contain `async` keyword', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: `
        export function foo(): Promise<number> {
          return new Promise<number>(resolve => { return 100; });
        }
      `
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'export function foo() {',
        '    return new Promise(resolve => { return 100; });',
        '}',
        '',
      ]);
    });

    it('should transform a simple async function expression to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export const foo = async function foo() {',
          '  return 100;',
          '};',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator() {',
        '    return 100;',
        '}',
        'export const foo = function foo() {',
        '    return Zone.__awaiter(this, [], foo_generator);',
        '};',
        '',
      ]);
    });

    it('should transform a simple async function declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'async function foo() {',
          '  return 100;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator() {',
        '    return 100;',
        '}',
        'function foo() {',
        '    return Zone.__awaiter(this, [], foo_generator);',
        '}',
        '',
      ]);
    });

    it('should transform a simple async arrow function to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const foo = async () => 100;',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator() { return 100; }',
        'const foo = () => Zone.__awaiter(this, [], foo_generator);',
        '',
      ]);
    });

    it('should transform a simple async method to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Test {',
          '  async foo() {',
          '    return 100;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator() {',
        '    return 100;',
        '}',
        'class Test {',
        '    foo() {',
        '        return Zone.__awaiter(this, [], foo_generator);',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform a simple async static method to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Test {',
          '  static async foo() {',
          '    return 100;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator() {',
        '    return 100;',
        '}',
        'class Test {',
        '    static foo() {',
        '        return Zone.__awaiter(this, [], foo_generator);',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform an async-await function expression to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export const foo = async function foo(a: number, b: string): Promise<number> {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '};',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) {',
        '    const x = yield a;',
        '    if (x) {',
        '        yield 200;',
        '    }',
        '    return yield 300;',
        '}',
        'export const foo = function foo(a, b) {',
        '    return Zone.__awaiter(this, [a, b], foo_generator);',
        '};',
        '',
      ]);
    });

    it('should transform an async-await function declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export async function foo(a: number, b: string): Promise<number> {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) {',
        '    const x = yield a;',
        '    if (x) {',
        '        yield 200;',
        '    }',
        '    return yield 300;',
        '}',
        'export function foo(a, b) {',
        '    return Zone.__awaiter(this, [a, b], foo_generator);',
        '}',
        '',
      ]);
    });

    it('should transform an async-await arrow function to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const foo: (a: number, b: string) => Promise<number> = async (a: number, b: string) => {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) {',
        '    const x = yield a;',
        '    if (x) {',
        '        yield 200;',
        '    }',
        '    return yield 300;',
        '}',
        'const foo = (a, b) => Zone.__awaiter(this, [a, b], foo_generator);',
        '',
      ]);
    });

    it('should transform an async-await method declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Test {',
          '  async foo(a: number, b: string): Promise<number> {',
          '    const x = await a;',
          '    if (x) {',
          '      await 200;',
          '    }',
          '    return await 300;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) {',
        '    const x = yield a;',
        '    if (x) {',
        '        yield 200;',
        '    }',
        '    return yield 300;',
        '}',
        'class Test {',
        '    foo(a, b) {',
        '        return Zone.__awaiter(this, [a, b], foo_generator);',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform a decorated async method declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const Input: any = {};',
          'class Test {',
          '  @Input',
          '  async foo(a: number, b: string): Promise<number> {',
          '    return await 300;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      // Strip out the decorator helper code
      const cleanedContent = emittedContent.replace(/^[\s\S]*function\*/, 'function*');
      expect(cleanedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) {',
        '    return yield 300;',
        '}',
        'const Input = {};',
        'class Test {',
        '    foo(a, b) {',
        '        return Zone.__awaiter(this, [a, b], foo_generator);',
        '    }',
        '}',
        '__decorate([',
        '    Input',
        '], Test.prototype, "foo", null);',
        '',
      ]);
    });

    it('should transform nested async functions', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'async function outer(x, y) {',
          '  async function inner(a, b) {',
          '    return await 300;',
          '  }',
          '  await inner(x, y);',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* outer_generator(x, y) {',
        '    function* inner_generator(a, b) {',
        '        return yield 300;',
        '    }',
        '    function inner(a, b) {',
        '        return Zone.__awaiter(this, [a, b], inner_generator);',
        '    }',
        '    yield inner(x, y);',
        '}',
        'function outer(x, y) {',
        '    return Zone.__awaiter(this, [x, y], outer_generator);',
        '}',
        '',
      ]);
    });

    it('should transform reads and writes of `super` properties within async methods', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Base {',
          '  async foo(a, b) {}',
          '  async bar() {}',
          '}',
          'class Child extends Base {',
          '  constructor() { super(); }',
          '  prop = super.foo;',
          '  async foo(a, b) {',
          '    const foo = super.foo;',
          '    await super.foo(a, b);',
          '    const bar = super["bar"];',
          '    super["bar"]();',
          '  }',
          '  async bar() {',
          '    super.foo = () => super.foo(10, 20);',
          '    let x = super.bar;',
          '    super["bar"] = x;',
          '    x = super["bar"];',
          '  }',
          '  async car() {',
          '    let x = super["bar"];',
          '    super["bar"] = x;',
          '    x = super["bar"];',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(a, b) { }',
        'function* bar_generator() { }',
        'class Base {',
        '    foo(a, b) {',
        '        return Zone.__awaiter(this, [a, b], foo_generator);',
        '    }',
        '    bar() {',
        '        return Zone.__awaiter(this, [], bar_generator);',
        '    }',
        '}',
        'class Child extends Base {',
        '    constructor() {',
        '        super();',
        '        this.prop = super.foo;',
        '    }',
        '    foo(a, b) {',
        '        const ɵsuperIndex = name => super[name];',
        '        const ɵsuper = Object.create(null, {',
        '            foo: { get: () => super.foo }',
        '        });',
        // Since we need to access `ɵsuper` and ɵsuperIndex the generator is defined inline.
        '        return Zone.__awaiter(this, [a, b], function* foo_generator_1(a, b) {',
        '            const foo = ɵsuper.foo;',
        '            yield ɵsuper.foo.call(this, a, b);',
        '            const bar = ɵsuperIndex("bar");',
        '            ɵsuperIndex("bar").call(this);',
        '        });',
        '    }',
        '    bar() {',
        '        const ɵsuperIndex_1 = (function (geti, seti) {',
        '          const cache = Object.create(null);',
        '          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });',
        '        })(name => super[name], (name, value) => super[name] = value);',
        '        const ɵsuper_1 = Object.create(null, {',
        '            foo: { get: () => super.foo, set: v => super.foo = v },',
        '            bar: { get: () => super.bar }',
        '        });',
        '        return Zone.__awaiter(this, [], function* bar_generator_1() {',
        '            ɵsuper_1.foo = () => ɵsuper_1.foo.call(this, 10, 20);',
        '            let x = ɵsuper_1.bar;',
        '            ɵsuperIndex_1("bar").value = x;',
        // Since there is an element write, even the element read has to change
        '            x = ɵsuperIndex_1("bar").value;',
        '        });',
        '    }',
        '    car() {',
        '        const ɵsuperIndex_2 = (function (geti, seti) {',
        '          const cache = Object.create(null);',
        '          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });',
        '        })(name => super[name], (name, value) => super[name] = value);',
        '        return Zone.__awaiter(this, [], function* car_generator() {',
        // Since there is an element write, both the element reads before and after the write have
        // to change
        '            let x = ɵsuperIndex_2("bar").value;',
        '            ɵsuperIndex_2("bar").value = x;',
        '            x = ɵsuperIndex_2("bar").value;',
        '        });',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform optional chaining reads and writes of `super` properties within async methods',
       () => {
         const testFile = {
           name: _('/test.ts'),
           contents: [
             'class Base {',
             '  async foo(a, b) {}',
             '  async bar() {}',
             '}',
             'class Child extends Base {',
             '  async foo(a, b) {',
             '    const foo = super.foo?.toString();',
             '    await super.foo?.(a, b);',
             '    super["bar"]?.();',
             '  }',
             '}',
           ].join('\n')
         };
         const emittedContent = emitProgram(testFile);
         expect(emittedContent.split(/\r?\n/g)).toEqual([
           'function* foo_generator(a, b) { }',
           'function* bar_generator() { }',
           'class Base {',
           '    foo(a, b) {',
           '        return Zone.__awaiter(this, [a, b], foo_generator);',
           '    }',
           '    bar() {',
           '        return Zone.__awaiter(this, [], bar_generator);',
           '    }',
           '}',
           'class Child extends Base {',
           '    foo(a, b) {',
           '        const ɵsuperIndex = name => super[name];',
           '        const ɵsuper = Object.create(null, {',
           '            foo: { get: () => super.foo }',
           '        });',
           '        return Zone.__awaiter(this, [a, b], function* foo_generator_1(a, b) {',
           '            const foo = ɵsuper.foo?.toString();',
           '            yield ɵsuper.foo?.call(this, a, b);',
           '            ɵsuperIndex("bar")?.call(this);',
           '        });',
           '    }',
           '}',
           '',
         ]);
       });

    it('should ignore nested super access within an async function', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Base {',
          '  foo() {}',
          '}',
          'class Outer extends Base {',
          '  constructor() { super(); }',
          '  prop = super.foo;',
          '  async bar() {',
          '    class Inner extends Base {',
          '      constructor() { super(); }',
          '      foo() { super.foo(); }',
          '      get bar() { return super.foo(); }',
          '      set bar(v) { super.foo(); }',
          '    }',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* bar_generator() {',
        '    class Inner extends Base {',
        '        constructor() { super(); }',
        '        foo() { super.foo(); }',
        '        get bar() { return super.foo(); }',
        '        set bar(v) { super.foo(); }',
        '    }',
        '}',
        'class Base {',
        '    foo() { }',
        '}',
        'class Outer extends Base {',
        '    constructor() {',
        '        super();',
        '        this.prop = super.foo;',
        '    }',
        '    bar() {',
        '        return Zone.__awaiter(this, [], bar_generator);',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform accesses of `super` within async arrows', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Base {',
          '  foo(a, b) { return 10; }',
          '}',
          'class Child extends Base {',
          '  foo(a, b) {',
          '    const callSuperFoo = async () => await super.foo(a, b) + await super["foo"](a, b);',
          '    callSuperFoo();',
          '    return 20;',
          '  }',
          '  async bar(a, b) {',
          '    const callSuperFoo = async () => await super.foo(a, b) + await super["foo"](a, b);',
          '    await callSuperFoo();',
          '  }',
          '  async moo(a, b) {',
          '    const callSuperFoo = () => super.foo(a, b) + super["foo"](a, b);',
          '    await callSuperFoo();',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'class Base {',
        '    foo(a, b) { return 10; }',
        '}',
        'class Child extends Base {',
        '    foo(a, b) {',
        '        const ɵsuperIndex = name => super[name];',
        '        const ɵsuper = Object.create(null, {',
        '            foo: { get: () => super.foo }',
        '        });',
        '        const callSuperFoo = () => Zone.__awaiter(this, [], function* callSuperFoo_generator() { return (yield ɵsuper.foo.call(this, a, b)) + (yield ɵsuperIndex("foo").call(this, a, b)); });',
        '        callSuperFoo();',
        '        return 20;',
        '    }',
        '    bar(a, b) {',
        '        const ɵsuperIndex_1 = name => super[name];',
        '        const ɵsuper_1 = Object.create(null, {',
        '            foo: { get: () => super.foo }',
        '        });',
        '        return Zone.__awaiter(this, [a, b], function* bar_generator(a, b) {',
        '            const callSuperFoo = () => Zone.__awaiter(this, [], function* callSuperFoo_generator_1() { return (yield ɵsuper_1.foo.call(this, a, b)) + (yield ɵsuperIndex_1("foo").call(this, a, b)); });',
        '            yield callSuperFoo();',
        '        });',
        '    }',
        '    moo(a, b) {',
        '        const ɵsuperIndex_2 = name => super[name];',
        '        const ɵsuper_2 = Object.create(null, {',
        '            foo: { get: () => super.foo }',
        '        });',
        '        return Zone.__awaiter(this, [a, b], function* moo_generator(a, b) {',
        '            const callSuperFoo = () => ɵsuper_2.foo.call(this, a, b) + ɵsuperIndex_2("foo").call(this, a, b);',
        '            yield callSuperFoo();',
        '        });',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform array literal function parameters correctly', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: 'export async function foo(...[a, [b = 20], ...c]: any[]) {}',
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator(...[a, [b = 20], ...c]) { }',
        'export function foo(...[a, [b = 20], ...c]) {',
        '    return Zone.__awaiter(this, [...[a, [b], ...c]], foo_generator);',
        '}',
        '',
      ]);
    });

    it('should transform object literal function parameters correctly', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: 'export async function foo({a = 10}, ...{"b-b": {c: d = 20}, ...e}) {}',
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function* foo_generator({ a = 10 }, ...{ "b-b": { c: d = 20 }, ...e }) { }',
        'export function foo({ a = 10 }, ...{ "b-b": { c: d = 20 }, ...e }) {',
        '    return Zone.__awaiter(this, [{ a }, ...{ "b-b": { c: d }, ...e }], foo_generator);',
        '}',
        '',
      ]);
    });

    it('should transform `arguments` access within async functions', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: `
        function foo() {
          let obj: any = { arguments: [] };
          function other() {}

          var asyncArrow = async (foo: any) => {
            await foo;
            await (other as any).apply(this, arguments);
            arguments?.[0]?.toString();
            const x = arguments ?? 10;
            const y = foo ?? arguments;
            obj.arguments;
            obj = { arguments: {} };
            obj = { arguments };
          };

          var asyncArrow2 = async () => {
            class arguments {
              arguments() {}
            }
          };

          var asyncArrow3 = async () => {
            enum arguments {
              arguments
            }
          };

          var asyncArrow4 = async () => {
            arguments:
            while(true) {
              if (arguments[0]) continue arguments;
              break arguments;
            }
          };

          const localArgs = arguments;

          const syncArrow = (foo: any) => {
            (other as any).apply(this, arguments);
          };
        }`,
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function foo() {',
        '    const ɵarguments = arguments;',
        '    function* asyncArrow_generator(foo) {',
        '        yield foo;',
        '        yield other.apply(this, ɵarguments);',
        '        ɵarguments?.[0]?.toString();',
        '        const x = ɵarguments ?? 10;',
        '        const y = foo ?? ɵarguments;',
        '        obj.arguments;',
        '        obj = { arguments: {} };',
        '        obj = { arguments: ɵarguments };',
        '    }',
        '    function* asyncArrow2_generator() {',
        '        class arguments {',
        '            arguments() { }',
        '        }',
        '    }',
        '    function* asyncArrow3_generator() {',
        '        let arguments;',
        '        (function (arguments) {',
        '            arguments[arguments["arguments"] = 0] = "arguments";',
        '        })(arguments || (arguments = {}));',
        '    }',
        '    function* asyncArrow4_generator() {',
        '        arguments: while (true) {',
        '            if (ɵarguments[0])',
        '                continue arguments;',
        '            break arguments;',
        '        }',
        '    }',
        '    let obj = { arguments: [] };',
        '    function other() { }',
        '    var asyncArrow = (foo) => Zone.__awaiter(this, [foo], asyncArrow_generator);',
        '    var asyncArrow2 = () => Zone.__awaiter(this, [], asyncArrow2_generator);',
        '    var asyncArrow3 = () => Zone.__awaiter(this, [], asyncArrow3_generator);',
        '    var asyncArrow4 = () => Zone.__awaiter(this, [], asyncArrow4_generator);',
        '    const localArgs = arguments;',
        '    const syncArrow = (foo) => {',
        '        other.apply(this, arguments);',
        '    };',
        '}',
        '',
      ]);
    });

    it('should not transform `arguments` access within a normal function inside an async function',
       () => {
         const testFile = {
           name: _('/test.ts'),
           contents: `
        function foo() {
          const asyncArrow = async () => {
            function innerFunction() {
              const x = arguments[0];
            }
          };
        }`,
         };
         const emittedContent = emitProgram(testFile);
         expect(emittedContent.split(/\r?\n/g)).toEqual([
           'function foo() {',
           '    function* asyncArrow_generator() {',
           '        function innerFunction() {',
           '            const x = arguments[0];',
           '        }',
           '    }',
           '    const asyncArrow = () => Zone.__awaiter(this, [], asyncArrow_generator);',
           '}',
           '',
         ]);
       });
  });

  function emitProgram(testFile: Parameters<typeof makeProgram>[0][0]): string {
    // `makeProgram()` defaults `noLib` to true but we need it to be `false` so we can use
    // `Promise`.
    const {program, host} = makeProgram(
        [testFile], {noLib: false, target: ts.ScriptTarget.ES2020, importHelpers: true});
    program.emit(undefined, undefined, undefined, undefined, {after: [createAsyncTransform()]});
    return host.readFile(testFile.name.replace(/\.ts$/, '.js'))!;
  }
});
