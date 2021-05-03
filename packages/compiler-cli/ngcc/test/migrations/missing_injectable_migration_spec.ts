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
import {DecorationAnalyses} from '../../src/analysis/types';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getAngularCoreDecoratorName, MissingInjectableMigration} from '../../src/migrations/missing_injectable_migration';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('MissingInjectableMigration', () => {
    let _: typeof absoluteFrom;
    let INDEX_FILENAME: AbsoluteFsPath;
    beforeEach(() => {
      _ = absoluteFrom;
      INDEX_FILENAME = _('/node_modules/test-package/index.js');
    });

    describe('NgModule', () => runTests('NgModule', 'providers'));
    describe('Directive', () => runTests('Directive', 'providers'));

    describe('Component', () => {
      runTests('Component', 'providers');
      runTests('Component', 'viewProviders');

      it('should migrate all providers defined in "viewProviders" and "providers" in the same ' +
             'component',
         () => {
           const {program, analysis} = setUpAndAnalyzeProgram([{
             name: INDEX_FILENAME,
             contents: `
            import {Component} from '@angular/core';

            export class ServiceA {}
            export class ServiceB {}
            export class ServiceC {}

            export class TestClass {}
            TestClass.decorators = [
              { type: Component, args: [{
                  template: "",
                  providers: [ServiceA],
                  viewProviders: [ServiceB],
                }]
              }
            ];
          `,
           }]);

           const index = program.getSourceFile(INDEX_FILENAME)!;
           expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(true);
           expect(hasInjectableDecorator(index, analysis, 'ServiceB')).toBe(true);
           expect(hasInjectableDecorator(index, analysis, 'ServiceC')).toBe(false);
         });
    });

    function runTests(
        type: 'NgModule'|'Directive'|'Component', propName: 'providers'|'viewProviders') {
      const args = type === 'Component' ? 'template: "", ' : '';

      it(`should migrate type provider in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}
            export class OtherService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'OtherService')).toBe(false);
      });

      it(`should migrate object literal provider in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}
            export class OtherService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [{provide: MyService}]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'OtherService')).toBe(false);
      });

      it(`should migrate object literal provider with forwardRef in ${type}`, async () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}, forwardRef} from '@angular/core';

            export class MyService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${
              propName}: [{provide: forwardRef(() => MyService) }]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
      });

      it(`should not migrate object literal provider with "useValue" in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${
              propName}: [{provide: MyService, useValue: null }]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it(`should not migrate object literal provider with "useFactory" in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${
              propName}: [{provide: MyService, useFactory: () => null }]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it(`should not migrate object literal provider with "useExisting" in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}
            export class MyToken {}
            export class MyTokenAlias {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [
                MyService,
                {provide: MyToken, useExisting: MyService},
                {provide: MyTokenAlias, useExisting: MyToken},
              ]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'MyToken')).toBe(false);
        expect(hasInjectableDecorator(index, analysis, 'MyTokenAlias')).toBe(false);
      });

      it(`should migrate object literal provider with "useClass" in ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class MyService {}
            export class MyToken {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${
              propName}: [{provide: MyToken, useClass: MyService}]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'MyToken')).toBe(false);
      });

      it('should not migrate provider which is already decorated with @Injectable', () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {Injectable, ${type}} from '@angular/core';

            export class MyService {}
            MyService.decorators = [
              { type: Injectable }
            ];

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(getInjectableDecorators(index, analysis, 'MyService').length).toBe(1);
      });

      it('should not migrate provider which is already decorated with @Directive', () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {Directive, ${type}} from '@angular/core';

            export class MyService {}
            MyService.decorators = [
              { type: Directive }
            ];

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it('should not migrate provider which is already decorated with @Component', () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {Component, ${type}} from '@angular/core';

            export class MyService {}
            MyService.decorators = [
              { type: Component, args: [{template: ""}] }
            ];

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it('should not migrate provider which is already decorated with @Pipe', () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {Pipe, ${type}} from '@angular/core';

            export class MyService {}
            MyService.decorators = [
              { type: Pipe, args: [{name: "pipe"}] }
            ];

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it(`should migrate multiple providers in same ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class ServiceA {}
            export class ServiceB {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [ServiceA, ServiceB]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceB')).toBe(true);
      });

      it(`should migrate multiple mixed providers in same ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class ServiceA {}
            export class ServiceB {}
            export class ServiceC {}
            export class ServiceD {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [
                  ServiceA,
                  {provide: ServiceB},
                  {provide: SomeToken, useClass: ServiceC},
                ]
              }] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceB')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceC')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceD')).toBe(false);
      });


      it(`should migrate multiple nested providers in same ${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
          import {${type}} from '@angular/core';

          export class ServiceA {}
          export class ServiceB {}
          export class ServiceC {}
          export class ServiceD {}

          export class TestClass {}
          TestClass.decorators = [
            { type: ${type}, args: [{${args}${propName}: [
                ServiceA,
                [
                  {provide: ServiceB},
                  ServiceC,
                ],
              ]}]
            }
          ];
         `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceB')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceC')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceD')).toBe(false);
      });

      it('should migrate providers referenced indirectly', () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class ServiceA {}
            export class ServiceB {}
            export class ServiceC {}

            const PROVIDERS = [ServiceA, ServiceB];

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: PROVIDERS}] }
            ];
          `
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceB')).toBe(true);
        expect(hasInjectableDecorator(index, analysis, 'ServiceC')).toBe(false);
      });

      it(`should migrate provider once if referenced in multiple ${type} definitions`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class ServiceA {}
            export class ServiceB {}

            export class TestClassA {}
            TestClassA.decorators = [
              { type: ${type}, args: [{${args}${propName}: [ServiceA]}] }
            ];

            export class TestClassB {}
            TestClassB.decorators = [
              { type: ${type}, args: [{${args}${propName}: [ServiceA, ServiceB]}] }
            ];
          `
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(getInjectableDecorators(index, analysis, 'ServiceA').length).toBe(1);
        expect(getInjectableDecorators(index, analysis, 'ServiceB').length).toBe(1);
      });

      type !== 'Component' && it(`should support @${type} without metadata argument`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from '@angular/core';

            export class ServiceA {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'ServiceA')).toBe(false);
      });

      it(`should migrate services in a different file`, () => {
        const SERVICE_FILENAME = _('/node_modules/test-package/service.js');
        const {program, analysis} = setUpAndAnalyzeProgram([
          {
            name: INDEX_FILENAME,
            contents: `
            import {${type}} from '@angular/core';
            import {MyService} from './service';

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
          },
          {
            name: SERVICE_FILENAME,
            contents: `
            export declare class MyService {}
          `,
          }
        ]);

        const index = program.getSourceFile(SERVICE_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
      });

      it(`should not migrate services in a different package`, () => {
        const SERVICE_FILENAME = _('/node_modules/external/index.d.ts');
        const {program, analysis} = setUpAndAnalyzeProgram([
          {
            name: INDEX_FILENAME,
            contents: `
            import {${type}} from '@angular/core';
            import {MyService} from 'external';

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
          },
          {
            name: SERVICE_FILENAME,
            contents: `
            export declare class MyService {}
          `,
          }
        ]);

        const index = program.getSourceFile(SERVICE_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });

      it(`should deal with renamed imports for @${type}`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type} as Renamed} from '@angular/core';

            export class MyService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: Renamed, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(true);
      });

      it(`should deal with decorators named @${type} not from '@angular/core'`, () => {
        const {program, analysis} = setUpAndAnalyzeProgram([{
          name: INDEX_FILENAME,
          contents: `
            import {${type}} from 'other';

            export class MyService {}

            export class TestClass {}
            TestClass.decorators = [
              { type: ${type}, args: [{${args}${propName}: [MyService]}] }
            ];
          `,
        }]);

        const index = program.getSourceFile(INDEX_FILENAME)!;
        expect(hasInjectableDecorator(index, analysis, 'MyService')).toBe(false);
      });
    }

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
      analyzer.migrations = [new MissingInjectableMigration()];
      return {program, analysis: analyzer.analyzeProgram(), errors};
    }

    function getInjectableDecorators(
        sourceFile: ts.SourceFile, analysis: DecorationAnalyses, className: string) {
      const file = analysis.get(sourceFile);
      if (file === undefined) {
        return [];
      }

      const clazz = file.compiledClasses.find(c => c.name === className);
      if (clazz === undefined || clazz.decorators === null) {
        return [];
      }

      return clazz.decorators.filter(
          decorator => getAngularCoreDecoratorName(decorator) === 'Injectable');
    }

    function hasInjectableDecorator(
        sourceFile: ts.SourceFile, analysis: DecorationAnalyses, className: string) {
      return getInjectableDecorators(sourceFile, analysis, className).length > 0;
    }
  });
});
