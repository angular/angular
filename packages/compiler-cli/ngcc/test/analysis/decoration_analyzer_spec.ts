/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, DetectResult} from '../../../src/ngtsc/transform';
import {loadFakeCore, loadTestFiles} from '../../../test/helpers';
import {CompiledClass, DecorationAnalyses, DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
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

      function setUpAndAnalyzeProgram(testFiles: TestFile[]) {
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
        const analyzer =
            new DecorationAnalyzer(getFileSystem(), bundle, reflectionHost, referencesRegistry);
        testHandler = createTestHandler();
        analyzer.handlers = [testHandler];
        result = analyzer.analyzeProgram();
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
          setUpAndAnalyzeProgram(TEST_PROGRAM);
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
          setUpAndAnalyzeProgram(INTERNAL_COMPONENT_PROGRAM);
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

          setUpAndAnalyzeProgram(EXTERNAL_COMPONENT_PROGRAM);
        });

        it('should ignore classes from an externally imported file', () => {
          const file = program.getSourceFile(_('/node_modules/other/component.js')) !;
          expect(result.has(file)).toBe(false);
        });
      });
    });
  });
});