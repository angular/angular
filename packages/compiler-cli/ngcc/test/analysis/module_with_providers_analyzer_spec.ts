/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, absoluteFrom, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {getDeclaration} from '../../../src/ngtsc/testing';
import {loadTestFiles} from '../../../test/helpers';
import {ModuleWithProvidersAnalyses, ModuleWithProvidersAnalyzer} from '../../src/analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {BundleProgram} from '../../src/packages/bundle_program';
import {MockLogger} from '../helpers/mock_logger';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('ModuleWithProvidersAnalyzer', () => {
    describe('analyzeProgram()', () => {
      let _: typeof absoluteFrom;
      let analyses: ModuleWithProvidersAnalyses;
      let program: ts.Program;
      let dtsProgram: BundleProgram|null;
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
            name: _('/node_modules/test-package/src/module.js'),
            contents: `
            export class ExternalModule {}
            `
          },
          {
            name: _('/node_modules/some-library/index.d.ts'),
            contents: 'export declare class LibraryModule {}'
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
        ];
        loadTestFiles(TEST_PROGRAM);
        loadTestFiles(TEST_DTS_PROGRAM);
        const bundle = makeTestEntryPointBundle(
            'test-package', 'esm2015', 'esm2015', false, getRootFiles(TEST_PROGRAM),
            getRootFiles(TEST_DTS_PROGRAM));
        program = bundle.src.program;
        dtsProgram = bundle.dts;
        const host = new Esm2015ReflectionHost(
            new MockLogger(), false, program.getTypeChecker(), dtsProgram);
        referencesRegistry = new NgccReferencesRegistry(host);

        const analyzer = new ModuleWithProvidersAnalyzer(host, referencesRegistry);
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
        expect(anyAnalysis).toContain(['anyInternalMethod', 'AnyInternalModule', null]);
        expect(anyAnalysis).toContain(['anyExternalMethod', 'ExternalModule', null]);
        expect(anyAnalysis).toContain(['anyLibraryMethod', 'LibraryModule', 'some-library']);
      });

      it('should track internal module references in the references registry', () => {
        const declarations = referencesRegistry.getDeclarationMap();
        const externalModuleDeclaration = getDeclaration(
            program, absoluteFrom('/node_modules/test-package/src/module.js'), 'ExternalModule',
            ts.isClassDeclaration);
        const libraryModuleDeclaration = getDeclaration(
            program, absoluteFrom('/node_modules/some-library/index.d.ts'), 'LibraryModule',
            ts.isClassDeclaration);
        expect(declarations.has(externalModuleDeclaration.name !)).toBe(true);
        expect(declarations.has(libraryModuleDeclaration.name !)).toBe(false);
      });

      it('should find declarations that have implicit return types', () => {
        const anyAnalysis =
            getAnalysisDescription(analyses, _('/node_modules/test-package/typings/implicit.d.ts'));
        expect(anyAnalysis).toContain(['implicitInternalFunction', 'ImplicitInternalModule', null]);
        expect(anyAnalysis).toContain(['implicitExternalFunction', 'ExternalModule', null]);
        expect(anyAnalysis).toContain(['implicitLibraryFunction', 'LibraryModule', 'some-library']);
        expect(anyAnalysis).toContain(['implicitInternalMethod', 'ImplicitInternalModule', null]);
        expect(anyAnalysis).toContain(['implicitExternalMethod', 'ExternalModule', null]);
        expect(anyAnalysis).toContain(['implicitLibraryMethod', 'LibraryModule', 'some-library']);
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

      function getAnalysisDescription(
          analyses: ModuleWithProvidersAnalyses, fileName: AbsoluteFsPath) {
        const file = getSourceFileOrError(dtsProgram !.program, fileName);
        const analysis = analyses.get(file);
        return analysis ?
            analysis.map(
                info =>
                    [info.declaration.name !.getText(),
                     (info.ngModule.node as ts.ClassDeclaration).name !.getText(),
                     info.ngModule.viaModule]) :
            [];
      }
    });
  });
});
