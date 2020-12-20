/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chai from 'chai';
import * as ts from 'typescript';

import {publicApiInternal, SerializationOptions} from '../lib/serializer';

const classesAndInterfaces = `
  export declare class A {
      field: string;
      method(a: string): number;
  }
  export interface B {
      field: A;
  }
  export declare class C {
      someProp: string;
      propWithDefault: number;
      private privateProp;
      protected protectedProp: number;
      constructor(someProp: string, propWithDefault: number, privateProp: any, protectedProp: number);
  }
`;

describe('unit test', () => {
  let _warn: any = null;
  let warnings: string[] = [];
  beforeEach(() => {
    _warn = console.warn;
    console.warn = (...args: string[]) => warnings.push(args.join(' '));
  });

  afterEach(() => {
    console.warn = _warn;
    warnings = [];
    _warn = null;
  });

  it('should ignore private methods', () => {
    const input = `
      export declare class A {
          fa(): void;
          protected fb(): void;
          private fc();
      }
    `;
    const expected = `
      export declare class A {
          fa(): void;
          protected fb(): void;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should support overloads functions', () => {
    const input = `
      export declare function group(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationGroupMetadata;

      export declare function registerLocaleData(data: any, extraData?: any): void;
      export declare function registerLocaleData(data: any, localeId?: string, extraData?: any): void;
    `;

    const expected = `
      export declare function group(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationGroupMetadata;

      export declare function registerLocaleData(data: any, extraData?: any): void;
      export declare function registerLocaleData(data: any, localeId?: string, extraData?: any): void;
    `;

    check({'file.d.ts': input}, expected);
  });

  it('should ignore private props', () => {
    const input = `
      export declare class A {
          fa: any;
          protected fb: any;
          private fc;
      }
    `;
    const expected = `
      export declare class A {
          fa: any;
          protected fb: any;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should support imports without capturing imports', () => {
    const input = `
      import {A} from './classes_and_interfaces';
      export declare class C {
          field: A;
      }
    `;
    const expected = `
      export declare class C {
          field: A;
      }
    `;
    check({'classes_and_interfaces.d.ts': classesAndInterfaces, 'file.d.ts': input}, expected);
  });

  it('should throw on aliased reexports', () => {
    const input = `
      export { A as Apple } from './classes_and_interfaces';
    `;
    checkThrows(
        {'classes_and_interfaces.d.ts': classesAndInterfaces, 'file.d.ts': input},
        'Symbol "A" was aliased as "Apple". Aliases are not supported.');
  });

  it('should remove reexported external symbols', () => {
    const input = `
      export { Foo } from 'some-external-module-that-cannot-be-resolved';
    `;
    const expected = `
    `;
    check({'classes_and_interfaces.d.ts': classesAndInterfaces, 'file.d.ts': input}, expected);
    chai.assert.deepEqual(
        warnings, ['file.d.ts(1,1): error: No export declaration found for symbol "Foo"']);
  });

  it('should sort exports', () => {
    const input = `
      export declare type E = string;
      export interface D {
          e: number;
      }
      export declare var e: C;
      export declare class C {
          e: number;
          d: string;
      }
      export declare function b(): boolean;
      export declare const a: string;
    `;
    const expected = `
      export declare const a: string;

      export declare function b(): boolean;

      export declare class C {
          d: string;
          e: number;
      }

      export interface D {
          e: number;
      }

      export declare var e: C;

      export declare type E = string;
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should sort class members', () => {
    const input = `
      export class A {
        f: number;
        static foo(): void;
        c: string;
        static a: boolean;
        constructor();
        static bar(): void;
      }
    `;
    const expected = `
      export class A {
        c: string;
        f: number;
        constructor();
        static a: boolean;
        static bar(): void;
        static foo(): void;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should sort interface members', () => {
    const input = `
      export interface A {
        (): void;
        [key: string]: any;
        c(): void;
        a: number;
        new (): Object;
      }
    `;
    const expected = `
      export interface A {
        a: number;
        (): void;
        new (): Object;
        [key: string]: any;
        c(): void;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should sort class members including readonly', () => {
    const input = `
        export declare class DebugNode {
          private _debugContext;
          nativeNode: any;
          listeners: any[];
          parent: any | null;
          constructor(nativeNode: any, parent: DebugNode | null, _debugContext: any);
          readonly injector: any;
          readonly componentInstance: any;
          readonly context: any;
          readonly references: {
              [key: string]: any;
          };
          readonly providerTokens: any[];
      }
    `;
    const expected = `
        export declare class DebugNode {
          readonly componentInstance: any;
          readonly context: any;
          readonly injector: any;
          listeners: any[];
          nativeNode: any;
          parent: any | null;
          readonly providerTokens: any[];
          readonly references: {
              [key: string]: any;
          };
          constructor(nativeNode: any, parent: DebugNode | null, _debugContext: any);
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should sort two call signatures', () => {
    const input = `
      export interface A {
        (b: number): void;
        (a: number): void;
      }
    `;
    const expected = `
      export interface A {
        (a: number): void;
        (b: number): void;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should sort exports including re-exports', () => {
    const submodule = `
      export declare var e: C;
      export declare class C {
          e: number;
          d: string;
      }
    `;
    const input = `
      export * from './submodule';
      export declare type E = string;
      export interface D {
          e: number;
      }
      export declare function b(): boolean;
      export declare const a: string;
    `;
    const expected = `
      export declare const a: string;

      export declare function b(): boolean;

      export declare class C {
          d: string;
          e: number;
      }

      export interface D {
          e: number;
      }

      export declare var e: C;

      export declare type E = string;
    `;
    check({'submodule.d.ts': submodule, 'file.d.ts': input}, expected);
  });

  it('should remove module comments', () => {
    const input = `
      /**
       * An amazing module.
       * @module
       */
      /**
       * Foo function.
       */
      export declare function foo(): boolean;
      export declare const bar: number;
    `;
    const expected = `
      export declare const bar: number;

      export declare function foo(): boolean;
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should remove class and field comments', () => {
    const input = `
      /**
       * Does something really cool.
       */
      export declare class A {
          /**
           * A very interesting getter.
           */
          b: string;
          /**
           * A very useful field.
           */
          name: string;
      }
    `;
    const expected = `
      export declare class A {
          b: string;
          name: string;
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should skip symbols matching specified pattern', () => {
    const input = `
      export const __a__: string;
      export class B {
      }
    `;
    const expected = `
      export class B {
      }
    `;
    check({'file.d.ts': input}, expected, {stripExportPattern: /^__.*/});
  });

  it('should throw on using module imports in expression position that were not explicitly allowed',
     () => {
       const input = `
      import * as foo from './foo';
      export declare class A extends foo.A {
      }
    `;
       checkThrows(
           {'file.d.ts': input},
           'file.d.ts(2,32): error: Module identifier "foo" is not allowed. ' +
               'Remove it from source or allow it via --allowModuleIdentifiers.');
     });

  it('should throw on using module imports in type position that were not explicitly allowed',
     () => {
       const input = `
      import * as foo from './foo';
      export type A = foo.A;
    `;
       checkThrows(
           {'file.d.ts': input},
           'file.d.ts(2,17): error: Module identifier "foo" is not allowed. ' +
               'Remove it from source or allow it via --allowModuleIdentifiers.');
     });

  it('should not throw on using explicitly allowed module imports', () => {
    const input = `
      import * as foo from './foo';
      export declare class A extends foo.A {
      }
    `;
    const expected = `
      export declare class A extends foo.A {
      }
    `;
    check({'file.d.ts': input}, expected, {allowModuleIdentifiers: ['foo']});
  });

  it('should not throw if module imports, that were not explicitly allowed, are not used', () => {
    const input = `
      import * as foo from './foo';
      export declare class A {
      }
    `;
    const expected = `
      export declare class A {
      }
    `;
    check({'file.d.ts': input}, expected);
  });

  it('should copy specified jsdoc tags of exports in docstrings', () => {
    const input = `
      /**
       * @deprecated This is useless now
       */
      export declare class A {
      }
      /**
       * @experimental
       */
      export declare const b: string;
      /**
       * @stable
       */
      export declare var c: number;
    `;
    const expected = `
      /** @deprecated */
      export declare class A {
      }

      /** @experimental */
      export declare const b: string;

      export declare var c: number;
    `;
    check({'file.d.ts': input}, expected, {exportTags: {toCopy: ['deprecated', 'experimental']}});
  });

  it('should copy specified jsdoc tags of fields in docstrings', () => {
    const input = `
      /** @otherTag */
      export declare class A {
        /**
         * @stable
         */
        value: number;
        /**
         * @experimental
         * @otherTag
         */
        constructor();
        /**
         * @deprecated
         */
        foo(): void;
      }
    `;
    const expected = `
      export declare class A {
        value: number;
        /** @experimental */ constructor();
        /** @deprecated */ foo(): void;
      }
    `;
    check({'file.d.ts': input}, expected, {memberTags: {toCopy: ['deprecated', 'experimental']}});
  });

  it('should copy specified jsdoc tags of parameters in docstrings', () => {
    const input = `
      export declare class A {
        foo(str: string, /** @deprecated */ value: number): void;
      }
    `;
    const expected = `
      export declare class A {
        foo(str: string, /** @deprecated */ value: number): void;
      }
    `;
    check({'file.d.ts': input}, expected, {paramTags: {toCopy: ['deprecated', 'experimental']}});
  });

  it('should throw on using banned jsdoc tags on exports', () => {
    const input = `
      /**
       * @stable
       */
      export declare class A {
        value: number;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(4,1): error: Banned jsdoc tags - "@stable" - were found on `A`.',
        {exportTags: {banned: ['stable']}});
  });

  it('should throw on using banned jsdoc tags on fields', () => {
    const input = `
      export declare class A {
        /**
         * @stable
         */
        value: number;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(5,3): error: Banned jsdoc tags - "@stable" - were found on `value`.',
        {memberTags: {banned: ['stable']}});
  });

  it('should throw on using banned jsdoc tags on parameters', () => {
    const input = `
      export declare class A {
        foo(/** @stable */ param: number): void;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(2,22): error: Banned jsdoc tags - "@stable" - were found on `param`.',
        {paramTags: {banned: ['stable']}});
  });

  it('should throw on missing required jsdoc tags on exports', () => {
    const input = `
      /** @experimental */
      export declare class A {
        value: number;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(2,1): error: Required jsdoc tags - One of the tags: "@stable" - must exist on `A`.',
        {exportTags: {requireAtLeastOne: ['stable']}});
  });

  it('should throw on missing required jsdoc tags on fields', () => {
    const input = `
      /** @experimental */
      export declare class A {
        value: number;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(3,3): error: Required jsdoc tags - One of the tags: "@stable" - must exist on `value`.',
        {memberTags: {requireAtLeastOne: ['stable']}});
  });

  it('should throw on missing required jsdoc tags on parameters', () => {
    const input = `
      /** @experimental */
      export declare class A {
        foo(param: number): void;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(3,7): error: Required jsdoc tags - One of the tags: "@stable" - must exist on `param`.',
        {paramTags: {requireAtLeastOne: ['stable']}});
  });

  it('should require at least one of the requireAtLeastOne tags', () => {
    const input = `
      /** @experimental */
      export declare class A {
        foo(param: number): void;
      }
    `;
    checkThrows(
        {'file.d.ts': input},
        'file.d.ts(3,7): error: Required jsdoc tags - One of the tags: "@stable", "@foo", "@bar" - must exist on `param`.',
        {paramTags: {requireAtLeastOne: ['stable', 'foo', 'bar']}});
  });

  it('should allow with one of the requireAtLeastOne tags found', () => {
    const input = `
      /**
       * @foo
       * @bar
       * @stable
       */
      export declare class A {
      }
      /**
       * @foo
       */
      export declare const b: string;
      /**
       * @bar
       */
      export declare var c: number;
      /**
       * @stable
       */
      export declare function d(): void;
    `;
    const expected = `
    export declare class A {
    }

    export declare const b: string;

    export declare var c: number;

    export declare function d(): void;
    `;
    check(
        {'file.d.ts': input}, expected,
        {exportTags: {requireAtLeastOne: ['stable', 'foo', 'bar']}});
  });
});

function getMockHost(files: {[name: string]: string}): ts.CompilerHost {
  return {
    getSourceFile: (sourceName, languageVersion) => {
      if (!files[sourceName]) return undefined;
      return ts.createSourceFile(
          sourceName, stripExtraIndentation(files[sourceName]), languageVersion, true);
    },
    writeFile: (name, text, writeByteOrderMark) => {},
    fileExists: (filename) => !!files[filename],
    readFile: (filename) => stripExtraIndentation(files[filename]),
    getDefaultLibFileName: () => 'lib.ts',
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (filename) => filename,
    getCurrentDirectory: () => './',
    getNewLine: () => '\n',
    getDirectories: () => []
  };
}

function check(
    files: {[name: string]: string}, expected: string, options: SerializationOptions = {}) {
  const actual = publicApiInternal(getMockHost(files), 'file.d.ts', {}, options);
  chai.assert.equal(actual.trim(), stripExtraIndentation(expected).trim());
}

function checkThrows(
    files: {[name: string]: string}, error: string, options: SerializationOptions = {}) {
  chai.assert.throws(() => {
    publicApiInternal(getMockHost(files), 'file.d.ts', {}, options);
  }, error);
}

function stripExtraIndentation(text: string) {
  let lines = text.split('\n');
  // Ignore first and last new line
  lines = lines.slice(1, lines.length - 1);
  const commonIndent = lines.reduce((min, line) => {
    const indent = /^( *)/.exec(line)![1].length;
    // Ignore empty line
    return line.length ? Math.min(min, indent) : min;
  }, text.length);

  return lines.map(line => line.substr(commonIndent)).join('\n') + '\n';
}
