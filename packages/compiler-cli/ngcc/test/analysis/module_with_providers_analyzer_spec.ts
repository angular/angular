/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {DeclarationNode} from '../../../src/ngtsc/reflection';
import {getDeclaration, isNamedDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {ModuleWithProvidersAnalyses, ModuleWithProvidersAnalyzer} from '../../src/analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {BundleProgram} from '../../src/packages/bundle_program';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('ModuleWithProvidersAnalyzer', () => {
    describe('analyzeProgram()', () => {
      let _: typeof absoluteFrom;
      let analyses: ModuleWithProvidersAnalyses;
      let program: ts.Program;
      let dtsProgram: BundleProgram;
      let referencesRegistry: NgccReferencesRegistry;

      beforeEach(() => {
        _ = absoluteFrom;

        const TEST_PROGRAM: TestFile[] = [
          {
            name: _('/node_modules/test-package/src/entry-point.js'),
            contents: `
            export * from './explicit';
            export * from './any';
            export * from './implicit';
            export * from './no-providers';
            export * from './module';
            export * from './delegated';
            export * from './iife-wrapped';
          `
          },
          {
            name: _('/node_modules/test-package/src/explicit.js'),
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export class ExplicitInternalModule {}
            export function explicitInternalFunction() {
              return {
                ngModule: ExplicitInternalModule,
                providers: []
              };
            }
            export function explicitExternalFunction() {
              return {
                ngModule: ExternalModule,
                providers: []
              };
            }
            export function explicitLibraryFunction() {
              return {
                ngModule: LibraryModule,
                providers: []
              };
            }
            export class ExplicitClass {
              static explicitInternalMethod() {
                return {
                  ngModule: ExplicitInternalModule,
                  providers: []
                };
              }
              static explicitExternalMethod() {
                return {
                  ngModule: ExternalModule,
                  providers: []
                };
              }
              static explicitLibraryMethod() {
                return {
                  ngModule: LibraryModule,
                  providers: []
                };
              }
            }
            `
          },
          {
            name: _('/node_modules/test-package/src/any.js'),
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export class AnyInternalModule {}
            export function anyInternalFunction() {
              return {
                ngModule: AnyInternalModule,
                providers: []
              };
            }
            export function anyExternalFunction() {
              return {
                ngModule: ExternalModule,
                providers: []
              };
            }
            export function anyLibraryFunction() {
              return {
                ngModule: LibraryModule,
                providers: []
              };
            }
            export class AnyClass {
              static anyInternalMethod() {
                return {
                  ngModule: AnyInternalModule,
                  providers: []
                };
              }
              static anyExternalMethod() {
                return {
                  ngModule: ExternalModule,
                  providers: []
                };
              }
              static anyLibraryMethod() {
                return {
                  ngModule: LibraryModule,
                  providers: []
                };
              }
            }
            `
          },
          {
            name: _('/node_modules/test-package/src/implicit.js'),
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export class ImplicitInternalModule {}
            export function implicitInternalFunction() {
              return {
                ngModule: ImplicitInternalModule,
                providers: [],
              };
            }
            export function implicitExternalFunction() {
              return {
                ngModule: ExternalModule,
                providers: [],
              };
            }
            export function implicitLibraryFunction() {
              return {
                ngModule: LibraryModule,
                providers: [],
              };
            }
            export class ImplicitClass {
              static implicitInternalMethod() {
                return {
                  ngModule: ImplicitInternalModule,
                  providers: [],
                };
              }
              static implicitExternalMethod() {
                return {
                  ngModule: ExternalModule,
                  providers: [],
                };
              }
              static implicitLibraryMethod() {
                return {
                  ngModule: LibraryModule,
                  providers: [],
                };
              }
            }
            `
          },
          {
            name: _('/node_modules/test-package/src/no-providers.js'),
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export class NoProvidersInternalModule {}
            export function noProvExplicitInternalFunction() {
              return {ngModule: NoProvidersInternalModule};
            }
            export function noProvExplicitExternalFunction() {
              return {ngModule: ExternalModule};
            }
            export function noProvExplicitLibraryFunction() {
              return {ngModule: LibraryModule};
            }
            export function noProvAnyInternalFunction() {
              return {ngModule: NoProvidersInternalModule};
            }
            export function noProvAnyExternalFunction() {
              return {ngModule: ExternalModule};
            }
            export function noProvAnyLibraryFunction() {
              return {ngModule: LibraryModule};
            }
            export function noProvImplicitInternalFunction() {
              return {ngModule: NoProvidersInternalModule};
            }
            export function noProvImplicitExternalFunction() {
              return {ngModule: ExternalModule};
            }
            export function noProvImplicitLibraryFunction() {
              return {ngModule: LibraryModule};
            }
            `
          },
          {
            name: _('/node_modules/test-package/src/delegated.js'),
            contents: `
            import * as implicit from './implicit';
            import * as explicit from './explicit';
            import * as anyModule from './any';

            export function delegatedImplicitInternalFunction() {
              return implicit.implicitInternalFunction();
            }
            export function delegatedImplicitExternalFunction() {
              return implicit.implicitExternalFunction();
            }
            export function delegatedImplicitLibraryFunction() {
              return implicit.implicitLibraryFunction();
            }
            export class DelegatedImplicitClass {
              static implicitInternalMethod() {
                return implicit.ImplicitClass.implicitInternalMethod();
              }
              static implicitExternalMethod() {
                return implicit.ImplicitClass.implicitExternalMethod();
              }
              static implicitLibraryMethod() {
                return implicit.ImplicitClass.implicitLibraryMethod();
              }
            }

            export function delegatedExplicitInternalFunction() {
              return explicit.explicitInternalFunction();
            }
            export function delegatedExplicitExternalFunction() {
              return explicit.explicitExternalFunction();
            }
            export function delegatedExplicitLibraryFunction() {
              return explicit.explicitLibraryFunction();
            }
            export class DelegatedExplicitClass {
              static explicitInternalMethod() {
                return explicit.ExplicitClass.explicitInternalMethod();
              }
              static explicitExternalMethod() {
                return explicit.ExplicitClass.explicitExternalMethod();
              }
              static explicitLibraryMethod() {
                return explicit.ExplicitClass.explicitLibraryMethod();
              }
            }

            export function delegatedAnyInternalFunction() {
              return anyModule.anyInternalFunction();
            }
            export function delegatedAnyExternalFunction() {
              return anyModule.anyExternalFunction();
            }
            export function delegatedAnyLibraryFunction() {
              return anyModule.anyLibraryFunction();
            }
            export class DelegatedAnyClass {
              static anyInternalMethod() {
                return anyModule.AnyClass.anyInternalMethod();
              }
              static anyExternalMethod() {
                return anyModule.AnyClass.anyExternalMethod();
              }
              static anyLibraryMethod() {
                return anyModule.AnyClass.anyLibraryMethod();
              }
            }

            export function withParams(a: string) {
              return explicit.explicitInternalFunction();
            }

            export function withOptionalParams(a: string = 'default') {
              return explicit.explicitInternalFunction();
            }

            export function doubleDelegation(a: string = 'default') {
              return withParams(a);
            }
            `
          },
          {
            name: _('/node_modules/test-package/src/module.js'),
            contents: `
            export class ExternalModule {}
            `
          },
          {
            name: _('/node_modules/some-library/index.d.ts'),
            contents: 'export declare class LibraryModule {}'
          },
          {
            name: _('/node_modules/test-package/src/iife-wrapped.js'),
            contents: `
            import {NgModule} from './core';
            let WrappedClass = (() => {
              var WrappedClass_Alias;
              let AdjacentWrappedClass = WrappedClass_Alias = class InnerWrappedClass {
                static forRoot() {
                  return {
                    ngModule: WrappedClass_Alias,
                    providers: []
                  };
                }
              };
              AdjacentWrappedClass = WrappedClass_Alias = __decorate([], AdjacentWrappedClass);
              return AdjacentWrappedClass;
            })();
            export {WrappedClass};`
          },
        ];
        const TEST_DTS_PROGRAM: TestFile[] = [
          {
            name: _('/node_modules/test-package/typings/entry-point.d.ts'),
            contents: `
            export * from './explicit';
            export * from './any';
            export * from './implicit';
            export * from './no-providers';
            export * from './module';
            export * from './delegated';
            export * from './iife-wrapped';
          `
          },
          {
            name: _('/node_modules/test-package/typings/explicit.d.ts'),
            contents: `
            import {ModuleWithProviders} from './core';
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export declare class ExplicitInternalModule {}
            export declare function explicitInternalFunction(): ModuleWithProviders<ExplicitInternalModule>;
            export declare function explicitExternalFunction(): ModuleWithProviders<ExternalModule>;
            export declare function explicitLibraryFunction(): ModuleWithProviders<LibraryModule>;
            export declare class ExplicitClass {
              static explicitInternalMethod(): ModuleWithProviders<ExplicitInternalModule>;
              static explicitExternalMethod(): ModuleWithProviders<ExternalModule>;
              static explicitLibraryMethod(): ModuleWithProviders<LibraryModule>;
            }
            `
          },
          {
            name: _('/node_modules/test-package/typings/any.d.ts'),
            contents: `
            import {ModuleWithProviders} from './core';
            export declare class AnyInternalModule {}
            export declare function anyInternalFunction(): ModuleWithProviders<any>;
            export declare function anyExternalFunction(): ModuleWithProviders<any>;
            export declare function anyLibraryFunction(): ModuleWithProviders<any>;
            export declare class AnyClass {
              static anyInternalMethod(): ModuleWithProviders<any>;
              static anyExternalMethod(): ModuleWithProviders<any>;
              static anyLibraryMethod(): ModuleWithProviders<any>;
            }
            `
          },
          {
            name: _('/node_modules/test-package/typings/implicit.d.ts'),
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export declare class ImplicitInternalModule {}
            export declare function implicitInternalFunction(): { ngModule: typeof ImplicitInternalModule; providers: never[]; };
            export declare function implicitExternalFunction(): { ngModule: typeof ExternalModule; providers: never[]; };
            export declare function implicitLibraryFunction(): { ngModule: typeof LibraryModule; providers: never[]; };
            export declare class ImplicitClass {
              static implicitInternalMethod(): { ngModule: typeof ImplicitInternalModule; providers: never[]; };
              static implicitExternalMethod(): { ngModule: typeof ExternalModule; providers: never[]; };
              static implicitLibraryMethod(): { ngModule: typeof LibraryModule; providers: never[]; };
            }
            `
          },
          {
            name: _('/node_modules/test-package/typings/delegated.d.ts'),
            contents: `
            // None of the ModuleWithProviders functions/methods in this file provide the
            // necessary type parameters and so need to be processed by the analyzer.
            // Each group of functions/methods here delegate their return values to other
            // functions/methods that either explicitly provide a type parameter or need
            // processing by the analyzer themselves.

            export declare function delegatedImplicitInternalFunction(): ModuleWithProviders;
            export declare function delegatedImplicitExternalFunction(): ModuleWithProviders;
            export declare function delegatedImplicitLibraryFunction(): ModuleWithProviders;
            export declare class DelegatedImplicitClass {
              static implicitInternalMethod(): ModuleWithProviders;
              static implicitExternalMethod(): ModuleWithProviders;
              static implicitLibraryMethod(): ModuleWithProviders;
            }

            export declare function delegatedExplicitInternalFunction(): ModuleWithProviders;
            export declare function delegatedExplicitExternalFunction(): ModuleWithProviders;
            export declare function delegatedExplicitLibraryFunction(): ModuleWithProviders;
            export declare class DelegatedExplicitClass {
              static explicitInternalMethod(): ModuleWithProviders;
              static explicitExternalMethod(): ModuleWithProviders;
              static explicitLibraryMethod(): ModuleWithProviders;
            }

            export declare function delegatedAnyInternalFunction(): ModuleWithProviders;
            export declare function delegatedAnyExternalFunction(): ModuleWithProviders;
            export declare function delegatedAnyLibraryFunction(): ModuleWithProviders;
            export declare class DelegatedAnyClass {
              static anyInternalMethod(): ModuleWithProviders;
              static anyExternalMethod(): ModuleWithProviders;
              static anyLibraryMethod(): ModuleWithProviders;
            }

            export declare function withParams(a: string): ModuleWithProviders;
            export declare function withOptionalParams(a: string = 'default'): ModuleWithProviders;
            export declare function doubleDelegation(a: string = 'default'): ModuleWithProviders;
            `
          },
          {
            name: _('/node_modules/test-package/typings/no-providers.d.ts'),
            contents: `
            import {ModuleWithProviders} from './core';
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export declare class NoProvidersInternalModule {}
            export declare function noProvExplicitInternalFunction(): ModuleWithProviders<NoProvidersInternalModule>;
            export declare function noProvExplicitExternalFunction(): ModuleWithProviders<ExternalModule>;
            export declare function noProvExplicitLibraryFunction(): ModuleWithProviders<LibraryModule>;
            export declare function noProvAnyInternalFunction(): ModuleWithProviders<any>;
            export declare function noProvAnyExternalFunction(): ModuleWithProviders<any>;
            export declare function noProvAnyLibraryFunction(): ModuleWithProviders<any>;
            export declare function noProvImplicitInternalFunction(): { ngModule: typeof NoProvidersInternalModule; };
            export declare function noProvImplicitExternalFunction(): { ngModule: typeof ExternalModule; };
            export declare function noProvImplicitLibraryFunction(): { ngModule: typeof LibraryModule; };
            `
          },
          {
            name: _('/node_modules/test-package/typings/module.d.ts'),
            contents: `
            export declare class ExternalModule {}
            `
          },
          {
            name: _('/node_modules/test-package/typings/core.d.ts'),
            contents: `

            export declare interface Type<T> {
              new (...args: any[]): T
            }
            export declare type Provider = any;
            export declare interface ModuleWithProviders<T> {
              ngModule: Type<T>
              providers?: Provider[]
            }
          `
          },
          {
            name: _('/node_modules/some-library/index.d.ts'),
            contents: 'export declare class LibraryModule {}'
          },
          {
            name: _('/node_modules/test-package/typings/iife-wrapped.d.ts'),
            contents: `
            import {ModuleWithProviders} from './core';
            export declare class WrappedClass {
                static forRoot(): ModuleWithProviders<any>;
            }`
          },
        ];
        loadTestFiles(TEST_PROGRAM);
        loadTestFiles(TEST_DTS_PROGRAM);
        const bundle = makeTestEntryPointBundle(
            'test-package', 'esm2015', false, getRootFiles(TEST_PROGRAM),
            getRootFiles(TEST_DTS_PROGRAM));
        program = bundle.src.program;
        dtsProgram = bundle.dts!;
        const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src, dtsProgram);
        referencesRegistry = new NgccReferencesRegistry(host);

        const processDts = true;
        const analyzer = new ModuleWithProvidersAnalyzer(
            host, bundle.src.program.getTypeChecker(), referencesRegistry, processDts);
        analyses = analyzer.analyzeProgram(program);
      });

      it('should ignore declarations that already have explicit NgModule type params', () => {
        expect(
            getAnalysisDescription(analyses, _('/node_modules/test-package/typings/explicit.d.ts')))
            .toEqual([]);
      });

      it('should find declarations that use `any` for the NgModule type param', () => {
        const anyAnalysis =
            getAnalysisDescription(analyses, _('/node_modules/test-package/typings/any.d.ts'));
        expect(anyAnalysis).toContain(['anyInternalFunction', 'AnyInternalModule', null]);
        expect(anyAnalysis).toContain(['anyExternalFunction', 'ExternalModule', null]);
        expect(anyAnalysis).toContain(['anyLibraryFunction', 'LibraryModule', 'some-library']);
        expect(anyAnalysis).toContain(['AnyClass.anyInternalMethod', 'AnyInternalModule', null]);
        expect(anyAnalysis).toContain(['AnyClass.anyExternalMethod', 'ExternalModule', null]);
        expect(anyAnalysis).toContain([
          'AnyClass.anyLibraryMethod', 'LibraryModule', 'some-library'
        ]);
      });

      it('should track internal module references in the references registry', () => {
        const declarations = referencesRegistry.getDeclarationMap();
        const externalModuleDeclaration = getDeclaration(
            program, absoluteFrom('/node_modules/test-package/src/module.js'), 'ExternalModule',
            ts.isClassDeclaration);
        const libraryModuleDeclaration = getDeclaration(
            program, absoluteFrom('/node_modules/some-library/index.d.ts'), 'LibraryModule',
            ts.isClassDeclaration);
        expect(declarations.has(externalModuleDeclaration.name!)).toBe(true);
        expect(declarations.has(libraryModuleDeclaration.name!)).toBe(false);
      });

      it('should find declarations that have implicit return types', () => {
        const anyAnalysis =
            getAnalysisDescription(analyses, _('/node_modules/test-package/typings/implicit.d.ts'));
        expect(anyAnalysis).toContain(['implicitInternalFunction', 'ImplicitInternalModule', null]);
        expect(anyAnalysis).toContain(['implicitExternalFunction', 'ExternalModule', null]);
        expect(anyAnalysis).toContain(['implicitLibraryFunction', 'LibraryModule', 'some-library']);
        expect(anyAnalysis).toContain([
          'ImplicitClass.implicitInternalMethod', 'ImplicitInternalModule', null
        ]);
        expect(anyAnalysis).toContain([
          'ImplicitClass.implicitExternalMethod', 'ExternalModule', null
        ]);
        expect(anyAnalysis).toContain([
          'ImplicitClass.implicitLibraryMethod', 'LibraryModule', 'some-library'
        ]);
      });


      it('should find declarations that delegate by calling another function', () => {
        const delegatedAnalysis = getAnalysisDescription(
            analyses, _('/node_modules/test-package/typings/delegated.d.ts'));

        expect(delegatedAnalysis).toContain([
          'delegatedExplicitInternalFunction', 'ExplicitInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedExplicitExternalFunction', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedExplicitLibraryFunction', 'LibraryModule', 'some-library'
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedExplicitClass.explicitInternalMethod', 'ExplicitInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedExplicitClass.explicitExternalMethod', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedExplicitClass.explicitLibraryMethod', 'LibraryModule', 'some-library'
        ]);

        expect(delegatedAnalysis).toContain([
          'delegatedImplicitInternalFunction', 'ImplicitInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedImplicitExternalFunction', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedImplicitLibraryFunction', 'LibraryModule', 'some-library'
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedImplicitClass.implicitInternalMethod', 'ImplicitInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedImplicitClass.implicitExternalMethod', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedImplicitClass.implicitLibraryMethod', 'LibraryModule', 'some-library'
        ]);

        expect(delegatedAnalysis).toContain([
          'delegatedAnyInternalFunction', 'AnyInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedAnyExternalFunction', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'delegatedAnyLibraryFunction', 'LibraryModule', 'some-library'
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedAnyClass.anyInternalMethod', 'AnyInternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedAnyClass.anyExternalMethod', 'ExternalModule', null
        ]);
        expect(delegatedAnalysis).toContain([
          'DelegatedAnyClass.anyLibraryMethod', 'LibraryModule', 'some-library'
        ]);

        expect(delegatedAnalysis).toContain(['withParams', 'ExplicitInternalModule', null]);
        expect(delegatedAnalysis).toContain(['withOptionalParams', 'ExplicitInternalModule', null]);
        expect(delegatedAnalysis).toContain(['doubleDelegation', 'ExplicitInternalModule', null]);
      });

      it('should find declarations that do not specify a `providers` property in the return type',
         () => {
           const anyAnalysis = getAnalysisDescription(
               analyses, _('/node_modules/test-package/typings/no-providers.d.ts'));
           expect(anyAnalysis).not.toContain([
             'noProvExplicitInternalFunction', 'NoProvidersInternalModule'
           ]);
           expect(anyAnalysis).not.toContain([
             'noProvExplicitExternalFunction', 'ExternalModule', null
           ]);
           expect(anyAnalysis).toContain([
             'noProvAnyInternalFunction', 'NoProvidersInternalModule', null
           ]);
           expect(anyAnalysis).toContain(['noProvAnyExternalFunction', 'ExternalModule', null]);
           expect(anyAnalysis).toContain([
             'noProvAnyLibraryFunction', 'LibraryModule', 'some-library'
           ]);
           expect(anyAnalysis).toContain([
             'noProvImplicitInternalFunction', 'NoProvidersInternalModule', null
           ]);
           expect(anyAnalysis).toContain([
             'noProvImplicitExternalFunction', 'ExternalModule', null
           ]);
           expect(anyAnalysis).toContain([
             'noProvImplicitLibraryFunction', 'LibraryModule', 'some-library'
           ]);
         });

      it('should find declarations that reference an aliased IIFE wrapped class', () => {
        const analysis = getAnalysisDescription(
            analyses, _('/node_modules/test-package/typings/iife-wrapped.d.ts'));
        expect(analysis).toContain(['WrappedClass.forRoot', 'WrappedClass', null]);
      });

      function getAnalysisDescription(
          analyses: ModuleWithProvidersAnalyses, fileName: AbsoluteFsPath) {
        const file = getSourceFileOrError(dtsProgram.program, fileName);
        const analysis = analyses.get(file);
        return analysis ? analysis.map(
                              info =>
                                  [getName(info.container) + info.declaration.name!.getText(),
                                   (info.ngModule.node as ts.ClassDeclaration).name!.getText(),
                                   info.ngModule.ownedByModuleGuess]) :
                          [];
      }

      function getName(node: DeclarationNode|null): string {
        return node && isNamedDeclaration(node) ? `${node.name.text}.` : '';
      }
    });
  });

  describe('tracking references when generic types already present', () => {
    let _: typeof absoluteFrom;
    let TEST_DTS_PROGRAM: TestFile[];
    let TEST_PROGRAM: TestFile[];

    beforeEach(() => {
      _ = absoluteFrom;

      TEST_PROGRAM = [
        {
          name: _('/node_modules/test-package/src/entry-point.js'),
          contents: `
          export * from './explicit';
          export * from './module';
        `,
        },
        {
          name: _('/node_modules/test-package/src/explicit.js'),
          contents: `
          import {ExternalModule} from './module';
          import {LibraryModule} from 'some-library';
          export class ExplicitInternalModule {}
          export class ExplicitClass {
            static explicitInternalMethod() {
              return {
                ngModule: ExplicitInternalModule,
                providers: []
              };
            }
            static explicitExternalMethod() {
              return {
                ngModule: ExternalModule,
                providers: []
              };
            }
            static explicitLibraryMethod() {
              return {
                ngModule: LibraryModule,
                providers: []
              };
            }
          }
          `,
        },
        {
          name: _('/node_modules/test-package/src/module.js'),
          contents: `
          export class ExternalModule {}
          `,
        },
        {
          name: _('/node_modules/some-library/index.d.ts'),
          contents: 'export declare class LibraryModule {}',
        },
      ];
      TEST_DTS_PROGRAM = [
        {
          name: _('/node_modules/test-package/typings/entry-point.d.ts'),
          contents: `
          export * from './explicit';
          export * from './module';
        `,
        },
        {
          name: _('/node_modules/test-package/typings/explicit.d.ts'),
          contents: `
          import {ModuleWithProviders} from './core';
          import {ExternalModule} from './module';
          import {LibraryModule} from 'some-library';
          export declare class ExplicitInternalModule {}
          export declare class ExplicitClass {
            static explicitInternalMethod(): ModuleWithProviders<ExplicitInternalModule>;
            static explicitExternalMethod(): ModuleWithProviders<ExternalModule>;
            static explicitLibraryMethod(): ModuleWithProviders<LibraryModule>;
          }
          `,
        },
        {
          name: _('/node_modules/test-package/typings/module.d.ts'),
          contents: `
          export declare class ExternalModule {}
          `,
        },
        {
          name: _('/node_modules/test-package/typings/core.d.ts'),
          contents: `

          export declare interface Type<T> {
            new (...args: any[]): T
          }
          export declare type Provider = any;
          export declare interface ModuleWithProviders<T> {
            ngModule: Type<T>
            providers?: Provider[]
          }
        `,
        },
        {
          name: _('/node_modules/some-library/index.d.ts'),
          contents: 'export declare class LibraryModule {}',
        },
      ];
      loadTestFiles(TEST_PROGRAM);
      loadTestFiles(TEST_DTS_PROGRAM);
    });

    it('should track references even when nothing needs to be updated', () => {
      const bundle = makeTestEntryPointBundle(
          'test-package', 'esm2015', false, getRootFiles(TEST_PROGRAM),
          getRootFiles(TEST_DTS_PROGRAM));
      const program = bundle.src.program;
      const dtsProgram = bundle.dts!;
      const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src, dtsProgram);
      const referencesRegistry = new NgccReferencesRegistry(host);

      const processDts = true;
      const analyzer = new ModuleWithProvidersAnalyzer(
          host, bundle.src.program.getTypeChecker(), referencesRegistry, processDts);
      const analyses = analyzer.analyzeProgram(program);

      const file = getSourceFileOrError(
          dtsProgram.program, _('/node_modules/test-package/typings/explicit.d.ts'));
      expect(analyses.has(file)).toBe(false);

      const declarations = referencesRegistry.getDeclarationMap();
      const explicitInternalModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/test-package/src/explicit.js'),
          'ExplicitInternalModule', ts.isClassDeclaration);
      const externalModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/test-package/src/module.js'), 'ExternalModule',
          ts.isClassDeclaration);
      const libraryModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/some-library/index.d.ts'), 'LibraryModule',
          ts.isClassDeclaration);
      expect(declarations.has(explicitInternalModuleDeclaration.name!)).toBe(true);
      expect(declarations.has(externalModuleDeclaration.name!)).toBe(true);
      expect(declarations.has(libraryModuleDeclaration.name!)).toBe(false);
    });

    it('should track references even when typings have already been processed', () => {
      const bundle =
          makeTestEntryPointBundle('test-package', 'esm2015', false, getRootFiles(TEST_PROGRAM));
      const program = bundle.src.program;
      const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle.src, null);
      const referencesRegistry = new NgccReferencesRegistry(host);

      const processDts = false;  // Emulate the scenario where typings have already been processed
      const analyzer = new ModuleWithProvidersAnalyzer(
          host, bundle.src.program.getTypeChecker(), referencesRegistry, processDts);
      const analyses = analyzer.analyzeProgram(program);

      expect(analyses.size).toBe(0);

      const declarations = referencesRegistry.getDeclarationMap();
      const explicitInternalModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/test-package/src/explicit.js'),
          'ExplicitInternalModule', ts.isClassDeclaration);
      const externalModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/test-package/src/module.js'), 'ExternalModule',
          ts.isClassDeclaration);
      const libraryModuleDeclaration = getDeclaration(
          program, absoluteFrom('/node_modules/some-library/index.d.ts'), 'LibraryModule',
          ts.isClassDeclaration);
      expect(declarations.has(explicitInternalModuleDeclaration.name!)).toBe(true);
      expect(declarations.has(externalModuleDeclaration.name!)).toBe(true);
      expect(declarations.has(libraryModuleDeclaration.name!)).toBe(false);
    });
  });
});
