/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadFakeCore, loadTestFiles} from '../../../src/ngtsc/testing';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {UndecoratedParentMigration} from '../../src/migrations/undecorated_parent_migration';
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
      const {program, analysis, errors} = setUpAndAnalyzeProgram([{
        name: INDEX_FILENAME,
        contents: `
        export class DerivedClass extends BaseClass {}
        export class BaseClass {}
      `
      }]);
      expect(errors).toEqual([]);
      const file = analysis.get(program.getSourceFile(INDEX_FILENAME)!);
      expect(file).toBeUndefined();
    });

    it('should ignore an undecorated base class if the derived class has a constructor', () => {
      const {program, analysis, errors} = setUpAndAnalyzeProgram([{
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
      expect(errors).toEqual([]);
      const file = analysis.get(program.getSourceFile(INDEX_FILENAME)!)!;
      expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
      expect(file.compiledClasses.find(c => c.name === 'BaseClass')).toBeUndefined();
    });

    it('should add a decorator to an undecorated base class if the derived class is a Directive with no constructor',
       () => {
         const {program, analysis, errors} = setUpAndAnalyzeProgram([{
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
         expect(errors).toEqual([]);
         const file = analysis.get(program.getSourceFile(INDEX_FILENAME)!)!;
         expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
         const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass')!;
         expect(baseClass.decorators!.length).toEqual(1);
         const decorator = baseClass.decorators![0];
         expect(decorator.name).toEqual('Directive');
         expect(decorator.identifier).toBeNull('The decorator must be synthesized');
         expect(decorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(decorator.args!.length).toEqual(0);
       });

    it('should not add a decorator to a base class that is already decorated', () => {
      const {program, analysis, errors} = setUpAndAnalyzeProgram([{
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
        BaseClass.decorators = [
          { type: Directive, args: [] }
        ];
        BaseClass.ctorParameters = () => [
          { type: ViewContainerRef, }
        ];
      `
      }]);
      expect(errors).toEqual([]);
      const file = analysis.get(program.getSourceFile(INDEX_FILENAME)!)!;
      expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
      const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass')!;
      expect(baseClass.decorators!.length).toEqual(1);
      const decorator = baseClass.decorators![0];
      expect(decorator.name).toEqual('Directive');
      expect(decorator.identifier).not.toBeNull('The decorator must not be synthesized');
    });

    it('should add decorators to all classes in an inheritance chain until a constructor is found',
       () => {
         const {program, analysis, errors} = setUpAndAnalyzeProgram([{
           name: INDEX_FILENAME,
           contents: `
        import {Directive, ViewContainerRef} from '@angular/core';
        export class DerivedClass extends IntermediateClass {
        }
        DerivedClass.decorators = [
          { type: Directive, args: [{ selector: '[dir]' }] }
        ];
        export class IntermediateClass extends BaseClass {}
        export class BaseClass extends RealBaseClass {
          constructor(private vcr: ViewContainerRef) {}
        }
        BaseClass.ctorParameters = () => [
          { type: ViewContainerRef, }
        ];
        export class RealBaseClass {}
      `
         }]);
         expect(errors).toEqual([]);
         const file = analysis.get(program.getSourceFile(INDEX_FILENAME)!)!;
         expect(file.compiledClasses.find(c => c.name === 'DerivedClass')).toBeDefined();
         expect(file.compiledClasses.find(c => c.name === 'RealBaseClass')).toBeUndefined();

         const intermediateClass = file.compiledClasses.find(c => c.name === 'IntermediateClass')!;
         expect(intermediateClass.decorators!.length).toEqual(1);
         const intermediateDecorator = intermediateClass.decorators![0];
         expect(intermediateDecorator.name).toEqual('Directive');
         expect(intermediateDecorator.identifier).toBeNull('The decorator must be synthesized');
         expect(intermediateDecorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(intermediateDecorator.args!.length).toEqual(0);

         const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass')!;
         expect(baseClass.decorators!.length).toEqual(1);
         const baseDecorator = baseClass.decorators![0];
         expect(baseDecorator.name).toEqual('Directive');
         expect(baseDecorator.identifier).toBeNull('The decorator must be synthesized');
         expect(baseDecorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(baseDecorator.args!.length).toEqual(0);
       });

    it('should handle the base class being in a different file (same package) as the derived class',
       () => {
         const BASE_FILENAME = _('/node_modules/test-package/base.js');
         const {program, analysis, errors} = setUpAndAnalyzeProgram([
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
         expect(errors).toEqual([]);
         const file = analysis.get(program.getSourceFile(BASE_FILENAME)!)!;
         const baseClass = file.compiledClasses.find(c => c.name === 'BaseClass')!;
         expect(baseClass.decorators!.length).toEqual(1);
         const decorator = baseClass.decorators![0];
         expect(decorator.name).toEqual('Directive');
         expect(decorator.identifier).toBeNull('The decorator must be synthesized');
         expect(decorator.import).toEqual({from: '@angular/core', name: 'Directive'});
         expect(decorator.args!.length).toEqual(0);
       });

    it('should skip the base class if it is in a different package from the derived class', () => {
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

      expect(errors.length).toBe(1);
      expect(errors[0].messageText)
          .toBe(
              `The directive DerivedClass inherits its constructor ` +
              `from BaseClass, but the latter does not have an Angular ` +
              `decorator of its own. Dependency injection will not be ` +
              `able to resolve the parameters of BaseClass's ` +
              `constructor. Either add a @Directive decorator to ` +
              `BaseClass, or add an explicit constructor to DerivedClass.`);
    });
  });

  function setUpAndAnalyzeProgram(testFiles: TestFile[]) {
    loadTestFiles(testFiles);
    loadFakeCore(getFileSystem());
    const errors: ts.Diagnostic[] = [];
    const rootFiles = getRootFiles(testFiles);
    const bundle = makeTestEntryPointBundle('test-package', 'esm2015', false, rootFiles);
    const program = bundle.src.program;

    const reflectionHost = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src);
    const referencesRegistry = new NgccReferencesRegistry(reflectionHost);
    const analyzer = new DecorationAnalyzer(
        getFileSystem(), bundle, reflectionHost, referencesRegistry, error => errors.push(error));
    analyzer.migrations = [new UndecoratedParentMigration()];
    return {program, analysis: analyzer.analyzeProgram(), errors};
  }
});
