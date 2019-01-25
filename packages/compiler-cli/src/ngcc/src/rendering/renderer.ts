/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool, Expression, Statement, WrappedNodeExpr, WritePropExpr} from '@angular/compiler';
import {SourceMapConverter, commentRegex, fromJSON, fromMapFileSource, fromObject, fromSource, generateMapFileComment, mapFileCommentRegex, removeComments, removeMapFileComments} from 'convert-source-map';
import {readFileSync, statSync} from 'fs';
import MagicString from 'magic-string';
import {basename, dirname, relative, resolve} from 'canonical-path';
import {SourceMapConsumer, SourceMapGenerator, RawSourceMap} from 'source-map';
import * as ts from 'typescript';

import {NoopImportRewriter, ImportRewriter, R3SymbolsImportRewriter} from '@angular/compiler-cli/src/ngtsc/imports';
import {CompileResult} from '@angular/compiler-cli/src/ngtsc/transform';
import {translateStatement, translateType, ImportManager} from '../../../ngtsc/translator';
import {NgccFlatImportRewriter} from './ngcc_import_rewriter';
import {CompiledClass, CompiledFile, DecorationAnalyses} from '../analysis/decoration_analyzer';
import {ModuleWithProvidersInfo, ModuleWithProvidersAnalyses} from '../analysis/module_with_providers_analyzer';
import {PrivateDeclarationsAnalyses, ExportInfo} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalysis} from '../analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../constants';
import {NgccReflectionHost, SwitchableVariableDeclaration} from '../host/ngcc_host';
import {EntryPointBundle} from '../packages/entry_point_bundle';

interface SourceMapInfo {
  source: string;
  map: SourceMapConverter|null;
  isInline: boolean;
}

/**
 * Information about a file that has been rendered.
 */
export interface FileInfo {
  /**
   * Path to where the file should be written.
   */
  path: string;
  /**
   * The contents of the file to be be written.
   */
  contents: string;
}

interface DtsClassInfo {
  dtsDeclaration: ts.Declaration;
  compilation: CompileResult[];
}

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
 * The collected decorators that have become redundant after the compilation
 * of Ivy static fields. The map is keyed by the container node, such that we
 * can tell if we should remove the entire decorator property
 */
export type RedundantDecoratorMap = Map<ts.Node, ts.Node[]>;
export const RedundantDecoratorMap = Map;

/**
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export abstract class Renderer {
  constructor(
      protected host: NgccReflectionHost, protected isCore: boolean,
      protected bundle: EntryPointBundle, protected sourcePath: string,
      protected targetPath: string) {}

  renderProgram(
      decorationAnalyses: DecorationAnalyses, switchMarkerAnalyses: SwitchMarkerAnalyses,
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses,
      moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|null): FileInfo[] {
    const renderedFiles: FileInfo[] = [];

    // Transform the source files.
    this.bundle.src.program.getSourceFiles().map(sourceFile => {
      const compiledFile = decorationAnalyses.get(sourceFile);
      const switchMarkerAnalysis = switchMarkerAnalyses.get(sourceFile);

      if (compiledFile || switchMarkerAnalysis || sourceFile === this.bundle.src.file) {
        renderedFiles.push(...this.renderFile(
            sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses));
      }
    });

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

  /**
   * Render the source code and source-map for an Analyzed file.
   * @param compiledFile The analyzed file to render.
   * @param targetPath The absolute path where the rendered file will be written.
   */
  renderFile(
      sourceFile: ts.SourceFile, compiledFile: CompiledFile|undefined,
      switchMarkerAnalysis: SwitchMarkerAnalysis|undefined,
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses): FileInfo[] {
    const input = this.extractSourceMap(sourceFile);
    const outputText = new MagicString(input.source);

    if (switchMarkerAnalysis) {
      this.rewriteSwitchableDeclarations(
          outputText, switchMarkerAnalysis.sourceFile, switchMarkerAnalysis.declarations);
    }

    if (compiledFile) {
      const importManager = new ImportManager(
          this.getImportRewriter(this.bundle.src.r3SymbolsFile, this.bundle.isFlat), IMPORT_PREFIX);

      // TODO: remove constructor param metadata and property decorators (we need info from the
      // handlers to do this)
      const decoratorsToRemove = this.computeDecoratorsToRemove(compiledFile.compiledClasses);
      this.removeDecorators(outputText, decoratorsToRemove);

      compiledFile.compiledClasses.forEach(clazz => {
        const renderedDefinition = renderDefinitions(compiledFile.sourceFile, clazz, importManager);
        this.addDefinitions(outputText, clazz, renderedDefinition);
      });

      this.addConstants(
          outputText,
          renderConstantPool(compiledFile.sourceFile, compiledFile.constantPool, importManager),
          compiledFile.sourceFile);

      this.addImports(outputText, importManager.getAllImports(compiledFile.sourceFile.fileName));
    }

    // Add exports to the entry-point file
    if (sourceFile === this.bundle.src.file) {
      const entryPointBasePath = stripExtension(this.bundle.src.path);
      this.addExports(outputText, entryPointBasePath, privateDeclarationsAnalyses);
    }

    return this.renderSourceAndMap(sourceFile, input, outputText);
  }

  renderDtsFile(dtsFile: ts.SourceFile, renderInfo: DtsRenderInfo): FileInfo[] {
    const input = this.extractSourceMap(dtsFile);
    const outputText = new MagicString(input.source);
    const printer = ts.createPrinter();
    const importManager = new ImportManager(
        this.getImportRewriter(this.bundle.dts !.r3SymbolsFile, false), IMPORT_PREFIX);

    renderInfo.classInfo.forEach(dtsClass => {
      const endOfClass = dtsClass.dtsDeclaration.getEnd();
      dtsClass.compilation.forEach(declaration => {
        const type = translateType(declaration.type, importManager);
        const typeStr = printer.printNode(ts.EmitHint.Unspecified, type, dtsFile);
        const newStatement = `    static ${declaration.name}: ${typeStr};\n`;
        outputText.appendRight(endOfClass - 1, newStatement);
      });
    });

    this.addModuleWithProvidersParams(outputText, renderInfo.moduleWithProviders, importManager);
    this.addImports(outputText, importManager.getAllImports(dtsFile.fileName));

    this.addExports(outputText, dtsFile.fileName, renderInfo.privateExports);


    return this.renderSourceAndMap(dtsFile, input, outputText);
  }

  /**
   * Add the type parameters to the appropriate functions that return `ModuleWithProviders`
   * structures.
   *
   * This function only gets called on typings files, so it doesn't need different implementations
   * for each bundle format.
   */
  protected addModuleWithProvidersParams(
      outputText: MagicString, moduleWithProviders: ModuleWithProvidersInfo[],
      importManager: ImportManager): void {
    moduleWithProviders.forEach(info => {
      const ngModuleName = (info.ngModule.node as ts.ClassDeclaration).name !.text;
      const declarationFile = info.declaration.getSourceFile().fileName;
      const ngModuleFile = info.ngModule.node.getSourceFile().fileName;
      const importPath = info.ngModule.viaModule ||
          (declarationFile !== ngModuleFile ?
               stripExtension(`./${relative(dirname(declarationFile), ngModuleFile)}`) :
               null);
      const ngModule = getImportString(importManager, importPath, ngModuleName);

      if (info.declaration.type) {
        const typeName = info.declaration.type && ts.isTypeReferenceNode(info.declaration.type) ?
            info.declaration.type.typeName :
            null;
        if (this.isCoreModuleWithProvidersType(typeName)) {
          // The declaration already returns `ModuleWithProvider` but it needs the `NgModule` type
          // parameter adding.
          outputText.overwrite(
              info.declaration.type.getStart(), info.declaration.type.getEnd(),
              `ModuleWithProviders<${ngModule}>`);
        } else {
          // The declaration returns an unknown type so we need to convert it to a union that
          // includes the ngModule property.
          const originalTypeString = info.declaration.type.getText();
          outputText.overwrite(
              info.declaration.type.getStart(), info.declaration.type.getEnd(),
              `(${originalTypeString})&{ngModule:${ngModule}}`);
        }
      } else {
        // The declaration has no return type so provide one.
        const lastToken = info.declaration.getLastToken();
        const insertPoint = lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken ?
            lastToken.getStart() :
            info.declaration.getEnd();
        outputText.appendLeft(
            insertPoint,
            `: ${getImportString(importManager, '@angular/core', 'ModuleWithProviders')}<${ngModule}>`);
      }
    });
  }

  protected abstract addConstants(output: MagicString, constants: string, file: ts.SourceFile):
      void;
  protected abstract addImports(output: MagicString, imports: {name: string, as: string}[]): void;
  protected abstract addExports(output: MagicString, entryPointBasePath: string, exports: {
    identifier: string,
    from: string
  }[]): void;
  protected abstract addDefinitions(
      output: MagicString, compiledClass: CompiledClass, definitions: string): void;
  protected abstract removeDecorators(
      output: MagicString, decoratorsToRemove: RedundantDecoratorMap): void;
  protected abstract rewriteSwitchableDeclarations(
      outputText: MagicString, sourceFile: ts.SourceFile,
      declarations: SwitchableVariableDeclaration[]): void;

  /**
   * From the given list of classes, computes a map of decorators that should be removed.
   * The decorators to remove are keyed by their container node, such that we can tell if
   * we should remove the entire decorator property.
   * @param classes The list of classes that may have decorators to remove.
   * @returns A map of decorators to remove, keyed by their container node.
   */
  protected computeDecoratorsToRemove(classes: CompiledClass[]): RedundantDecoratorMap {
    const decoratorsToRemove = new RedundantDecoratorMap();
    classes.forEach(clazz => {
      clazz.decorators.forEach(dec => {
        const decoratorArray = dec.node.parent !;
        if (!decoratorsToRemove.has(decoratorArray)) {
          decoratorsToRemove.set(decoratorArray, [dec.node]);
        } else {
          decoratorsToRemove.get(decoratorArray) !.push(dec.node);
        }
      });
    });
    return decoratorsToRemove;
  }

  /**
   * Get the map from the source (note whether it is inline or external)
   */
  protected extractSourceMap(file: ts.SourceFile): SourceMapInfo {
    const inline = commentRegex.test(file.text);
    const external = mapFileCommentRegex.test(file.text);

    if (inline) {
      const inlineSourceMap = fromSource(file.text);
      return {
        source: removeComments(file.text).replace(/\n\n$/, '\n'),
        map: inlineSourceMap,
        isInline: true,
      };
    } else if (external) {
      let externalSourceMap: SourceMapConverter|null = null;
      try {
        externalSourceMap = fromMapFileSource(file.text, dirname(file.fileName));
      } catch (e) {
        if (e.code === 'ENOENT') {
          console.warn(
              `The external map file specified in the source code comment "${e.path}" was not found on the file system.`);
          const mapPath = file.fileName + '.map';
          if (basename(e.path) !== basename(mapPath) && statSync(mapPath).isFile()) {
            console.warn(
                `Guessing the map file name from the source file name: "${basename(mapPath)}"`);
            try {
              externalSourceMap = fromObject(JSON.parse(readFileSync(mapPath, 'utf8')));
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
      return {
        source: removeMapFileComments(file.text).replace(/\n\n$/, '\n'),
        map: externalSourceMap,
        isInline: false,
      };
    } else {
      return {source: file.text, map: null, isInline: false};
    }
  }

  /**
   * Merge the input and output source-maps, replacing the source-map comment in the output file
   * with an appropriate source-map comment pointing to the merged source-map.
   */
  protected renderSourceAndMap(
      sourceFile: ts.SourceFile, input: SourceMapInfo, output: MagicString): FileInfo[] {
    const outputPath = resolve(this.targetPath, relative(this.sourcePath, sourceFile.fileName));
    const outputMapPath = `${outputPath}.map`;
    const outputMap = output.generateMap({
      source: sourceFile.fileName,
      includeContent: true,
      // hires: true // TODO: This results in accurate but huge sourcemaps. Instead we should fix
      // the merge algorithm.
    });

    // we must set this after generation as magic string does "manipulation" on the path
    outputMap.file = outputPath;

    const mergedMap =
        mergeSourceMaps(input.map && input.map.toObject(), JSON.parse(outputMap.toString()));

    const result: FileInfo[] = [];
    if (input.isInline) {
      result.push({path: outputPath, contents: `${output.toString()}\n${mergedMap.toComment()}`});
    } else {
      result.push({
        path: outputPath,
        contents: `${output.toString()}\n${generateMapFileComment(outputMapPath)}`
      });
      result.push({path: outputMapPath, contents: mergedMap.toJSON()});
    }
    return result;
  }

  protected getTypingsFilesToRender(
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
          const renderInfo = dtsMap.get(dtsFile) || new DtsRenderInfo();
          renderInfo.classInfo.push({dtsDeclaration, compilation: compiledClass.compilation});
          dtsMap.set(dtsFile, renderInfo);
        }
      });
    });

    // Capture the ModuleWithProviders functions/methods that need updating
    if (moduleWithProvidersAnalyses !== null) {
      moduleWithProvidersAnalyses.forEach((moduleWithProvidersToFix, dtsFile) => {
        const renderInfo = dtsMap.get(dtsFile) || new DtsRenderInfo();
        renderInfo.moduleWithProviders = moduleWithProvidersToFix;
        dtsMap.set(dtsFile, renderInfo);
      });
    }

    // Capture the private declarations that need to be re-exported
    if (privateDeclarationsAnalyses.length) {
      const dtsExports = privateDeclarationsAnalyses.map(e => {
        if (!e.dtsFrom) {
          throw new Error(
              `There is no typings path for ${e.identifier} in ${e.from}.\n` +
              `We need to add an export for this class to a .d.ts typings file because ` +
              `Angular compiler needs to be able to reference this class in compiled code, such as templates.\n` +
              `The simplest fix for this is to ensure that this class is exported from the package's entry-point.`);
        }
        return {identifier: e.identifier, from: e.dtsFrom};
      });
      const dtsEntryPoint = this.bundle.dts !.file;
      const renderInfo = dtsMap.get(dtsEntryPoint) || new DtsRenderInfo();
      renderInfo.privateExports = dtsExports;
      dtsMap.set(dtsEntryPoint, renderInfo);
    }

    return dtsMap;
  }

  /**
   * Check whether the given type is the core Angular `ModuleWithProviders` interface.
   * @param typeName The type to check.
   * @returns true if the type is the core Angular `ModuleWithProviders` interface.
   */
  private isCoreModuleWithProvidersType(typeName: ts.EntityName|null) {
    const id =
        typeName && ts.isIdentifier(typeName) ? this.host.getImportOfIdentifier(typeName) : null;
    return (
        id && id.name === 'ModuleWithProviders' && (this.isCore || id.from === '@angular/core'));
  }

  private getImportRewriter(r3SymbolsFile: ts.SourceFile|null, isFlat: boolean): ImportRewriter {
    if (this.isCore && isFlat) {
      return new NgccFlatImportRewriter();
    } else if (this.isCore) {
      return new R3SymbolsImportRewriter(r3SymbolsFile !.fileName);
    } else {
      return new NoopImportRewriter();
    }
  }
}

/**
 * Merge the two specified source-maps into a single source-map that hides the intermediate
 * source-map.
 * E.g. Consider these mappings:
 *
 * ```
 * OLD_SRC -> OLD_MAP -> INTERMEDIATE_SRC -> NEW_MAP -> NEW_SRC
 * ```
 *
 * this will be replaced with:
 *
 * ```
 * OLD_SRC -> MERGED_MAP -> NEW_SRC
 * ```
 */
export function mergeSourceMaps(
    oldMap: RawSourceMap | null, newMap: RawSourceMap): SourceMapConverter {
  if (!oldMap) {
    return fromObject(newMap);
  }
  const oldMapConsumer = new SourceMapConsumer(oldMap);
  const newMapConsumer = new SourceMapConsumer(newMap);
  const mergedMapGenerator = SourceMapGenerator.fromSourceMap(newMapConsumer);
  mergedMapGenerator.applySourceMap(oldMapConsumer);
  const merged = fromJSON(mergedMapGenerator.toString());
  return merged;
}

/**
 * Render the constant pool as source code for the given class.
 */
export function renderConstantPool(
    sourceFile: ts.SourceFile, constantPool: ConstantPool, imports: ImportManager): string {
  const printer = ts.createPrinter();
  return constantPool.statements.map(stmt => translateStatement(stmt, imports))
      .map(stmt => printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile))
      .join('\n');
}

/**
 * Render the definitions as source code for the given class.
 * @param sourceFile The file containing the class to process.
 * @param clazz The class whose definitions are to be rendered.
 * @param compilation The results of analyzing the class - this is used to generate the rendered
 * definitions.
 * @param imports An object that tracks the imports that are needed by the rendered definitions.
 */
export function renderDefinitions(
    sourceFile: ts.SourceFile, compiledClass: CompiledClass, imports: ImportManager): string {
  const printer = ts.createPrinter();
  const name = (compiledClass.declaration as ts.NamedDeclaration).name !;
  const definitions =
      compiledClass.compilation
          .map(
              c => c.statements.map(statement => translateStatement(statement, imports))
                       .concat(translateStatement(
                           createAssignmentStatement(name, c.name, c.initializer), imports))
                       .map(
                           statement =>
                               printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
                       .join('\n'))
          .join('\n');
  return definitions;
}

export function stripExtension(filePath: string): string {
  return filePath.replace(/\.(js|d\.ts)$/, '');
}

/**
 * Create an Angular AST statement node that contains the assignment of the
 * compiled decorator to be applied to the class.
 * @param analyzedClass The info about the class whose statement we want to create.
 */
function createAssignmentStatement(
    receiverName: ts.DeclarationName, propName: string, initializer: Expression): Statement {
  const receiver = new WrappedNodeExpr(receiverName);
  return new WritePropExpr(receiver, propName, initializer).toStmt();
}

function getImportString(
    importManager: ImportManager, importPath: string | null, importName: string) {
  const importAs = importPath ? importManager.generateNamedImport(importPath, importName) : null;
  return importAs ? `${importAs.moduleImport}.${importAs.symbol}` : `${importName}`;
}
