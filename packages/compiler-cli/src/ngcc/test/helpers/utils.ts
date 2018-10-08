/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {makeProgram as _makeProgram} from '../../../ngtsc/testing/in_memory_typescript';

export {getDeclaration} from '../../../ngtsc/testing/in_memory_typescript';

export function makeProgram(...files: {name: string, contents: string}[]): ts.Program {
  return _makeProgram([getFakeCore(), getFakeTslib(), ...files], {allowJs: true, checkJs: false})
      .program;
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
