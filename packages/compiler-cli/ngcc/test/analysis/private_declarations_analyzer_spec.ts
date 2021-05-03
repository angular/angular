/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {Reference} from '../../../src/ngtsc/imports';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {PrivateDeclarationsAnalyzer} from '../../src/analysis/private_declarations_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('PrivateDeclarationsAnalyzer', () => {
    describe('analyzeProgram()', () => {
      it('should find all NgModule declarations that were not publicly exported from the entry-point',
         () => {
           const _ = absoluteFrom;

           const TEST_PROGRAM: TestFile[] = [
             {
               name: _('/node_modules/test-package/src/entry_point.js'),
               isRoot: true,
               contents: `
        export {PublicComponent} from './a';
        export {ModuleA} from './mod';
        export {ModuleB} from './b';
      `
             },
             {
               name: _('/node_modules/test-package/src/a.js'),
               isRoot: false,
               contents: `
        import {Component} from '@angular/core';
        export class PublicComponent {}
        PublicComponent.decorators = [
          {type: Component, args: [{selectors: 'a', template: ''}]}
        ];
      `
             },
             {
               name: _('/node_modules/test-package/src/b.js'),
               isRoot: false,
               contents: `
        import {Component, NgModule} from '@angular/core';
        class PrivateComponent1 {}
        PrivateComponent1.decorators = [
          {type: Component, args: [{selectors: 'b', template: ''}]}
        ];
        class PrivateComponent2 {}
        PrivateComponent2.decorators = [
          {type: Component, args: [{selectors: 'c', template: ''}]}
        ];
        export class ModuleB {}
        ModuleB.decorators = [
          {type: NgModule, args: [{declarations: [PrivateComponent1]}]}
        ];
      `
             },
             {
               name: _('/node_modules/test-package/src/c.js'),
               isRoot: false,
               contents: `
        import {Component} from '@angular/core';
        export class InternalComponent1 {}
        InternalComponent1.decorators = [
          {type: Component, args: [{selectors: 'd', template: ''}]}
        ];
        export class InternalComponent2 {}
        InternalComponent2.decorators = [
          {type: Component, args: [{selectors: 'e', template: ''}]}
        ];
      `
             },
             {
               name: _('/node_modules/test-package/src/mod.js'),
               isRoot: false,
               contents: `
        import {Component, NgModule} from '@angular/core';
        import {PublicComponent} from './a';
        import {ModuleB} from './b';
        import {InternalComponent1} from './c';
        export class ModuleA {}
        ModuleA.decorators = [
          {type: NgModule, args: [{
            declarations: [PublicComponent, InternalComponent1],
            imports: [ModuleB]
          }]}
        ];
      `
             }
           ];
           const TEST_DTS_PROGRAM = [
             {
               name: _('/node_modules/test-package/typings/entry_point.d.ts'),
               isRoot: true,
               contents: `
        export {PublicComponent} from './a';
        export {ModuleA} from './mod';
        export {ModuleB} from './b';
      `
             },
             {
               name: _('/node_modules/test-package/typings/a.d.ts'),
               isRoot: false,
               contents: `
        export declare class PublicComponent {}
      `
             },
             {
               name: _('/node_modules/test-package/typings/b.d.ts'),
               isRoot: false,
               contents: `
        export declare class ModuleB {}
      `
             },
             {
               name: _('/node_modules/test-package/typings/c.d.ts'),
               isRoot: false,
               contents: `
        export declare class InternalComponent1 {}
      `
             },
             {
               name: _('/node_modules/test-package/typings/mod.d.ts'),
               isRoot: false,
               contents: `
        import {PublicComponent} from './a';
        import {ModuleB} from './b';
        import {InternalComponent1} from './c';
        export declare class ModuleA {}
      `
             },
           ];
           const {program, referencesRegistry, analyzer} = setup(TEST_PROGRAM, TEST_DTS_PROGRAM);

           addToReferencesRegistry(
               program, referencesRegistry, _('/node_modules/test-package/src/a.js'),
               'PublicComponent');
           addToReferencesRegistry(
               program, referencesRegistry, _('/node_modules/test-package/src/b.js'),
               'PrivateComponent1');
           addToReferencesRegistry(
               program, referencesRegistry, _('/node_modules/test-package/src/c.js'),
               'InternalComponent1');

           const analyses = analyzer.analyzeProgram(program);
           // Note that `PrivateComponent2` and `InternalComponent2` are not found because they are
           // not added to the ReferencesRegistry (i.e. they were not declared in an NgModule).
           expect(analyses.length).toEqual(2);
           expect(analyses).toEqual([
             {
               identifier: 'PrivateComponent1',
               from: _('/node_modules/test-package/src/b.js'),
               dtsFrom: null,
             },
             {
               identifier: 'InternalComponent1',
               from: _('/node_modules/test-package/src/c.js'),
               dtsFrom: _('/node_modules/test-package/typings/c.d.ts'),
             },
           ]);
         });
    });
  });

  function setup(jsProgram: TestFile[], dtsProgram: TestFile[]) {
    loadTestFiles(jsProgram);
    loadTestFiles(dtsProgram);
    const {src, dts} = makeTestEntryPointBundle(
        'test-package', 'esm2015', false, getRootFiles(jsProgram), getRootFiles(dtsProgram));
    const host = new Esm2015ReflectionHost(new MockLogger(), false, src, dts);
    const referencesRegistry = new NgccReferencesRegistry(host);
    const analyzer = new PrivateDeclarationsAnalyzer(host, referencesRegistry);
    return {program: src.program, referencesRegistry, analyzer};
  }

  /**
   * Add up the named component to the references registry.
   *
   * This would normally be done by the decoration handlers in the `DecorationAnalyzer`.
   */
  function addToReferencesRegistry(
      program: ts.Program, registry: NgccReferencesRegistry, fileName: AbsoluteFsPath,
      componentName: string) {
    const declaration = getDeclaration(program, fileName, componentName, ts.isClassDeclaration);
    registry.add(null!, new Reference(declaration));
  }
});
