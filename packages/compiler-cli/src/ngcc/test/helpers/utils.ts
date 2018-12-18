/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {makeProgram} from '../../../ngtsc/testing/in_memory_typescript';
import {BundleProgram} from '../../src/packages/bundle_program';
import {EntryPointFormat} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';

export {getDeclaration} from '../../../ngtsc/testing/in_memory_typescript';


/**
 *
 * @param format The format of the bundle.
 * @param files The source files to include in the bundle.
 * @param dtsFiles The typings files to include the bundle.
 */
export function makeTestEntryPointBundle(
    format: EntryPointFormat, files: {name: string, contents: string, isRoot?: boolean}[],
    dtsFiles?: {name: string, contents: string, isRoot?: boolean}[]): EntryPointBundle {
  const src = makeTestBundleProgram(files);
  const dts = dtsFiles ? makeTestBundleProgram(dtsFiles) : null;
  const isFlat = src.r3SymbolsFile === null;
  return {format, rootDirs: ['/'], src, dts, isFlat};
}

/**
 * Create a bundle program for testing.
 * @param files The source files of the bundle program.
 */
export function makeTestBundleProgram(files: {name: string, contents: string}[]): BundleProgram {
  const {program, options, host} = makeTestProgramInternal(...files);
  const path = files[0].name;
  const file = program.getSourceFile(path) !;
  const r3SymbolsInfo = files.find(file => file.name.indexOf('r3_symbols') !== -1) || null;
  const r3SymbolsPath = r3SymbolsInfo && r3SymbolsInfo.name;
  const r3SymbolsFile = r3SymbolsPath && program.getSourceFile(r3SymbolsPath) || null;
  return {program, options, host, path, file, r3SymbolsPath, r3SymbolsFile};
}

function makeTestProgramInternal(
    ...files: {name: string, contents: string, isRoot?: boolean | undefined}[]): {
  program: ts.Program,
  host: ts.CompilerHost,
  options: ts.CompilerOptions,
} {
  return makeProgram([getFakeCore(), getFakeTslib(), ...files], {allowJs: true, checkJs: false});
}

export function makeTestProgram(
    ...files: {name: string, contents: string, isRoot?: boolean | undefined}[]): ts.Program {
  return makeTestProgramInternal(...files).program;
}

// TODO: unify this with the //packages/compiler-cli/test/ngtsc/fake_core package
export function getFakeCore() {
  return {
    name: 'node_modules/@angular/core/index.ts',
    contents: `
      type FnWithArg<T> = (arg?: any) => T;

      function callableClassDecorator(): FnWithArg<(clazz: any) => any> {
        return null !;
      }

      function callableParamDecorator(): FnWithArg<(a: any, b: any, c: any) => void> {
        return null !;
      }

      function makePropDecorator(): any {
      }

      export const Component = callableClassDecorator();
      export const Directive = callableClassDecorator();
      export const Injectable = callableClassDecorator();
      export const NgModule = callableClassDecorator();

      export const Input = makePropDecorator();

      export const Inject = callableParamDecorator();
      export const Self = callableParamDecorator();
      export const SkipSelf = callableParamDecorator();
      export const Optional = callableParamDecorator();

      export class InjectionToken {
        constructor(name: string) {}
      }

      export interface ModuleWithProviders<T = any> {}
    `
  };
}

export function getFakeTslib() {
  return {
    name: 'node_modules/tslib/index.ts',
    contents: `
    export function __decorate(decorators: any[], target: any, key?: string | symbol, desc?: any) {}
    export function __param(paramIndex: number, decorator: any) {}
    export function __metadata(metadataKey: any, metadataValue: any) {}
    `
  };
}

export function convertToDirectTsLibImport(filesystem: {name: string, contents: string}[]) {
  return filesystem.map(file => {
    const contents =
        file.contents
            .replace(
                `import * as tslib_1 from 'tslib';`,
                `import { __decorate, __metadata, __read, __values, __param, __extends, __assign } from 'tslib';`)
            .replace(/tslib_1\./g, '');
    return {...file, contents};
  });
}
