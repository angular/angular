/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadFakeCore, loadTestFiles} from '../../../test/helpers';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {UndecoratedParentMigration} from '../../src/migrations/undecorated_parent_migration';
import {MockLogger} from '../helpers/mock_logger';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('UndecoratedParentMigration', () => {
    let _: typeof absoluteFrom;
    let INDEX_FILENAME: AbsoluteFsPath;
    beforeEach(() => {
      _ = absoluteFrom;
      INDEX_FILENAME = _('/node_modules//test-package/index.js');
    });

    it('should ignore undecorated classes', () => {
      const {program, analysis} = setUpAndAnalyzeProgram([{
        name: INDEX_FILENAME,
        contents: `
        export class DerivedClass extends BaseClass {}
        export class BaseClass {}
      `
      }]);
      const file = analysis.get(program.getSourceFile(INDEX_FILENAME) !);
      expect(file).toBeUndefined();
    });

    it('should ignore an undecorated base class if the derived class has a constructor', () => {
      const {program, analysis} = setUpAndAnalyzeProgram([{
        name: INDEX_FILENAME,
        contents: `
        import {Directive, ViewContainerRef} from '@angular/core';
        export class DerivedClass extends BaseClass {
          constructor(private vcr: ViewContainerRef) {}
        }
        DerivedClass.decorators = [
          { type: Directive, args: [{ selector: '[dir]' }] }
        ];
        DerivedClass.ctorParameters = () => [
          { type: ViewContainerRef, }
        ];
        export class BaseClass {}
      `
      }]);
      const file = analysis.get(program.getSourceFile(INDEX_FILENAME) !) !;
      expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
      expect(file.compiledClasses.find(c => c.name === 'BaseClass')).toBeUndefined();
    });

    it('should add a decorator to an undecorated base class if the derived class is a Directive with no constructor',
       () => {
         const {program, analysis} = setUpAndAnalyzeProgram([{
           name: INDEX_FILENAME,
           contents: `
        import {Directive, ViewContainerRef} from '@angular/core';
        export class DerivedClass extends BaseClass {
        }
        DerivedClass.decorators = [
          { type: Directive, args: [{ selector: '[dir]' }] }
        ];
        export class BaseClass {
          constructor(private vcr: ViewContainerRef) {}
        }
        BaseClass.ctorParameters = () => [
          { type: ViewContainerRef, }
        ];
      `
         }]);
         const file = analysis.get(program.getSourceFile(INDEX_FILENAME) !) !;
         expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
         const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass') !;
         expect(baseClass.decorators !.length).toEqual(1);
         const decorator = baseClass.decorators ![0];
         expect(decorator.name).toEqual('Directive');
         expect(decorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(decorator.args !.length).toEqual(1);
       });

    it('should handle the base class being in a different file (same package) as the derived class',
       () => {
         const BASE_FILENAME = _('/node_modules/test-package/base.js');
         const {program, analysis} = setUpAndAnalyzeProgram([
           {
             name: INDEX_FILENAME,
             contents: `
       import {Directive, ViewContainerRef} from '@angular/core';
       import {BaseClass} from './base';
       export class DerivedClass extends BaseClass {
       }
       DerivedClass.decorators = [
         { type: Directive, args: [{ selector: '[dir]' }] }
       ];
     `
           },
           {
             name: BASE_FILENAME,
             contents: `
          export class BaseClass {
            constructor(private vcr: ViewContainerRef) {}
          }
          BaseClass.ctorParameters = () => [
            { type: ViewContainerRef, }
          ];
      `
           }
         ]);
         const file = analysis.get(program.getSourceFile(BASE_FILENAME) !) !;
         const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass') !;
         expect(baseClass.decorators !.length).toEqual(1);
         const decorator = baseClass.decorators ![0];
         expect(decorator.name).toEqual('Directive');
         expect(decorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(decorator.args !.length).toEqual(1);
       });

    it('should error if the base class being is a different package from the derived class', () => {
      const BASE_FILENAME = _('/node_modules/other-package/index.js');
      const {errors} = setUpAndAnalyzeProgram([
        {
          name: INDEX_FILENAME,
          contents: `
       import {Directive, ViewContainerRef} from '@angular/core';
       import {BaseClass} from 'other-package';
       export class DerivedClass extends BaseClass {
       }
       DerivedClass.decorators = [
         { type: Directive, args: [{ selector: '[dir]' }] }
       ];
     `
        },
        {
          name: BASE_FILENAME,
          contents: `
          export class BaseClass {
            constructor(private vcr: ViewContainerRef) {}
          }
          BaseClass.ctorParameters = () => [
            { type: ViewContainerRef, }
          ];
      `
        }
      ]);
      expect(errors.length).toEqual(1);
    });
  });

  function setUpAndAnalyzeProgram(testFiles: TestFile[]) {
    loadTestFiles(testFiles);
    loadFakeCore(getFileSystem());
    const errors: ts.Diagnostic[] = [];
    const rootFiles = getRootFiles(testFiles);
    const bundle = makeTestEntryPointBundle('test-package', 'es2015', 'esm2015', false, rootFiles);
    const program = bundle.src.program;

    const reflectionHost =
        new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
    const referencesRegistry = new NgccReferencesRegistry(reflectionHost);
    const analyzer = new DecorationAnalyzer(
        getFileSystem(), bundle, reflectionHost, referencesRegistry, error => errors.push(error));
    analyzer.migrations = [new UndecoratedParentMigration()];
    return {program, analysis: analyzer.analyzeProgram(), errors};
  }
});
