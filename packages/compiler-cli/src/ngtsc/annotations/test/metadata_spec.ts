/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Statement} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeScriptReflectionHost} from '../../metadata';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {ImportManager, translateStatement} from '../../translator';
import {generateSetClassMetadataCall} from '../src/metadata';

const CORE = {
  name: 'node_modules/@angular/core/index.d.ts',
  contents: `
    export declare function Input(...args: any[]): any;
    export declare function Inject(...args: any[]): any;
    export declare function Component(...args: any[]): any;
    export declare class Injector {}
  `
};

describe('ngtsc setClassMetadata converter', () => {
  it('should convert decorated class metadata', () => {
    const res = compileAndPrint(`
    import {Component} from '@angular/core';
    
    @Component('metadata') class Target {}
    `);
    expect(res).toEqual(
        `/*@__PURE__*/ i0.ɵsetClassMetadata(Target, [{ type: Component, args: ['metadata'] }], null, null);`);
  });

  it('should convert decorated class construtor parameter metadata', () => {
    const res = compileAndPrint(`
    import {Component, Inject, Injector} from '@angular/core';
    const FOO = 'foo';
    
    @Component('metadata') class Target {
      constructor(@Inject(FOO) foo: any, bar: Injector) {}
    }
    `);
    expect(res).toContain(
        `[{ type: undefined, decorators: [{ type: Inject, args: [FOO] }] }, { type: Injector }], null);`);
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

  it('should not convert non-angular decorators to metadata', () => {
    const res = compileAndPrint(`
    declare function NotAComponent(...args: any[]): any;
    
    @NotAComponent('metadata') class Target {}
    `);
    expect(res).toBe('');
  });
});

function compileAndPrint(contents: string): string {
  const {program} = makeProgram([
    CORE, {
      name: 'index.ts',
      contents,
    }
  ]);
  const host = new TypeScriptReflectionHost(program.getTypeChecker());
  const target = getDeclaration(program, 'index.ts', 'Target', ts.isClassDeclaration);
  const call = generateSetClassMetadataCall(target, host, false);
  if (call === null) {
    return '';
  }
  const sf = program.getSourceFile('index.ts') !;
  const im = new ImportManager(false, 'i');
  const tsStatement = translateStatement(call, im);
  const res = ts.createPrinter().printNode(ts.EmitHint.Unspecified, tsStatement, sf);
  return res.replace(/\s+/g, ' ');
}
