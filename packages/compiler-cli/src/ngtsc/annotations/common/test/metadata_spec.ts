/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileClassMetadata} from '@angular/compiler';
import ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../../file_system';
import {runInEachFileSystem, TestFile} from '../../../file_system/testing';
import {NoopImportRewriter} from '../../../imports';
import {TypeScriptReflectionHost} from '../../../reflection';
import {getDeclaration, makeProgram} from '../../../testing';
import {ImportManager, translateStatement} from '../../../translator';
import {extractClassMetadata} from '../src/metadata';

runInEachFileSystem(() => {
  describe('ngtsc setClassMetadata converter', () => {
    it('should convert decorated class metadata', () => {
      const res = compileAndPrint(`
    import {Component} from '@angular/core';

    @Component('metadata') class Target {}
    `);
      expect(res).toEqual(
          `(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Target, [{ type: Component, args: ['metadata'] }], null, null); })();`);
    });

    it('should convert namespaced decorated class metadata', () => {
      const res = compileAndPrint(`
    import * as core from '@angular/core';

    @core.Component('metadata') class Target {}
    `);
      expect(res).toEqual(
          `(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Target, [{ type: core.Component, args: ['metadata'] }], null, null); })();`);
    });

    it('should convert decorated class constructor parameter metadata', () => {
      const res = compileAndPrint(`
    import {Component, Inject, Injector} from '@angular/core';
    const FOO = 'foo';

    @Component('metadata') class Target {
      constructor(@Inject(FOO) foo: any, bar: Injector) {}
    }
    `);
      expect(res).toContain(
          `function () { return [{ type: undefined, decorators: [{ type: Inject, args: [FOO] }] }, { type: i0.Injector }]; }, null);`);
    });

    it('should convert decorated field metadata', () => {
      const res = compileAndPrint(`
    import {Component, Input} from '@angular/core';

    @Component('metadata') class Target {
      @Input() foo: string;

      @Input('value') bar: string;

      notDecorated: string;
    }
    `);
      expect(res).toContain(`{ foo: [{ type: Input }], bar: [{ type: Input, args: ['value'] }] })`);
    });

    it('should convert decorated field getter/setter metadata', () => {
      const res = compileAndPrint(`
    import {Component, Input} from '@angular/core';

    @Component('metadata') class Target {
      @Input() get foo() { return this._foo; }
      set foo(value: string) { this._foo = value; }
      private _foo: string;

      get bar() { return this._bar; }
      @Input('value') set bar(value: string) { this._bar = value; }
      private _bar: string;
    }
    `);
      expect(res).toContain(`{ foo: [{ type: Input }], bar: [{ type: Input, args: ['value'] }] })`);
    });

    it('should not convert non-angular decorators to metadata', () => {
      const res = compileAndPrint(`
    declare function NotAComponent(...args: any[]): any;

    @NotAComponent('metadata') class Target {}
    `);
      expect(res).toBe('');
    });

    it('should preserve quotes around class member names', () => {
      const res = compileAndPrint(`
        import {Component, Input} from '@angular/core';

        @Component('metadata') class Target {
          @Input() 'has-dashes-in-name' = 123;
          @Input() noDashesInName = 456;
        }
      `);
      expect(res).toContain(
          `{ 'has-dashes-in-name': [{ type: Input }], noDashesInName: [{ type: Input }] })`);
    });
  });

  function compileAndPrint(contents: string): string {
    const _ = absoluteFrom;
    const CORE: TestFile = {
      name: _('/node_modules/@angular/core/index.d.ts'),
      contents: `
      export declare function Input(...args: any[]): any;
      export declare function Inject(...args: any[]): any;
      export declare function Component(...args: any[]): any;
      export declare class Injector {}
    `
    };

    const {program} = makeProgram(
        [
          CORE, {
            name: _('/index.ts'),
            contents,
          }
        ],
        {target: ts.ScriptTarget.ES2015});
    const host = new TypeScriptReflectionHost(program.getTypeChecker());
    const target = getDeclaration(program, _('/index.ts'), 'Target', ts.isClassDeclaration);
    const call = extractClassMetadata(target, host, false);
    if (call === null) {
      return '';
    }
    const sf = getSourceFileOrError(program, _('/index.ts'));
    const im = new ImportManager(new NoopImportRewriter(), 'i');
    const stmt = compileClassMetadata(call).toStmt();
    const tsStatement = translateStatement(stmt, im);
    const res = ts.createPrinter().printNode(ts.EmitHint.Unspecified, tsStatement, sf);
    return res.replace(/\s+/g, ' ');
  }
});
