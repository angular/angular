/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {fromObject, generateMapFileComment} from 'convert-source-map';
import {CompiledClass, DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {ModuleWithProvidersAnalyzer} from '../../src/analysis/module_with_providers_analyzer';
import {PrivateDeclarationsAnalyzer} from '../../src/analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {RedundantDecoratorMap, Renderer} from '../../src/rendering/renderer';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {makeTestEntryPointBundle} from '../helpers/utils';

class TestRenderer extends Renderer {
  constructor(host: Esm2015ReflectionHost, isCore: boolean, bundle: EntryPointBundle) {
    super(host, isCore, bundle, '/src', '/dist');
  }
  addImports(output: MagicString, imports: {name: string, as: string}[]) {
    output.prepend('\n// ADD IMPORTS\n');
  }
  addExports(output: MagicString, baseEntryPointPath: string, exports: {
    identifier: string,
    from: string
  }[]) {
    output.prepend('\n// ADD EXPORTS\n');
  }
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    output.prepend('\n// ADD CONSTANTS\n');
  }
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string) {
    output.prepend('\n// ADD DEFINITIONS\n');
  }
  removeDecorators(output: MagicString, decoratorsToRemove: RedundantDecoratorMap) {
    output.prepend('\n// REMOVE DECORATORS\n');
  }
  rewriteSwitchableDeclarations(output: MagicString, sourceFile: ts.SourceFile): void {
    output.prepend('\n// REWRITTEN DECLARATIONS\n');
  }
}

function createTestRenderer(
    packageName: string, files: {name: string, contents: string}[],
    dtsFiles?: {name: string, contents: string}[]) {
  const isCore = packageName === '@angular/core';
  const bundle = makeTestEntryPointBundle('esm2015', files, dtsFiles);
  const typeChecker = bundle.src.program.getTypeChecker();
  const host = new Esm2015ReflectionHost(isCore, typeChecker, bundle.dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses = new DecorationAnalyzer(
                                 bundle.src.program, bundle.src.options, bundle.src.host,
                                 typeChecker, host, referencesRegistry, bundle.rootDirs, isCore)
                                 .analyzeProgram();
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host).analyzeProgram(bundle.src.program);
  const moduleWithProvidersAnalyses =
      new ModuleWithProvidersAnalyzer(host, referencesRegistry).analyzeProgram(bundle.src.program);
  const privateDeclarationsAnalyses =
      new PrivateDeclarationsAnalyzer(host, referencesRegistry).analyzeProgram(bundle.src.program);
  const renderer = new TestRenderer(host, isCore, bundle);
  spyOn(renderer, 'addImports').and.callThrough();
  spyOn(renderer, 'addDefinitions').and.callThrough();
  spyOn(renderer, 'removeDecorators').and.callThrough();

  return {renderer, decorationAnalyses, switchMarkerAnalyses, moduleWithProvidersAnalyses,
          privateDeclarationsAnalyses};
}


describe('Renderer', () => {
  const INPUT_PROGRAM = {
    name: '/src/file.js',
    contents:
        `import { Directive } from '@angular/core';\nexport class A {\n    foo(x) {\n        return x;\n    }\n}\nA.decorators = [\n    { type: Directive, args: [{ selector: '[a]' }] }\n];\n`
  };
  const INPUT_DTS_PROGRAM = {
    name: '/typings/file.d.ts',
    contents: `export declare class A {\nfoo(x: number): number;\n}\n`
  };

  const COMPONENT_PROGRAM = {
    name: '/src/component.js',
    contents:
        `import { Component } from '@angular/core';\nexport class A {}\nA.decorators = [\n    { type: Component, args: [{ selector: 'a', template: '{{ person!.name }}' }] }\n];\n`
  };

  const INPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'file': '/src/file.js',
    'sourceRoot': '',
    'sources': ['/src/file.ts'],
    'names': [],
    'mappings':
        'AAAA,OAAO,EAAE,SAAS,EAAE,MAAM,eAAe,CAAC;AAC1C,MAAM;IACF,GAAG,CAAC,CAAS;QACT,OAAO,CAAC,CAAC;IACb,CAAC;;AACM,YAAU,GAAG;IAChB,EAAE,IAAI,EAAE,SAAS,EAAE,IAAI,EAAE,CAAC,EAAE,QAAQ,EAAE,KAAK,EAAE,CAAC,EAAE;CACnD,CAAC',
    'sourcesContent': [INPUT_PROGRAM.contents]
  });

  const RENDERED_CONTENTS =
      `\n// ADD EXPORTS\n\n// ADD IMPORTS\n\n// ADD CONSTANTS\n\n// ADD DEFINITIONS\n\n// REMOVE DECORATORS\n` +
      INPUT_PROGRAM.contents;

  const OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'file': '/dist/file.js',
    'sources': ['/src/file.js'],
    'sourcesContent': [INPUT_PROGRAM.contents],
    'names': [],
    'mappings': ';;;;;;;;;;AAAA;;;;;;;;;'
  });

  const MERGED_OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'sources': ['/src/file.ts'],
    'names': [],
    'mappings': ';;;;;;;;;;AAAA',
    'file': '/dist/file.js',
    'sourcesContent': [INPUT_PROGRAM.contents]
  });

  describe('renderProgram()', () => {
    it('should render the modified contents; and a new map file, if the original provided no map file.',
       () => {
         const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
                moduleWithProvidersAnalyses} = createTestRenderer('test-package', [INPUT_PROGRAM]);
         const result = renderer.renderProgram(
             decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses);
         expect(result[0].path).toEqual('/dist/file.js');
         expect(result[0].contents)
             .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('/dist/file.js.map'));
         expect(result[1].path).toEqual('/dist/file.js.map');
         expect(result[1].contents).toEqual(OUTPUT_PROGRAM_MAP.toJSON());
       });


    it('should render as JavaScript', () => {
      const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses} = createTestRenderer('test-package', [COMPONENT_PROGRAM]);
      renderer.renderProgram(
          decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
          moduleWithProvidersAnalyses);
      const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
      expect(addDefinitionsSpy.calls.first().args[2])
          .toEqual(`/*@__PURE__*/ ɵngcc0.ɵsetClassMetadata(A, [{
        type: Component,
        args: [{ selector: 'a', template: '{{ person!.name }}' }]
    }], null, null);
A.ngComponentDef = ɵngcc0.ɵdefineComponent({ type: A, selectors: [["a"]], factory: function A_Factory(t) { return new (t || A)(); }, consts: 1, vars: 1, template: function A_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵtext(0);
    } if (rf & 2) {
        ɵngcc0.ɵtextBinding(0, ɵngcc0.ɵinterpolation1("", ctx.person.name, ""));
    } }, encapsulation: 2 });`);
    });


    describe('calling abstract methods', () => {
      it('should call addImports with the source code and info about the core Angular library.',
         () => {
           const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
                  moduleWithProvidersAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           const result = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses);
           const addImportsSpy = renderer.addImports as jasmine.Spy;
           expect(addImportsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
           expect(addImportsSpy.calls.first().args[1]).toEqual([
             {name: '@angular/core', as: 'ɵngcc0'}
           ]);
         });

      it('should call addDefinitions with the source code, the analyzed class and the rendered definitions.',
         () => {
           const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
                  moduleWithProvidersAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           const result = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses);
           const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
           expect(addDefinitionsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
           expect(addDefinitionsSpy.calls.first().args[1]).toEqual(jasmine.objectContaining({
             name: 'A',
             decorators: [jasmine.objectContaining({name: 'Directive'})],
           }));
           expect(addDefinitionsSpy.calls.first().args[2])
               .toEqual(`/*@__PURE__*/ ɵngcc0.ɵsetClassMetadata(A, [{
        type: Directive,
        args: [{ selector: '[a]' }]
    }], null, { foo: [] });
A.ngDirectiveDef = ɵngcc0.ɵdefineDirective({ type: A, selectors: [["", "a", ""]], factory: function A_Factory(t) { return new (t || A)(); } });`);
         });

      it('should call removeDecorators with the source code, a map of class decorators that have been analyzed',
         () => {
           const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
                  moduleWithProvidersAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           const result = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses);
           const removeDecoratorsSpy = renderer.removeDecorators as jasmine.Spy;
           expect(removeDecoratorsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);

           // Each map key is the TS node of the decorator container
           // Each map value is an array of TS nodes that are the decorators to remove
           const map = removeDecoratorsSpy.calls.first().args[1] as Map<ts.Node, ts.Node[]>;
           const keys = Array.from(map.keys());
           expect(keys.length).toEqual(1);
           expect(keys[0].getText())
               .toEqual(`[\n    { type: Directive, args: [{ selector: '[a]' }] }\n]`);
           const values = Array.from(map.values());
           expect(values.length).toEqual(1);
           expect(values[0].length).toEqual(1);
           expect(values[0][0].getText())
               .toEqual(`{ type: Directive, args: [{ selector: '[a]' }] }`);
         });
    });

    describe('source map merging', () => {
      it('should merge any inline source map from the original file and write the output as an inline source map',
         () => {
           const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses,
                  moduleWithProvidersAnalyses} =
               createTestRenderer(
                   'test-package', [{
                     ...INPUT_PROGRAM,
                     contents: INPUT_PROGRAM.contents + '\n' + INPUT_PROGRAM_MAP.toComment()
                   }]);
           const result = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses);
           expect(result[0].path).toEqual('/dist/file.js');
           expect(result[0].contents)
               .toEqual(RENDERED_CONTENTS + '\n' + MERGED_OUTPUT_PROGRAM_MAP.toComment());
           expect(result[1]).toBeUndefined();
         });

      it('should merge any external source map from the original file and write the output to an external source map',
         () => {
           // Mock out reading the map file from disk
           spyOn(fs, 'readFileSync').and.returnValue(INPUT_PROGRAM_MAP.toJSON());
           const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses,
                  moduleWithProvidersAnalyses} =
               createTestRenderer(
                   'test-package', [{
                     ...INPUT_PROGRAM,
                     contents: INPUT_PROGRAM.contents + '\n//# sourceMappingURL=file.js.map'
                   }]);
           const result = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses);
           expect(result[0].path).toEqual('/dist/file.js');
           expect(result[0].contents)
               .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('/dist/file.js.map'));
           expect(result[1].path).toEqual('/dist/file.js.map');
           expect(result[1].contents).toEqual(MERGED_OUTPUT_PROGRAM_MAP.toJSON());
         });
    });

    describe('@angular/core support', () => {
      it('should render relative imports in ESM bundles', () => {
        const CORE_FILE = {
          name: '/src/core.js',
          contents:
              `import { NgModule } from './ng_module';\nexport class MyModule {}\nMyModule.decorators = [\n    { type: NgModule, args: [] }\n];\n`
        };
        const R3_SYMBOLS_FILE = {
          // r3_symbols in the file name indicates that this is the path to rewrite core imports to
          name: '/src/r3_symbols.js',
          contents: `export const NgModule = () => null;`
        };
        // The package name of `@angular/core` indicates that we are compiling the core library.
        const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} =
            createTestRenderer('@angular/core', [CORE_FILE, R3_SYMBOLS_FILE]);
        renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);
        const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
        expect(addDefinitionsSpy.calls.first().args[2])
            .toContain(`/*@__PURE__*/ ɵngcc0.setClassMetadata(`);
        const addImportsSpy = renderer.addImports as jasmine.Spy;
        expect(addImportsSpy.calls.first().args[1]).toEqual([{name: './r3_symbols', as: 'ɵngcc0'}]);
      });

      it('should render no imports in FESM bundles', () => {
        const CORE_FILE = {
          name: '/src/core.js',
          contents: `export const NgModule = () => null;
            export class MyModule {}\nMyModule.decorators = [\n    { type: NgModule, args: [] }\n];\n`
        };

        const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} = createTestRenderer('@angular/core', [CORE_FILE]);
        renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);
        const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
        expect(addDefinitionsSpy.calls.first().args[2])
            .toContain(`/*@__PURE__*/ setClassMetadata(`);
        const addImportsSpy = renderer.addImports as jasmine.Spy;
        expect(addImportsSpy.calls.first().args[1]).toEqual([]);
      });
    });

    describe('rendering typings', () => {
      it('should render extract types into typings files', () => {
        const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} =
            createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);
        const result = renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/file.d.ts') !;
        expect(typingsFile.contents)
            .toContain(
                'foo(x: number): number;\n    static ngDirectiveDef: ɵngcc0.ɵDirectiveDefWithMeta');
      });

      it('should render imports into typings files', () => {
        const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} =
            createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);
        const result = renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/file.d.ts') !;
        expect(typingsFile.contents).toContain(`// ADD IMPORTS\nexport declare class A`);
      });

      it('should render exports into typings files', () => {
        const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} =
            createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);

        // Add a mock export to trigger export rendering
        privateDeclarationsAnalyses.push(
            {identifier: 'ComponentB', from: '/src/file.js', dtsFrom: '/typings/b.d.ts'});

        const result = renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/file.d.ts') !;
        expect(typingsFile.contents)
            .toContain(`// ADD EXPORTS\n\n// ADD IMPORTS\nexport declare class A`);
      });

      it('should fixup functions/methods that return ModuleWithProviders structures', () => {
        const MODULE_WITH_PROVIDERS_PROGRAM = [
          {
            name: '/src/index.js',
            contents: `
            import {ExternalModule} from './module';
            import {LibraryModule} from 'some-library';
            export class SomeClass {}
            export class SomeModule {
              static withProviders1() {
                return {ngModule: SomeModule};
              }
              static withProviders2() {
                return {ngModule: SomeModule};
              }
              static withProviders3() {
                return {ngModule: SomeClass};
              }
              static withProviders4() {
                return {ngModule: ExternalModule};
              }
              static withProviders5() {
                return {ngModule: ExternalModule};
              }
              static withProviders6() {
                return {ngModule: LibraryModule};
              }
              static withProviders7() {
                return {ngModule: SomeModule, providers: []};
              };
              static withProviders8() {
                return {ngModule: SomeModule};
              }
            }
            export function withProviders1() {
              return {ngModule: SomeModule};
            }
            export function withProviders2() {
              return {ngModule: SomeModule};
            }
            export function withProviders3() {
              return {ngModule: SomeClass};
            }
            export function withProviders4() {
              return {ngModule: ExternalModule};
            }
            export function withProviders5() {
              return {ngModule: ExternalModule};
            }
            export function withProviders6() {
              return {ngModule: LibraryModule};
            }
            export function withProviders7() {
              return {ngModule: SomeModule, providers: []};
            };
            export function withProviders8() {
              return {ngModule: SomeModule};
            }`,
          },
          {
            name: '/src/module.js',
            contents: `
            export class ExternalModule {
              static withProviders1() {
                return {ngModule: ExternalModule};
              }
              static withProviders2() {
                return {ngModule: ExternalModule};
              }
            }`
          },
          {
            name: '/node_modules/some-library/index.d.ts',
            contents: 'export declare class LibraryModule {}'
          },
        ];
        const MODULE_WITH_PROVIDERS_DTS_PROGRAM = [
          {
            name: '/typings/index.d.ts',
            contents: `
            import {ModuleWithProviders} from '@angular/core';
            export declare class SomeClass {}
            export interface MyModuleWithProviders extends ModuleWithProviders {}
            export declare class SomeModule {
              static withProviders1(): ModuleWithProviders;
              static withProviders2(): ModuleWithProviders<any>;
              static withProviders3(): ModuleWithProviders<SomeClass>;
              static withProviders4(): ModuleWithProviders;
              static withProviders5();
              static withProviders6(): ModuleWithProviders;
              static withProviders7(): {ngModule: SomeModule, providers: any[]};
              static withProviders8(): MyModuleWithProviders;
            }
            export declare function withProviders1(): ModuleWithProviders;
            export declare function withProviders2(): ModuleWithProviders<any>;
            export declare function withProviders3(): ModuleWithProviders<SomeClass>;
            export declare function withProviders4(): ModuleWithProviders;
            export declare function withProviders5();
            export declare function withProviders6(): ModuleWithProviders;
            export declare function withProviders7(): {ngModule: SomeModule, providers: any[]};
            export declare function withProviders8(): MyModuleWithProviders;`
          },
          {
            name: '/typings/module.d.ts',
            contents: `
            export interface ModuleWithProviders {}
            export declare class ExternalModule {
              static withProviders1(): ModuleWithProviders;
              static withProviders2(): ModuleWithProviders;
            }`
          },
          {
            name: '/node_modules/some-library/index.d.ts',
            contents: 'export declare class LibraryModule {}'
          },
        ];
        const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
               moduleWithProvidersAnalyses} =
            createTestRenderer(
                'test-package', MODULE_WITH_PROVIDERS_PROGRAM, MODULE_WITH_PROVIDERS_DTS_PROGRAM);

        const result = renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/index.d.ts') !;

        expect(typingsFile.contents).toContain(`
              static withProviders1(): ModuleWithProviders<SomeModule>;
              static withProviders2(): ModuleWithProviders<SomeModule>;
              static withProviders3(): ModuleWithProviders<SomeClass>;
              static withProviders4(): ModuleWithProviders<ɵngcc0.ExternalModule>;
              static withProviders5(): ɵngcc1.ModuleWithProviders<ɵngcc0.ExternalModule>;
              static withProviders6(): ModuleWithProviders<ɵngcc2.LibraryModule>;
              static withProviders7(): ({ngModule: SomeModule, providers: any[]})&{ngModule:SomeModule};
              static withProviders8(): (MyModuleWithProviders)&{ngModule:SomeModule};`);
        expect(typingsFile.contents).toContain(`
            export declare function withProviders1(): ModuleWithProviders<SomeModule>;
            export declare function withProviders2(): ModuleWithProviders<SomeModule>;
            export declare function withProviders3(): ModuleWithProviders<SomeClass>;
            export declare function withProviders4(): ModuleWithProviders<ɵngcc0.ExternalModule>;
            export declare function withProviders5(): ɵngcc1.ModuleWithProviders<ɵngcc0.ExternalModule>;
            export declare function withProviders6(): ModuleWithProviders<ɵngcc2.LibraryModule>;
            export declare function withProviders7(): ({ngModule: SomeModule, providers: any[]})&{ngModule:SomeModule};
            export declare function withProviders8(): (MyModuleWithProviders)&{ngModule:SomeModule};`);

        expect(renderer.addImports).toHaveBeenCalledWith(jasmine.any(MagicString), [
          {name: './module', as: 'ɵngcc0'},
          {name: '@angular/core', as: 'ɵngcc1'},
          {name: 'some-library', as: 'ɵngcc2'},
        ]);


        // The following expectation checks that we do not mistake `ModuleWithProviders` types
        // that are not imported from `@angular/core`.
        const typingsFile2 = result.find(f => f.path === '/typings/module.d.ts') !;
        expect(typingsFile2.contents).toContain(`
              static withProviders1(): (ModuleWithProviders)&{ngModule:ExternalModule};
              static withProviders2(): (ModuleWithProviders)&{ngModule:ExternalModule};`);
      });
    });
  });
});
