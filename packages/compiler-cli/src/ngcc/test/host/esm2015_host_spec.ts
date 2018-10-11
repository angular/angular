/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as ts from 'typescript';

import {DtsMapper} from '../../src/host/dts_mapper';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getDeclaration, makeProgram} from '../helpers/utils';

const CLASSES = [
  {
    name: '/src/class.js',
    contents: `
      export class NoTypeParam {}
      export class OneTypeParam {}
      export class TwoTypeParams {}
    `,
  },
  {
    name: '/typings/class.d.ts',
    contents: `
      export class NoTypeParam {}
      export class OneTypeParam<T> {}
      export class TwoTypeParams<T, K> {}
    `,
  },
];

const MARKER_FILE = {
  name: '/marker.js',
  contents: `
    let compileNgModuleFactory = compileNgModuleFactory__PRE_NGCC__;

    function compileNgModuleFactory__PRE_NGCC__(injector, options, moduleType) {
      const compilerFactory = injector.get(CompilerFactory);
      const compiler = compilerFactory.createCompiler([options]);
      return compiler.compileModuleAsync(moduleType);
    }

    function compileNgModuleFactory__POST_NGCC__(injector, options, moduleType) {
      ngDevMode && assertNgModuleType(moduleType);
      return Promise.resolve(new R3NgModuleFactory(moduleType));
    }
  `
};

const DECORATED_FILES = [
  {
    name: '/primary.js',
    contents: `
    import {Directive} from '@angular/core';
    class A {}
    A.decorators = [
      { type: Directive, args: [{ selector: '[a]' }] }
    ];
    function x() {}
    function y() {}
    class B {}
    B.decorators = [
      { type: Directive, args: [{ selector: '[b]' }] }
    ];
    class C {}
    export { A, x, C };
    export { D } from '/secondary';
    `
  },
  {
    name: '/secondary.js',
    contents: `
    import {Directive} from '@angular/core';
    class D {}
    D.decorators = [
      { type: Directive, args: [{ selector: '[d]' }] }
    ];
    export { D };
    `
  }
];

describe('Esm2015ReflectionHost', () => {
  describe('getGenericArityOfClass()', () => {
    it('should properly count type parameters', () => {
      // Mock out reading the `d.ts` file from disk
      const readFileSyncSpy = spyOn(fs, 'readFileSync').and.returnValue(CLASSES[1].contents);
      const program = makeProgram(CLASSES[0]);

      const dtsMapper = new DtsMapper('/src', '/typings');
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker(), dtsMapper);
      const noTypeParamClass =
          getDeclaration(program, '/src/class.js', 'NoTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(noTypeParamClass)).toBe(0);
      const oneTypeParamClass =
          getDeclaration(program, '/src/class.js', 'OneTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(oneTypeParamClass)).toBe(1);
      const twoTypeParamsClass =
          getDeclaration(program, '/src/class.js', 'TwoTypeParams', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(twoTypeParamsClass)).toBe(2);
    });
  });

  describe('getSwitchableDeclarations()', () => {
    it('should return a collection of all the switchable variable declarations in the given module',
       () => {
         const program = makeProgram(MARKER_FILE);
         const dtsMapper = new DtsMapper('/src', '/typings');
         const host = new Esm2015ReflectionHost(false, program.getTypeChecker(), dtsMapper);
         const file = program.getSourceFile(MARKER_FILE.name) !;
         const declarations = host.getSwitchableDeclarations(file);
         expect(declarations.map(d => [d.name.getText(), d.initializer !.getText()])).toEqual([
           ['compileNgModuleFactory', 'compileNgModuleFactory__PRE_NGCC__']
         ]);
       });
  });

  describe('findDecoratedFiles()', () => {
    it('should return an array of objects for each file that has exported and decorated classes',
       () => {
         const program = makeProgram(...DECORATED_FILES);
         const dtsMapper = new DtsMapper('/src', '/typings');
         const host = new Esm2015ReflectionHost(false, program.getTypeChecker(), dtsMapper);
         const primaryFile = program.getSourceFile(DECORATED_FILES[0].name) !;
         const secondaryFile = program.getSourceFile(DECORATED_FILES[1].name) !;
         const decoratedFiles = host.findDecoratedFiles(primaryFile);

         expect(decoratedFiles.size).toEqual(2);

         const primary = decoratedFiles.get(primaryFile) !;
         expect(primary.decoratedClasses.length).toEqual(1);
         const classA = primary.decoratedClasses.find(c => c.name === 'A') !;
         expect(classA.name).toEqual('A');
         expect(ts.isClassDeclaration(classA.declaration)).toBeTruthy();
         expect(classA.decorators.map(decorator => decorator.name)).toEqual(['Directive']);

         const secondary = decoratedFiles.get(secondaryFile) !;
         expect(secondary.decoratedClasses.length).toEqual(1);
         const classD = secondary.decoratedClasses.find(c => c.name === 'D') !;
         expect(classD.name).toEqual('D');
         expect(ts.isClassDeclaration(classD.declaration)).toBeTruthy();
         expect(classD.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
       });
  });
});
