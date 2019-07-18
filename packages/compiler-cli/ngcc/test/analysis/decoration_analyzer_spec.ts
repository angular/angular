/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {FatalDiagnosticError, makeDiagnostic} from '../../../src/ngtsc/diagnostics';
import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, DetectResult} from '../../../src/ngtsc/transform';
import {loadFakeCore, loadTestFiles} from '../../../test/helpers';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {CompiledClass, DecorationAnalyses} from '../../src/analysis/types';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {Migration, MigrationHost} from '../../src/migrations/migration';
import {MockLogger} from '../helpers/mock_logger';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

type DecoratorHandlerWithResolve = DecoratorHandler<any, any>& {
  resolve: NonNullable<DecoratorHandler<any, any>['resolve']>;
};

runInEachFileSystem(() => {
  describe('DecorationAnalyzer', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => { _ = absoluteFrom; });

    describe('analyzeProgram()', () => {
      let logs: string[];
      let migrationLogs: string[];
      let diagnosticLogs: ts.Diagnostic[];
      let program: ts.Program;
      let testHandler: jasmine.SpyObj<DecoratorHandlerWithResolve>;
      let result: DecorationAnalyses;

      // Helpers
      const createTestHandler = () => {
        const handler = jasmine.createSpyObj<DecoratorHandlerWithResolve>('TestDecoratorHandler', [
          'detect',
          'analyze',
          'resolve',
          'compile',
        ]);
        // Only detect the Component and Directive decorators
        handler.detect.and.callFake(
            (node: ts.Declaration, decorators: Decorator[] | null): DetectResult<any>|
                undefined => {
              const className = (node as any).name.text;
              if (decorators === null) {
                logs.push(`detect: ${className} (no decorators)`);
              } else {
                logs.push(`detect: ${className}@${decorators.map(d => d.name)}`);
              }
              if (!decorators) {
                return undefined;
              }
              const metadata =
                  decorators.find(d => d.name === 'Component' || d.name === 'Directive');
              if (metadata === undefined) {
                return undefined;
              } else {
                return {
                  metadata,
                  trigger: metadata.node,
                };
              }
            });
        // The "test" analysis is an object with the name of the decorator being analyzed
        handler.analyze.and.callFake((decl: ts.Declaration, dec: Decorator) => {
          logs.push(`analyze: ${(decl as any).name.text}@${dec.name}`);
          return {analysis: {decoratorName: dec.name}, diagnostics: undefined};
        });
        // The "test" resolution is just setting `resolved: true` on the analysis
        handler.resolve.and.callFake((decl: ts.Declaration, analysis: any) => {
          logs.push(`resolve: ${(decl as any).name.text}@${analysis.decoratorName}`);
          analysis.resolved = true;
        });
        // The "test" compilation result is just the name of the decorator being compiled
        // (suffixed with `(compiled)`)
        handler.compile.and.callFake((decl: ts.Declaration, analysis: any) => {
          logs.push(
              `compile: ${(decl as any).name.text}@${analysis.decoratorName} (resolved: ${analysis.resolved})`);
          return `@${analysis.decoratorName} (compiled)`;
        });
        return handler;
      };

      function setUpAnalyzer(testFiles: TestFile[]) {
        logs = [];
        loadTestFiles(testFiles);
        loadFakeCore(getFileSystem());
        const rootFiles = getRootFiles(testFiles);
        const bundle =
            makeTestEntryPointBundle('test-package', 'es2015', 'esm2015', false, rootFiles);
        program = bundle.src.program;

        const reflectionHost =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const referencesRegistry = new NgccReferencesRegistry(reflectionHost);
        diagnosticLogs = [];
        const analyzer = new DecorationAnalyzer(
            getFileSystem(), bundle, reflectionHost, referencesRegistry,
            (error) => diagnosticLogs.push(error));
        testHandler = createTestHandler();
        analyzer.handlers = [testHandler];
        migrationLogs = [];
        const migration1 = new MockMigration('migration1', migrationLogs);
        const migration2 = new MockMigration('migration2', migrationLogs);
        analyzer.migrations = [migration1, migration2];
        return analyzer;
      }

      describe('basic usage', () => {
        beforeEach(() => {
          const TEST_PROGRAM = [
            {
              name: _('/node_modules/test-package/index.js'),
              contents: `
                import * as test from './test';
                import * as other from './other';
                `,
            },
            {
              name: _('/node_modules/test-package/test.js'),
              contents: `
                  import {Component, Directive, Injectable} from '@angular/core';

                  export class NoDecorators {}

                  export class MyComponent {}
                  MyComponent.decorators = [{type: Component}];

                  export class MyDirective {}
                  MyDirective.decorators = [{type: Directive}];

                  export class MyService {}
                  MyService.decorators = [{type: Injectable}];

                `,
            },
            {
              name: _('/node_modules/test-package/other.js'),
              contents: `
                  import {Component} from '@angular/core';

                  export class MyOtherComponent {}
                  MyOtherComponent.decorators = [{type: Component}];
                `,
            },
          ];
          const analyzer = setUpAnalyzer(TEST_PROGRAM);
          result = analyzer.analyzeProgram();
        });

        it('should return an object containing a reference to the original source file', () => {
          const testFile = getSourceFileOrError(program, _('/node_modules/test-package/test.js'));
          expect(result.get(testFile) !.sourceFile).toBe(testFile);
          const otherFile = getSourceFileOrError(program, _('/node_modules/test-package/other.js'));
          expect(result.get(otherFile) !.sourceFile).toBe(otherFile);
        });

        it('should call detect on the decorator handlers with each class from the parsed file',
           () => {
             expect(testHandler.detect).toHaveBeenCalledTimes(5);
             expect(testHandler.detect.calls.allArgs().map(args => args[1])).toEqual([
               null,
               jasmine.arrayContaining([jasmine.objectContaining({name: 'Component'})]),
               jasmine.arrayContaining([jasmine.objectContaining({name: 'Directive'})]),
               jasmine.arrayContaining([jasmine.objectContaining({name: 'Injectable'})]),
               jasmine.arrayContaining([jasmine.objectContaining({name: 'Component'})]),
             ]);
           });

        it('should return an object containing the classes that were analyzed', () => {
          const file1 = getSourceFileOrError(program, _('/node_modules/test-package/test.js'));
          const compiledFile1 = result.get(file1) !;
          expect(compiledFile1.compiledClasses.length).toEqual(2);
          expect(compiledFile1.compiledClasses[0]).toEqual(jasmine.objectContaining({
            name: 'MyComponent', compilation: ['@Component (compiled)'],
          } as unknown as CompiledClass));
          expect(compiledFile1.compiledClasses[1]).toEqual(jasmine.objectContaining({
            name: 'MyDirective', compilation: ['@Directive (compiled)'],
          } as unknown as CompiledClass));

          const file2 = getSourceFileOrError(program, _('/node_modules/test-package/other.js'));
          const compiledFile2 = result.get(file2) !;
          expect(compiledFile2.compiledClasses.length).toEqual(1);
          expect(compiledFile2.compiledClasses[0]).toEqual(jasmine.objectContaining({
            name: 'MyOtherComponent', compilation: ['@Component (compiled)'],
          } as unknown as CompiledClass));
        });

        it('should call `apply()` on each migration for each class', () => {
          expect(migrationLogs).toEqual([
            'migration1:MyComponent',
            'migration2:MyComponent',
            'migration1:MyDirective',
            'migration2:MyDirective',
            'migration1:MyOtherComponent',
            'migration2:MyOtherComponent',
          ]);
        });


        it('should analyze, resolve and compile the classes that are detected', () => {
          expect(logs).toEqual([
            // Classes without decorators should also be detected.
            'detect: NoDecorators (no decorators)',
            // First detect and (potentially) analyze.
            'detect: MyComponent@Component',
            'analyze: MyComponent@Component',
            'detect: MyDirective@Directive',
            'analyze: MyDirective@Directive',
            'detect: MyService@Injectable',
            'detect: MyOtherComponent@Component',
            'analyze: MyOtherComponent@Component',
            // The resolve.
            'resolve: MyComponent@Component',
            'resolve: MyDirective@Directive',
            'resolve: MyOtherComponent@Component',
            // Finally compile.
            'compile: MyComponent@Component (resolved: true)',
            'compile: MyDirective@Directive (resolved: true)',
            'compile: MyOtherComponent@Component (resolved: true)',
          ]);
        });
      });

      describe('internal components', () => {
        beforeEach(() => {
          const INTERNAL_COMPONENT_PROGRAM = [
            {
              name: _('/node_modules/test-package/entrypoint.js'),
              contents: `
            import {Component, NgModule} from '@angular/core';
            import {ImportedComponent} from './component';

            export class LocalComponent {}
            LocalComponent.decorators = [{type: Component}];

            export class MyModule {}
            MyModule.decorators = [{type: NgModule, args: [{
                        declarations: [ImportedComponent, LocalComponent],
                        exports: [ImportedComponent, LocalComponent],
                    },] }];
          `
            },
            {
              name: _('/node_modules/test-package/component.js'),
              contents: `
            import {Component} from '@angular/core';
            export class ImportedComponent {}
            ImportedComponent.decorators = [{type: Component}];
          `,
              isRoot: false,
            }
          ];
          const analyzer = setUpAnalyzer(INTERNAL_COMPONENT_PROGRAM);
          result = analyzer.analyzeProgram();
        });

        // The problem of exposing the type of these internal components in the .d.ts typing
        // files is not yet solved.
        it('should analyze an internally imported component, which is not publicly exported from the entry-point',
           () => {
             const file =
                 getSourceFileOrError(program, _('/node_modules/test-package/component.js'));
             const analysis = result.get(file) !;
             expect(analysis).toBeDefined();
             const ImportedComponent =
                 analysis.compiledClasses.find(f => f.name === 'ImportedComponent') !;
             expect(ImportedComponent).toBeDefined();
           });

        it('should analyze an internally defined component, which is not exported at all', () => {
          const file = getSourceFileOrError(program, _('/node_modules/test-package/entrypoint.js'));
          const analysis = result.get(file) !;
          expect(analysis).toBeDefined();
          const LocalComponent = analysis.compiledClasses.find(f => f.name === 'LocalComponent') !;
          expect(LocalComponent).toBeDefined();
        });
      });

      describe('external components', () => {
        beforeEach(() => {
          const EXTERNAL_COMPONENT_PROGRAM: TestFile[] = [
            {
              name: _('/node_modules/test-package/entrypoint.js'),
              contents: `
        import {Component, NgModule} from '@angular/core';
        import {ImportedComponent} from 'other/component';

        export class LocalComponent {}
        LocalComponent.decorators = [{type: Component}];

        export class MyModule {}
        MyModule.decorators = [{type: NgModule, args: [{
                    declarations: [ImportedComponent, LocalComponent],
                    exports: [ImportedComponent, LocalComponent],
                },] }];
      `
            },
            {
              name: _('/node_modules/other/component.js'),
              contents: `
        import {Component} from '@angular/core';
        export class ImportedComponent {}
        ImportedComponent.decorators = [{type: Component}];
      `,
              isRoot: false,
            },
            {
              name: _('/node_modules/other/component.d.ts'),
              contents: `
        import {Component} from '@angular/core';
        export class ImportedComponent {}`
            },
          ];

          const analyzer = setUpAnalyzer(EXTERNAL_COMPONENT_PROGRAM);
          result = analyzer.analyzeProgram();
        });

        it('should ignore classes from an externally imported file', () => {
          const file = program.getSourceFile(_('/node_modules/other/component.js')) !;
          expect(result.has(file)).toBe(false);
        });
      });

      describe('diagnostic handling', () => {
        it('should report migration diagnostics to the `diagnosticHandler` callback', () => {
          const analyzer = setUpAnalyzer([
            {
              name: _('/node_modules/test-package/index.js'),
              contents: `
                  import {Component, Directive, Injectable} from '@angular/core';
                  export class MyComponent {}
                  MyComponent.decorators = [{type: Component}];
                `,
            },
          ]);
          analyzer.migrations = [
            {
              apply(clazz: ClassDeclaration) {
                return makeDiagnostic(9999, clazz, 'normal diagnostic');
              }
            },
            {
              apply(clazz: ClassDeclaration) {
                throw new FatalDiagnosticError(6666, clazz, 'fatal diagnostic');
              }
            }
          ];
          analyzer.analyzeProgram();
          expect(diagnosticLogs.length).toEqual(2);
          expect(diagnosticLogs[0]).toEqual(jasmine.objectContaining({code: -999999}));
          expect(diagnosticLogs[1]).toEqual(jasmine.objectContaining({code: -996666}));
        });
      });
    });
  });
});

class MockMigration implements Migration {
  constructor(private name: string, private log: string[]) {}
  apply(clazz: ClassDeclaration, host: MigrationHost): ts.Diagnostic|null {
    this.log.push(`${this.name}:${clazz.name.text}`);
    return null;
  }
}