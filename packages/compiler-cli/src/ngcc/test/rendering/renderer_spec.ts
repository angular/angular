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
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {Renderer} from '../../src/rendering/renderer';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {makeTestEntryPointBundle} from '../helpers/utils';

class TestRenderer extends Renderer {
  constructor(host: Esm2015ReflectionHost, isCore: boolean, bundle: EntryPointBundle) {
    super(host, isCore, bundle, '/src', '/dist');
  }
  addImports(output: MagicString, imports: {name: string, as: string}[]) {
    output.prepend('\n// ADD IMPORTS\n');
  }
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    output.prepend('\n// ADD CONSTANTS\n');
  }
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string) {
    output.prepend('\n// ADD DEFINITIONS\n');
  }
  removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>) {
    output.prepend('\n// REMOVE DECORATORS\n');
  }
  rewriteSwitchableDeclarations(output: MagicString, sourceFile: ts.SourceFile): void {
    output.prepend('\n// REWRITTEN DECLARATIONS\n');
  }
}

function createTestRenderer(
    packageName: string, files: {name: string, contents: string}[],
    dtsFile?: {name: string, contents: string}) {
  const isCore = packageName === '@angular/core';
  const bundle = makeTestEntryPointBundle('esm2015', files, dtsFile && [dtsFile]);
  const typeChecker = bundle.src.program.getTypeChecker();
  const host = new Esm2015ReflectionHost(isCore, typeChecker, bundle.dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(typeChecker, host, referencesRegistry, bundle.rootDirs, isCore)
          .analyzeProgram(bundle.src.program);
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host).analyzeProgram(bundle.src.program);
  const renderer = new TestRenderer(host, isCore, bundle);
  spyOn(renderer, 'addImports').and.callThrough();
  spyOn(renderer, 'addDefinitions').and.callThrough();
  spyOn(renderer, 'removeDecorators').and.callThrough();

  return {renderer, decorationAnalyses, switchMarkerAnalyses};
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
      `\n// REMOVE DECORATORS\n\n// ADD IMPORTS\n\n// ADD CONSTANTS\n\n// ADD DEFINITIONS\n` +
      INPUT_PROGRAM.contents;

  const OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'file': '/dist/file.js',
    'sources': ['/src/file.js'],
    'sourcesContent': [INPUT_PROGRAM.contents],
    'names': [],
    'mappings': ';;;;;;;;AAAA;;;;;;;;;'
  });

  const MERGED_OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'sources': ['/src/file.ts'],
    'names': [],
    'mappings': ';;;;;;;;AAAA',
    'file': '/dist/file.js',
    'sourcesContent': [INPUT_PROGRAM.contents]
  });

  describe('renderProgram()', () => {
    it('should render the modified contents; and a new map file, if the original provided no map file.',
       () => {
         const {renderer, decorationAnalyses, switchMarkerAnalyses} =
             createTestRenderer('test-package', [INPUT_PROGRAM]);
         const result = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
         expect(result[0].path).toEqual('/dist/file.js');
         expect(result[0].contents)
             .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('/dist/file.js.map'));
         expect(result[1].path).toEqual('/dist/file.js.map');
         expect(result[1].contents).toEqual(OUTPUT_PROGRAM_MAP.toJSON());
       });

    describe('calling abstract methods', () => {
      it('should call addImports with the source code and info about the core Angular library.',
         () => {
           const {decorationAnalyses, renderer, switchMarkerAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
           const addImportsSpy = renderer.addImports as jasmine.Spy;
           expect(addImportsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
           expect(addImportsSpy.calls.first().args[1]).toEqual([
             {name: '@angular/core', as: 'ɵngcc0'}
           ]);
         });

      it('should call addDefinitions with the source code, the analyzed class and the rendered definitions.',
         () => {
           const {decorationAnalyses, renderer, switchMarkerAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
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
           const {decorationAnalyses, renderer, switchMarkerAnalyses} =
               createTestRenderer('test-package', [INPUT_PROGRAM]);
           renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
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
           const {decorationAnalyses, renderer, switchMarkerAnalyses} = createTestRenderer(
               'test-package', [{
                 ...INPUT_PROGRAM,
                 contents: INPUT_PROGRAM.contents + '\n' + INPUT_PROGRAM_MAP.toComment()
               }]);
           const result = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
           expect(result[0].path).toEqual('/dist/file.js');
           expect(result[0].contents)
               .toEqual(RENDERED_CONTENTS + '\n' + MERGED_OUTPUT_PROGRAM_MAP.toComment());
           expect(result[1]).toBeUndefined();
         });

      it('should merge any external source map from the original file and write the output to an external source map',
         () => {
           // Mock out reading the map file from disk
           spyOn(fs, 'readFileSync').and.returnValue(INPUT_PROGRAM_MAP.toJSON());
           const {decorationAnalyses, renderer, switchMarkerAnalyses} = createTestRenderer(
               'test-package', [{
                 ...INPUT_PROGRAM,
                 contents: INPUT_PROGRAM.contents + '\n//# sourceMappingURL=file.js.map'
               }]);
           const result = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);
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
        const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses} =
            createTestRenderer('@angular/core', [CORE_FILE, R3_SYMBOLS_FILE]);
        renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
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

        const {decorationAnalyses, renderer, switchMarkerAnalyses, privateDeclarationsAnalyses} =
            createTestRenderer('@angular/core', [CORE_FILE]);
        renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
        const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
        expect(addDefinitionsSpy.calls.first().args[2])
            .toContain(`/*@__PURE__*/ setClassMetadata(`);
        const addImportsSpy = renderer.addImports as jasmine.Spy;
        expect(addImportsSpy.calls.first().args[1]).toEqual([]);
      });
    });

    describe('rendering typings', () => {
      it('should render extract types into typings files', () => {
        const {renderer, decorationAnalyses, switchMarkerAnalyses} =
            createTestRenderer('test-package', [INPUT_PROGRAM], INPUT_DTS_PROGRAM);
        const result = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/file.d.ts') !;
        expect(typingsFile.contents)
            .toContain(
                'foo(x: number): number;\n    static ngDirectiveDef: ɵngcc0.ɵDirectiveDefWithMeta');
      });

      it('should render imports into typings files', () => {
        const {renderer, decorationAnalyses, switchMarkerAnalyses} =
            createTestRenderer('test-package', [INPUT_PROGRAM], INPUT_DTS_PROGRAM);
        const result = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses);

        const typingsFile = result.find(f => f.path === '/typings/file.d.ts') !;
        expect(typingsFile.contents).toContain(`// ADD IMPORTS\nexport declare class A`);
      });
    });
  });
});
