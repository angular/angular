/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {CompileResult} from '../../../src/ngtsc/transform';
import {translateType, ImportManager} from '../../../src/ngtsc/translator';
import {DecorationAnalyses} from '../analysis/types';
import {ModuleWithProvidersInfo, ModuleWithProvidersAnalyses} from '../analysis/module_with_providers_analyzer';
import {PrivateDeclarationsAnalyses, ExportInfo} from '../analysis/private_declarations_analyzer';
import {IMPORT_PREFIX} from '../constants';
import {NgccReflectionHost} from '../host/ngcc_host';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {Logger} from '../logging/logger';
import {FileToWrite, getImportRewriter} from './utils';
import {RenderingFormatter} from './rendering_formatter';
import {extractSourceMap, renderSourceAndMap} from './source_maps';

/**
 * A structure that captures information about what needs to be rendered
 * in a typings file.
 *
 * It is created as a result of processing the analysis passed to the renderer.
 *
 * The `renderDtsFile()` method consumes it when rendering a typings file.
 */
class DtsRenderInfo {
  classInfo: DtsClassInfo[] = [];
  moduleWithProviders: ModuleWithProvidersInfo[] = [];
  privateExports: ExportInfo[] = [];
}


/**
 * Information about a class in a typings file.
 */
export interface DtsClassInfo {
  dtsDeclaration: ts.Declaration;
  compilation: CompileResult[];
}

/**
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export class DtsRenderer {
  constructor(
      private dtsFormatter: RenderingFormatter, private fs: FileSystem, private logger: Logger,
      private host: NgccReflectionHost, private bundle: EntryPointBundle) {}

  renderProgram(
      decorationAnalyses: DecorationAnalyses,
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses,
      moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|null): FileToWrite[] {
    const renderedFiles: FileToWrite[] = [];

    // Transform the .d.ts files
    if (this.bundle.dts) {
      const dtsFiles = this.getTypingsFilesToRender(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);

      // If the dts entry-point is not already there (it did not have compiled classes)
      // then add it now, to ensure it gets its extra exports rendered.
      if (!dtsFiles.has(this.bundle.dts.file)) {
        dtsFiles.set(this.bundle.dts.file, new DtsRenderInfo());
      }
      dtsFiles.forEach(
          (renderInfo, file) => renderedFiles.push(...this.renderDtsFile(file, renderInfo)));
    }

    return renderedFiles;
  }

  renderDtsFile(dtsFile: ts.SourceFile, renderInfo: DtsRenderInfo): FileToWrite[] {
    const input = extractSourceMap(this.fs, this.logger, dtsFile);
    const outputText = new MagicString(input.source);
    const printer = ts.createPrinter();
    const importManager = new ImportManager(
        getImportRewriter(this.bundle.dts !.r3SymbolsFile, this.bundle.isCore, false),
        IMPORT_PREFIX);

    renderInfo.classInfo.forEach(dtsClass => {
      const endOfClass = dtsClass.dtsDeclaration.getEnd();
      dtsClass.compilation.forEach(declaration => {
        const type = translateType(declaration.type, importManager);
        const typeStr = printer.printNode(ts.EmitHint.Unspecified, type, dtsFile);
        const newStatement = `    static ${declaration.name}: ${typeStr};\n`;
        outputText.appendRight(endOfClass - 1, newStatement);
      });
    });

    this.dtsFormatter.addModuleWithProvidersParams(
        outputText, renderInfo.moduleWithProviders, importManager);
    this.dtsFormatter.addExports(
        outputText, dtsFile.fileName, renderInfo.privateExports, importManager, dtsFile);
    this.dtsFormatter.addImports(
        outputText, importManager.getAllImports(dtsFile.fileName), dtsFile);



    return renderSourceAndMap(dtsFile, input, outputText);
  }

  private getTypingsFilesToRender(
      decorationAnalyses: DecorationAnalyses,
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses,
      moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|
      null): Map<ts.SourceFile, DtsRenderInfo> {
    const dtsMap = new Map<ts.SourceFile, DtsRenderInfo>();

    // Capture the rendering info from the decoration analyses
    decorationAnalyses.forEach(compiledFile => {
      compiledFile.compiledClasses.forEach(compiledClass => {
        const dtsDeclaration = this.host.getDtsDeclaration(compiledClass.declaration);
        if (dtsDeclaration) {
          const dtsFile = dtsDeclaration.getSourceFile();
          const renderInfo = dtsMap.has(dtsFile) ? dtsMap.get(dtsFile) ! : new DtsRenderInfo();
          renderInfo.classInfo.push({dtsDeclaration, compilation: compiledClass.compilation});
          dtsMap.set(dtsFile, renderInfo);
        }
      });
    });

    // Capture the ModuleWithProviders functions/methods that need updating
    if (moduleWithProvidersAnalyses !== null) {
      moduleWithProvidersAnalyses.forEach((moduleWithProvidersToFix, dtsFile) => {
        const renderInfo = dtsMap.has(dtsFile) ? dtsMap.get(dtsFile) ! : new DtsRenderInfo();
        renderInfo.moduleWithProviders = moduleWithProvidersToFix;
        dtsMap.set(dtsFile, renderInfo);
      });
    }

    // Capture the private declarations that need to be re-exported
    if (privateDeclarationsAnalyses.length) {
      privateDeclarationsAnalyses.forEach(e => {
        if (!e.dtsFrom && !e.alias) {
          throw new Error(
              `There is no typings path for ${e.identifier} in ${e.from}.\n` +
              `We need to add an export for this class to a .d.ts typings file because ` +
              `Angular compiler needs to be able to reference this class in compiled code, such as templates.\n` +
              `The simplest fix for this is to ensure that this class is exported from the package's entry-point.`);
        }
      });
      const dtsEntryPoint = this.bundle.dts !.file;
      const renderInfo =
          dtsMap.has(dtsEntryPoint) ? dtsMap.get(dtsEntryPoint) ! : new DtsRenderInfo();
      renderInfo.privateExports = privateDeclarationsAnalyses;
      dtsMap.set(dtsEntryPoint, renderInfo);
    }

    return dtsMap;
  }
}
