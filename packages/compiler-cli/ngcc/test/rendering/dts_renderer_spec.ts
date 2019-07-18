/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {CompiledClass} from '../../src/analysis/types';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {ModuleWithProvidersAnalyzer, ModuleWithProvidersInfo} from '../../src/analysis/module_with_providers_analyzer';
import {PrivateDeclarationsAnalyzer, ExportInfo} from '../../src/analysis/private_declarations_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {RenderingFormatter, RedundantDecoratorMap} from '../../src/rendering/rendering_formatter';
import {DtsRenderer} from '../../src/rendering/dts_renderer';
import {MockLogger} from '../helpers/mock_logger';
import {makeTestEntryPointBundle, getRootFiles} from '../helpers/utils';

class TestRenderingFormatter implements RenderingFormatter {
  addImports(output: MagicString, imports: Import[], sf: ts.SourceFile) {
    output.prepend('\n// ADD IMPORTS\n');
  }
  addExports(output: MagicString, baseEntryPointPath: string, exports: ExportInfo[]) {
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
  addModuleWithProvidersParams(
      output: MagicString, moduleWithProviders: ModuleWithProvidersInfo[],
      importManager: ImportManager): void {
    output.prepend('\n// ADD MODUlE WITH PROVIDERS PARAMS\n');
  }
}

function createTestRenderer(
    packageName: string, files: TestFile[], dtsFiles?: TestFile[], mappingFiles?: TestFile[]) {
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
      'test-package', 'es2015', 'esm2015', isCore, getRootFiles(files),
      dtsFiles && getRootFiles(dtsFiles));
  const typeChecker = bundle.src.program.getTypeChecker();
  const host = new Esm2015ReflectionHost(logger, isCore, typeChecker, bundle.dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(fs, bundle, host, referencesRegistry).analyzeProgram();
  const moduleWithProvidersAnalyses =
      new ModuleWithProvidersAnalyzer(host, referencesRegistry).analyzeProgram(bundle.src.program);
  const privateDeclarationsAnalyses =
      new PrivateDeclarationsAnalyzer(host, referencesRegistry).analyzeProgram(bundle.src.program);
  const testFormatter = new TestRenderingFormatter();
  spyOn(testFormatter, 'addExports').and.callThrough();
  spyOn(testFormatter, 'addImports').and.callThrough();
  spyOn(testFormatter, 'addDefinitions').and.callThrough();
  spyOn(testFormatter, 'addConstants').and.callThrough();
  spyOn(testFormatter, 'removeDecorators').and.callThrough();
  spyOn(testFormatter, 'rewriteSwitchableDeclarations').and.callThrough();
  spyOn(testFormatter, 'addModuleWithProvidersParams').and.callThrough();

  const renderer = new DtsRenderer(testFormatter, fs, logger, host, bundle);

  return {renderer,
          testFormatter,
          decorationAnalyses,
          moduleWithProvidersAnalyses,
          privateDeclarationsAnalyses,
          bundle};
}

runInEachFileSystem(() => {
  describe('DtsRenderer', () => {
    let _: typeof absoluteFrom;
    let INPUT_PROGRAM: TestFile;
    let INPUT_DTS_PROGRAM: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;
      INPUT_PROGRAM = {
        name: _('/node_modules/test-package/src/file.js'),
        contents:
            `import { Directive } from '@angular/core';\nexport class A {\n    foo(x) {\n        return x;\n    }\n}\nA.decorators = [\n    { type: Directive, args: [{ selector: '[a]' }] }\n];\n`
      };
      INPUT_DTS_PROGRAM = {
        name: _('/typings/file.d.ts'),
        contents: `export declare class A {\nfoo(x: number): number;\n}\n`
      };
    });

    it('should render extract types into typings files', () => {
      const {renderer, decorationAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses} =
          createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);
      const result = renderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);

      const typingsFile = result.find(f => f.path === _('/typings/file.d.ts')) !;
      expect(typingsFile.contents)
          .toContain(
              'foo(x: number): number;\n    static ngDirectiveDef: ɵngcc0.ɵɵDirectiveDefWithMeta');
    });

    it('should render imports into typings files', () => {
      const {renderer, decorationAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses} =
          createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);
      const result = renderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);

      const typingsFile = result.find(f => f.path === _('/typings/file.d.ts')) !;
      expect(typingsFile.contents).toContain(`\n// ADD IMPORTS\n`);
    });

    it('should render exports into typings files', () => {
      const {renderer, decorationAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses} =
          createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);

      // Add a mock export to trigger export rendering
      privateDeclarationsAnalyses.push({
        identifier: 'ComponentB',
        from: _('/node_modules/test-package/src/file.js'),
        dtsFrom: _('/typings/b.d.ts')
      });

      const result = renderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);

      const typingsFile = result.find(f => f.path === _('/typings/file.d.ts')) !;
      expect(typingsFile.contents).toContain(`\n// ADD EXPORTS\n`);
    });

    it('should render ModuleWithProviders type params', () => {
      const {renderer, decorationAnalyses, privateDeclarationsAnalyses,
             moduleWithProvidersAnalyses} =
          createTestRenderer('test-package', [INPUT_PROGRAM], [INPUT_DTS_PROGRAM]);

      const result = renderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);

      const typingsFile = result.find(f => f.path === _('/typings/file.d.ts')) !;
      expect(typingsFile.contents).toContain(`\n// ADD MODUlE WITH PROVIDERS PARAMS\n`);
    });
  });
});
