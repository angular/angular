/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Statement} from '@angular/compiler';
import {fromObject, fromSource, generateMapFileComment, SourceMapConverter} from 'convert-source-map';
import MagicString from 'magic-string';
import {encode, SourceMapMappings} from 'sourcemap-codec';
import * as ts from 'typescript';

import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {Reexport} from '../../../src/ngtsc/imports';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {Import, ImportManager, translateStatement} from '../../../src/ngtsc/translator';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {ModuleWithProvidersInfo} from '../../src/analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {ExportInfo, PrivateDeclarationsAnalyzer} from '../../src/analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {CompiledClass} from '../../src/analysis/types';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {Renderer} from '../../src/rendering/renderer';
import {RedundantDecoratorMap, RenderingFormatter} from '../../src/rendering/rendering_formatter';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

class TestRenderingFormatter implements RenderingFormatter {
  private printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

  constructor(private isEs5: boolean) {}

  addImports(output: MagicString, imports: Import[], sf: ts.SourceFile) {
    output.prepend('\n// ADD IMPORTS\n');
  }
  addExports(output: MagicString, baseEntryPointPath: string, exports: ExportInfo[]) {
    output.prepend('\n// ADD EXPORTS\r\n');
  }
  addDirectExports(output: MagicString, exports: Reexport[]): void {
    output.prepend('\n// ADD DIRECT EXPORTS\n');
  }
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    output.prepend('\n// ADD CONSTANTS\n');
  }
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string) {
    output.prepend('\n// ADD DEFINITIONS\n');
  }
  addAdjacentStatements(output: MagicString, compiledClass: CompiledClass, statements: string) {
    output.prepend('\n// ADD ADJACENT STATEMENTS\n');
  }
  removeDecorators(output: MagicString, decoratorsToRemove: RedundantDecoratorMap) {
    output.prepend('\n// REMOVE DECORATORS\n');
  }
  rewriteSwitchableDeclarations(output: MagicString, sourceFile: ts.SourceFile): void {
    output.prepend('\n// REWRITTEN DECLARATIONS\n');
  }
  addModuleWithProvidersParams(
      output: MagicString, moduleWithProviders: ModuleWithProvidersInfo[],
      importManager: ImportManager): void {
    output.prepend('\n// ADD MODUlE WITH PROVIDERS PARAMS\n');
  }
  printStatement(stmt: Statement, sourceFile: ts.SourceFile, importManager: ImportManager): string {
    const node = translateStatement(
        stmt, importManager,
        {downlevelTaggedTemplates: this.isEs5, downlevelVariableDeclarations: this.isEs5});
    const code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

    return `// TRANSPILED\n${code}`;
  }
}

function createTestRenderer(
    packageName: string, files: TestFile[], dtsFiles?: TestFile[], mappingFiles?: TestFile[],
    isEs5 = false) {
  const logger = new MockLogger();
  loadTestFiles(files);
  if (dtsFiles) {
    loadTestFiles(dtsFiles);
  }
  if (mappingFiles) {
    loadTestFiles(mappingFiles);
  }
  const fs = getFileSystem();
  const isCore = packageName === '@angular/core';
  const bundle = makeTestEntryPointBundle(
      'test-package', 'esm5', isCore, getRootFiles(files), dtsFiles && getRootFiles(dtsFiles));
  const host = isEs5 ? new Esm5ReflectionHost(logger, isCore, bundle.src, bundle.dts) :
                       new Esm2015ReflectionHost(logger, isCore, bundle.src, bundle.dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(fs, bundle, host, referencesRegistry).analyzeProgram();
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath)
                                   .analyzeProgram(bundle.src.program);
  const privateDeclarationsAnalyses =
      new PrivateDeclarationsAnalyzer(host, referencesRegistry).analyzeProgram(bundle.src.program);
  const testFormatter = new TestRenderingFormatter(isEs5);
  spyOn(testFormatter, 'addExports').and.callThrough();
  spyOn(testFormatter, 'addImports').and.callThrough();
  spyOn(testFormatter, 'addDefinitions').and.callThrough();
  spyOn(testFormatter, 'addAdjacentStatements').and.callThrough();
  spyOn(testFormatter, 'addConstants').and.callThrough();
  spyOn(testFormatter, 'removeDecorators').and.callThrough();
  spyOn(testFormatter, 'rewriteSwitchableDeclarations').and.callThrough();
  spyOn(testFormatter, 'addModuleWithProvidersParams').and.callThrough();
  spyOn(testFormatter, 'printStatement').and.callThrough();

  const renderer = new Renderer(host, testFormatter, fs, logger, bundle);

  return {
    renderer,
    testFormatter,
    decorationAnalyses,
    switchMarkerAnalyses,
    privateDeclarationsAnalyses,
    bundle
  };
}

runInEachFileSystem(() => {
  describe('Renderer', () => {
    let _: typeof absoluteFrom;
    let TS_CONTENT: TestFile;
    let JS_CONTENT: TestFile;
    let COMPONENT_PROGRAM: TestFile;
    let NGMODULE_PROGRAM: TestFile;
    let JS_CONTENT_MAP: SourceMapConverter;
    let RENDERED_CONTENTS: string;
    let OUTPUT_PROGRAM_MAP: SourceMapConverter;
    let MERGED_OUTPUT_PROGRAM_MAP: SourceMapConverter;

    beforeEach(() => {
      _ = absoluteFrom;

      TS_CONTENT = {
        name: _('/node_modules/test-package/src/file.ts'),
        contents:
            `import {Directive} from '@angular/core';\n@Directive({selector: '[a]'})\nexport class A {\n  foo(x: number): number { return x; }\n}`
      };

      JS_CONTENT = {
        name: _('/node_modules/test-package/src/file.js'),
        contents:
            `import { Directive } from '@angular/core';\nexport class A {\n    foo(x) {\r\n        return x;\n    }\r\n}\nA.decorators = [\n    { type: Directive, args: [{ selector: '[a]' }] }\r\n];\n`
      };

      COMPONENT_PROGRAM = {
        name: _('/node_modules/test-package/src/component.js'),
        contents:
            `import { Component } from '@angular/core';\nexport class A {}\nA.decorators = [\n    { type: Component, args: [{ selector: 'a', template: '{{ person!.name }}' }] }\n];\n`
      };

      NGMODULE_PROGRAM = {
        name: _('/node_modules/test-package/src/ngmodule.js'),
        contents:
            `import { NgModule } from '@angular/core';\nexport class A {}\nA.decorators = [\n    { type: NgModule, args: [{}] }\n];\n`
      };

      const JS_CONTENT_MAPPINGS: SourceMapMappings = [
        [
          [0, 0, 0, 0], [7, 0, 0, 7], [9, 0, 0, 8], [18, 0, 0, 17], [20, 0, 0, 18], [26, 0, 0, 24],
          [41, 0, 0, 39], [42, 0, 0, 40]
        ],
        [[0, 0, 2, 0], [4, 0, 2, 13], [5, 0, 2, 14], [8, 0, 2, 0], [14, 0, 2, 13], [15, 0, 2, 14]],
        [[4, 0, 3, 2], [7, 0, 3, 5], [8, 0, 3, 6], [9, 0, 3, 15]],
        [
          [0, 0, 3, 27], [7, 0, 3, 34], [8, 0, 3, 35], [9, 0, 3, 36], [10, 0, 3, 37],
          [11, 0, 3, 38], [1, 0, 4, 1], [2, 0, 4, 1]
        ],
        [[0, 0, 2, 13], [1, 0, 2, 14]],
        [],
        [
          [2, 0, 1, 1], [11, 0, 1, 10], [12, 0, 1, 11], [14, 0, 1, 12], [3, 0, 2, 13],
          [4, 0, 2, 14], [5, 0, 4, 1]
        ],
        [
          [5, 0, 1, 20], [7, 0, 1, 22], [12, 0, 1, 27], [14, 0, 1, 28], [15, 0, 1, 29],
          [9, 0, 2, 13], [10, 0, 2, 14]
        ],
      ];

      JS_CONTENT_MAP = fromObject({
        'version': 3,
        'file': 'file.js',
        'sourceRoot': '',
        'sources': ['file.ts'],
        'sourcesContent': [TS_CONTENT.contents],
        'names': [],
        'mappings': encode(JS_CONTENT_MAPPINGS),
      });

      RENDERED_CONTENTS =
          `\n// ADD IMPORTS\n\n// ADD EXPORTS\r\n\n// ADD CONSTANTS\n\n// ADD ADJACENT STATEMENTS\n\n// ADD DEFINITIONS\n\n// REMOVE DECORATORS\n` +
          JS_CONTENT.contents;

      OUTPUT_PROGRAM_MAP = fromObject({
        'version': 3,
        'file': 'file.js',
        'sources': ['file.js'],
        'names': [],
        'mappings': encode([
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [[0, 0, 0, 0]],
          [[0, 0, 1, 0]],
          [[0, 0, 2, 0]],
          [[0, 0, 3, 0]],
          [[0, 0, 4, 0]],
          [[0, 0, 5, 0]],
          [[0, 0, 6, 0]],
          [[0, 0, 7, 0]],
          [[0, 0, 8, 0]]
        ]),
        'sourcesContent': [JS_CONTENT.contents],
      });

      MERGED_OUTPUT_PROGRAM_MAP = fromObject({
        'version': 3,
        'file': 'file.js',
        'sources': ['file.ts'],
        'names': [],
        'mappings': encode([
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [
            [0, 0, 0, 0], [7, 0, 0, 7], [9, 0, 0, 8], [18, 0, 0, 17], [20, 0, 0, 18],
            [26, 0, 0, 24], [41, 0, 0, 39], [42, 0, 0, 40]
          ],
          [
            [0, 0, 2, 0], [4, 0, 2, 13], [5, 0, 2, 14], [8, 0, 2, 0], [14, 0, 2, 13], [15, 0, 2, 14]
          ],
          [[0, 0, 2, 16], [4, 0, 3, 2], [7, 0, 3, 5], [8, 0, 3, 6], [9, 0, 3, 15]],
          [
            [0, 0, 3, 27], [7, 0, 3, 34], [8, 0, 3, 35], [9, 0, 3, 36], [10, 0, 3, 37],
            [11, 0, 3, 38], [1, 0, 4, 1], [2, 0, 4, 1]
          ],
          [[0, 0, 2, 13], [1, 0, 2, 14]],
          [[0, 0, 3, 3]],
          [
            [0, 0, 3, 5], [2, 0, 1, 1], [11, 0, 1, 10], [12, 0, 1, 11], [14, 0, 1, 12],
            [3, 0, 2, 13], [4, 0, 2, 14], [5, 0, 4, 1]
          ],
          [
            [0, 0, 4, 13], [5, 0, 1, 20], [7, 0, 1, 22], [12, 0, 1, 27], [14, 0, 1, 28],
            [15, 0, 1, 29], [9, 0, 2, 13], [10, 0, 2, 14]
          ],
          [[0, 0, 4, 2]],
          [],
          [
            [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2],
            [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 2, 2],
            [0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2],
            [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2], [0, 0, 3, 2],
            [0, 0, 4, 2], [0, 0, 4, 2], [0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 1, 2], [0, 0, 1, 2],
            [0, 0, 1, 2], [0, 0, 1, 2], [0, 0, 2, 2], [0, 0, 2, 2], [0, 0, 4, 2], [0, 0, 1, 2],
            [0, 0, 1, 2], [0, 0, 1, 2], [0, 0, 1, 2], [0, 0, 1, 2], [0, 0, 2, 2], [0, 0, 2, 2]
          ],
        ]),
        'sourcesContent': [TS_CONTENT.contents],
      });
    });

    describe('renderProgram()', () => {
      it('should render the modified contents; with an inline map file, if the original provided no map file.',
         () => {
           const {renderer, decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses} =
               createTestRenderer('test-package', [JS_CONTENT]);
           const [sourceFile, mapFile] = renderer.renderProgram(
               decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
           expect(sourceFile.path).toEqual(_('/node_modules/test-package/src/file.js'));
           expect(sourceFile.contents).toContain(RENDERED_CONTENTS);
           expect(fromSource(sourceFile.contents)!.toObject())
               .toEqual(OUTPUT_PROGRAM_MAP.toObject());
           expect(mapFile).toBeUndefined();
         });


      it('should render as JavaScript', () => {
        const {
          renderer,
          decorationAnalyses,
          switchMarkerAnalyses,
          privateDeclarationsAnalyses,
          testFormatter
        } = createTestRenderer('test-package', [COMPONENT_PROGRAM]);
        renderer.renderProgram(
            decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
        const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
        expect(addDefinitionsSpy.calls.first().args[2]).toEqual(`// TRANSPILED
A.ɵfac = function A_Factory(t) { return new (t || A)(); };
// TRANSPILED
A.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: A, selectors: [["a"]], decls: 1, vars: 1, template: function A_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵtext(0);
    } if (rf & 2) {
        ɵngcc0.ɵɵtextInterpolate(ctx.person.name);
    } }, encapsulation: 2 });`);

        const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
        expect(addAdjacentStatementsSpy.calls.first().args[2]).toEqual(`// TRANSPILED
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(A, [{
        type: Component,
        args: [{ selector: 'a', template: '{{ person!.name }}' }]
    }], null, null); })();`);
      });


      describe('calling RenderingFormatter methods', () => {
        it('should call addImports with the source code and info about the core Angular library.',
           () => {
             const {
               renderer,
               decorationAnalyses,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses,
               testFormatter
             } = createTestRenderer('test-package', [JS_CONTENT]);
             const result = renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             const addImportsSpy = testFormatter.addImports as jasmine.Spy;
             expect(addImportsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
             expect(addImportsSpy.calls.first().args[1]).toEqual([
               {specifier: '@angular/core', qualifier: jasmine.objectContaining({text: 'ɵngcc0'})}
             ]);
           });

        it('should call addDefinitions with the source code, the analyzed class and the rendered definitions.',
           () => {
             const {
               renderer,
               decorationAnalyses,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses,
               testFormatter
             } = createTestRenderer('test-package', [JS_CONTENT]);
             renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
             expect(addDefinitionsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
             expect(addDefinitionsSpy.calls.first().args[1]).toEqual(jasmine.objectContaining({
               name: 'A',
               decorators: [jasmine.objectContaining({name: 'Directive'})]
             }));
             expect(addDefinitionsSpy.calls.first().args[2]).toEqual(`// TRANSPILED
A.ɵfac = function A_Factory(t) { return new (t || A)(); };
// TRANSPILED
A.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: A, selectors: [["", "a", ""]] });`);
           });

        it('should call addAdjacentStatements with the source code, the analyzed class and the rendered statements',
           () => {
             const {
               renderer,
               decorationAnalyses,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses,
               testFormatter
             } = createTestRenderer('test-package', [JS_CONTENT]);
             renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
             expect(addAdjacentStatementsSpy.calls.first().args[0].toString())
                 .toEqual(RENDERED_CONTENTS);
             expect(addAdjacentStatementsSpy.calls.first().args[1])
                 .toEqual(jasmine.objectContaining(
                     {name: 'A', decorators: [jasmine.objectContaining({name: 'Directive'})]}));
             expect(addAdjacentStatementsSpy.calls.first().args[2]).toEqual(`// TRANSPILED
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(A, [{
        type: Directive,
        args: [{ selector: '[a]' }]
    }], null, null); })();`);
           });

        it('should call removeDecorators with the source code, a map of class decorators that have been analyzed',
           () => {
             const {
               renderer,
               decorationAnalyses,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses,
               testFormatter
             } = createTestRenderer('test-package', [JS_CONTENT]);
             renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             const removeDecoratorsSpy = testFormatter.removeDecorators as jasmine.Spy;
             expect(removeDecoratorsSpy.calls.first().args[0].toString())
                 .toEqual(RENDERED_CONTENTS);

             // Each map key is the TS node of the decorator container
             // Each map value is an array of TS nodes that are the decorators to remove
             const map = removeDecoratorsSpy.calls.first().args[1] as Map<ts.Node, ts.Node[]>;
             const keys = Array.from(map.keys());
             expect(keys.length).toEqual(1);
             expect(keys[0].getText())
                 .toEqual(`[\n    { type: Directive, args: [{ selector: '[a]' }] }\r\n]`);
             const values = Array.from(map.values());
             expect(values.length).toEqual(1);
             expect(values[0].length).toEqual(1);
             expect(values[0][0].getText())
                 .toEqual(`{ type: Directive, args: [{ selector: '[a]' }] }`);
           });

        it('should render definitions as static fields', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('test-package', [NGMODULE_PROGRAM]);
          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const definitions: string = addDefinitionsSpy.calls.first().args[2];
          expect(definitions).toContain('A.ɵmod = /*@__PURE__*/ ɵngcc0.ɵɵdefineNgModule(');
          expect(definitions).toContain('A.ɵinj = /*@__PURE__*/ ɵngcc0.ɵɵdefineInjector(');
        });

        it('should render adjacent statements', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('test-package', [NGMODULE_PROGRAM]);
          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const statements: string = addAdjacentStatementsSpy.calls.first().args[2];
          expect(statements).toContain('ɵsetClassMetadata(A');
        });

        it('should render directives using the inner class name if different from outer', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } =
              createTestRenderer(
                  'test-package', [{
                    name: _('/node_modules/test-package/src/file.js'),
                    contents: `
                      import { Directive } from '@angular/core';
                      var OuterClass = /** @class */ (function () {
                        function InnerClass() {}
                        return InnerClass;
                      }());
                      OuterClass.decorators = [{ type: Directive, args: [{ selector: '[test]' }]
                      export OuterClass;`
                  }],
                  undefined, undefined, /* isEs5 */ true);

          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const definitions = addDefinitionsSpy.calls.first().args[2];
          expect(definitions).toContain('InnerClass.ɵfac');
          expect(definitions).toContain('new (t || InnerClass)');
          expect(definitions).toContain('InnerClass.ɵdir');
          expect(definitions).toContain('type: InnerClass');

          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const statements = addAdjacentStatementsSpy.calls.first().args[2];
          expect(statements).toContain('ɵsetClassMetadata(InnerClass');
        });

        it('should render injectables using the inner class name if different from outer', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } =
              createTestRenderer(
                  'test-package', [{
                    name: _('/node_modules/test-package/src/file.js'),
                    contents: `
                      import { Injectable } from '@angular/core';
                      var OuterClass = /** @class */ (function () {
                        function InnerClass() {}
                        return InnerClass;
                      }());
                      OuterClass.decorators = [{ type: Injectable }]
                      export OuterClass;`
                  }],
                  undefined, undefined, /* isEs5 */ true);

          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const definitions = addDefinitionsSpy.calls.first().args[2];
          expect(definitions).toContain('InnerClass.ɵfac');
          expect(definitions).toContain('new (t || InnerClass)()');
          expect(definitions).toContain('InnerClass.ɵprov');
          expect(definitions).toContain('token: InnerClass');

          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const statements = addAdjacentStatementsSpy.calls.first().args[2];
          expect(statements).toContain('ɵsetClassMetadata(InnerClass');
        });

        it('should render ng-modules using the inner class name if different from outer', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } =
              createTestRenderer(
                  'test-package', [{
                    name: _('/node_modules/test-package/src/file.js'),
                    contents: `
                      import { NgModule, Directive } from '@angular/core';
                      var DirectiveClass = /** @class */ (function () {
                        function DirectiveClass() {}
                        return DirectiveClass;
                      }());
                      DirectiveClass.decorators = [{ type: Directive, args: [{selector: 'x'}] }];
                      var OuterClass = /** @class */ (function () {
                        function InnerClass() {}
                        return InnerClass;
                      }());
                      OuterClass.decorators = [{ type: NgModule, args: [{declarations: [DirectiveClass], exports: [DirectiveClass]}]
                      export OuterClass;`
                  }],
                  undefined, undefined, /* isEs5 */ true);

          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const definitions = addDefinitionsSpy.calls.all()[1].args[2];
          expect(definitions).toContain('InnerClass.ɵmod');
          expect(definitions).toContain('type: InnerClass');


          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const statements = addAdjacentStatementsSpy.calls.all()[1].args[2];
          expect(statements).toContain('ɵɵsetNgModuleScope(InnerClass');
          expect(statements).toContain('ɵsetClassMetadata(InnerClass');
        });

        it('should render pipes using the inner class name if different from outer', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } =
              createTestRenderer(
                  'test-package', [{
                    name: _('/node_modules/test-package/src/file.js'),
                    contents: `
                      import { Pipe } from '@angular/core';
                      var OuterClass = /** @class */ (function () {
                        function InnerClass() {}
                        return InnerClass;
                      }());
                      OuterClass.decorators = [{ type: Pipe, args: [{name: 'pipe'}]
                      export OuterClass;`
                  }],
                  undefined, undefined, /* isEs5 */ true);

          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const definitions = addDefinitionsSpy.calls.first().args[2];
          expect(definitions).toContain('InnerClass.ɵfac');
          expect(definitions).toContain('new (t || InnerClass)()');
          expect(definitions).toContain('InnerClass.ɵpipe');

          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const statements = addAdjacentStatementsSpy.calls.first().args[2];
          expect(statements).toContain('ɵsetClassMetadata(InnerClass');
        });

        it('should render classes without decorators if class fields are decorated', () => {
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('test-package', [{
                                   name: _('/node_modules/test-package/src/file.js'),
                                   contents: `
                  import { Directive, ViewChild } from '@angular/core';

                  export class UndecoratedBase { test = null; }

                  UndecoratedBase.propDecorators = {
                    test: [{
                      type: ViewChild,
                      args: ["test", {static: true}]
                    }],
                  };
                `
                                 }]);

          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          expect(addDefinitionsSpy.calls.first().args[2]).toEqual(`// TRANSPILED
UndecoratedBase.ɵfac = function UndecoratedBase_Factory(t) { return new (t || UndecoratedBase)(); };
// TRANSPILED
UndecoratedBase.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: UndecoratedBase, viewQuery: function UndecoratedBase_Query(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵviewQuery(_c0, 7);
    } if (rf & 2) {
        let _t;
        ɵngcc0.ɵɵqueryRefresh(_t = ɵngcc0.ɵɵloadQuery()) && (ctx.test = _t.first);
    } } });`);
        });

        it('should call renderImports after other abstract methods', () => {
          // This allows the other methods to add additional imports if necessary
          const {
            renderer,
            decorationAnalyses,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('test-package', [JS_CONTENT]);
          const addExportsSpy = testFormatter.addExports as jasmine.Spy;
          const addDefinitionsSpy = testFormatter.addDefinitions as jasmine.Spy;
          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          const addConstantsSpy = testFormatter.addConstants as jasmine.Spy;
          const addImportsSpy = testFormatter.addImports as jasmine.Spy;
          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
          expect(addExportsSpy).toHaveBeenCalledBefore(addImportsSpy);
          expect(addDefinitionsSpy).toHaveBeenCalledBefore(addImportsSpy);
          expect(addAdjacentStatementsSpy).toHaveBeenCalledBefore(addImportsSpy);
          expect(addConstantsSpy).toHaveBeenCalledBefore(addImportsSpy);
        });
      });

      describe('source map merging', () => {
        it('should merge any inline source map from the original file and write the output as an inline source map',
           () => {
             const sourceFiles: TestFile[] = [{
               name: JS_CONTENT.name,
               contents: JS_CONTENT.contents + '\n' + JS_CONTENT_MAP.toComment()
             }];
             const {
               decorationAnalyses,
               renderer,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses
             } = createTestRenderer('test-package', sourceFiles);
             const [sourceFile, mapFile] = renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             expect(sourceFile.path).toEqual(_('/node_modules/test-package/src/file.js'));
             expect(sourceFile.contents).toContain(RENDERED_CONTENTS);
             expect(fromSource(sourceFile.contents)!.toObject())
                 .toEqual(MERGED_OUTPUT_PROGRAM_MAP.toObject());
             expect(mapFile).toBeUndefined();
           });

        it('should merge any external source map from the original file and write the output to an external source map',
           () => {
             const sourceFiles: TestFile[] = [{
               name: JS_CONTENT.name,
               contents: JS_CONTENT.contents + '\n//# sourceMappingURL=file.js.map'
             }];
             const mappingFiles: TestFile[] =
                 [{name: _(JS_CONTENT.name + '.map'), contents: JS_CONTENT_MAP.toJSON()}];
             const {
               decorationAnalyses,
               renderer,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses
             } = createTestRenderer('test-package', sourceFiles, undefined, mappingFiles);
             const [sourceFile, mapFile] = renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             expect(sourceFile.path).toEqual(_('/node_modules/test-package/src/file.js'));
             expect(sourceFile.contents)
                 .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('file.js.map'));
             expect(mapFile.path).toEqual(_('/node_modules/test-package/src/file.js.map'));
             expect(JSON.parse(mapFile.contents) as any)
                 .toEqual(MERGED_OUTPUT_PROGRAM_MAP.toObject());
           });


        it('should render an internal source map for files whose original file does not have a source map',
           () => {
             const sourceFiles: TestFile[] = [JS_CONTENT];
             const {
               decorationAnalyses,
               renderer,
               switchMarkerAnalyses,
               privateDeclarationsAnalyses
             } = createTestRenderer('test-package', sourceFiles, undefined);
             const [sourceFile, mapFile] = renderer.renderProgram(
                 decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
             expect(sourceFile.path).toEqual(_('/node_modules/test-package/src/file.js'));
             expect(sourceFile.contents)
                 .toEqual(RENDERED_CONTENTS + '\n' + OUTPUT_PROGRAM_MAP.toComment());
             expect(mapFile).toBeUndefined();
           });
      });

      describe('@angular/core support', () => {
        it('should render relative imports in ESM bundles', () => {
          const CORE_FILE: TestFile = {
            name: _('/node_modules/test-package/src/core.js'),
            contents:
                `import { NgModule } from './ng_module';\nexport class MyModule {}\nMyModule.decorators = [\n    { type: NgModule, args: [] }\n];\n`
          };
          const R3_SYMBOLS_FILE: TestFile = {
            // r3_symbols in the file name indicates that this is the path to rewrite core imports
            // to
            name: _('/node_modules/test-package/src/r3_symbols.js'),
            contents: `export const NgModule = () => null;`
          };
          // The package name of `@angular/core` indicates that we are compiling the core library.
          const {
            decorationAnalyses,
            renderer,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('@angular/core', [CORE_FILE, R3_SYMBOLS_FILE]);
          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          expect(addAdjacentStatementsSpy.calls.first().args[2])
              .toContain(
                  `function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.setClassMetadata(`);
          const addImportsSpy = testFormatter.addImports as jasmine.Spy;
          expect(addImportsSpy.calls.first().args[1]).toEqual([
            {specifier: './r3_symbols', qualifier: jasmine.objectContaining({text: 'ɵngcc0'})}
          ]);
        });

        it('should render no imports in FESM bundles', () => {
          const CORE_FILE: TestFile = {
            name: _('/node_modules/test-package/src/core.js'),
            contents: `export const NgModule = () => null;
            export class MyModule {}\nMyModule.decorators = [\n    { type: NgModule, args: [] }\n];\n`
          };

          const {
            decorationAnalyses,
            renderer,
            switchMarkerAnalyses,
            privateDeclarationsAnalyses,
            testFormatter
          } = createTestRenderer('@angular/core', [CORE_FILE]);
          renderer.renderProgram(
              decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
          const addAdjacentStatementsSpy = testFormatter.addAdjacentStatements as jasmine.Spy;
          expect(addAdjacentStatementsSpy.calls.first().args[2])
              .toContain(
                  `function () { (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(`);
          const addImportsSpy = testFormatter.addImports as jasmine.Spy;
          expect(addImportsSpy.calls.first().args[1]).toEqual([]);
        });
      });
    });
  });
});
