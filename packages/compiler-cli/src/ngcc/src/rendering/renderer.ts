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

import {Decorator} from '../../../ngtsc/host';
import {CompileResult} from '@angular/compiler-cli/src/ngtsc/transform';
import {translateStatement, translateType} from '../../../ngtsc/translator';
import {NgccImportManager} from './ngcc_import_manager';
import {CompiledClass, CompiledFile, DecorationAnalyses} from '../analysis/decoration_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalysis} from '../analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../constants';
import {NgccReflectionHost, SwitchableVariableDeclaration} from '../host/ngcc_host';

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
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export abstract class Renderer {
  constructor(
      protected host: NgccReflectionHost, protected isCore: boolean,
      protected rewriteCoreImportsTo: ts.SourceFile|null, protected sourcePath: string,
      protected targetPath: string, protected transformDts: boolean) {}

  renderProgram(
      program: ts.Program, decorationAnalyses: DecorationAnalyses,
      switchMarkerAnalyses: SwitchMarkerAnalyses): FileInfo[] {
    const renderedFiles: FileInfo[] = [];

    // Transform the source files.
    program.getSourceFiles().map(sourceFile => {
      const compiledFile = decorationAnalyses.get(sourceFile);
      const switchMarkerAnalysis = switchMarkerAnalyses.get(sourceFile);

      if (compiledFile || switchMarkerAnalysis) {
        renderedFiles.push(...this.renderFile(sourceFile, compiledFile, switchMarkerAnalysis));
      }
    });

    if (this.transformDts) {
      // Transform the .d.ts files
      const dtsFiles = this.getTypingsFilesToRender(decorationAnalyses);
      dtsFiles.forEach((classes, file) => renderedFiles.push(...this.renderDtsFile(file, classes)));
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
      switchMarkerAnalysis: SwitchMarkerAnalysis|undefined): FileInfo[] {
    const input = this.extractSourceMap(sourceFile);
    const outputText = new MagicString(input.source);

    if (switchMarkerAnalysis) {
      this.rewriteSwitchableDeclarations(
          outputText, switchMarkerAnalysis.sourceFile, switchMarkerAnalysis.declarations);
    }

    if (compiledFile) {
      const importManager =
          new NgccImportManager(!this.rewriteCoreImportsTo, this.isCore, IMPORT_PREFIX);
      const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();

      compiledFile.compiledClasses.forEach(clazz => {
        const renderedDefinition = renderDefinitions(compiledFile.sourceFile, clazz, importManager);
        this.addDefinitions(outputText, clazz, renderedDefinition);
        this.trackDecorators(clazz.decorators, decoratorsToRemove);
      });

      this.addConstants(
          outputText,
          renderConstantPool(compiledFile.sourceFile, compiledFile.constantPool, importManager),
          compiledFile.sourceFile);

      this.addImports(
          outputText,
          importManager.getAllImports(compiledFile.sourceFile.fileName, this.rewriteCoreImportsTo));

      // TODO: remove contructor param metadata and property decorators (we need info from the
      // handlers to do this)
      this.removeDecorators(outputText, decoratorsToRemove);
    }

    return this.renderSourceAndMap(sourceFile, input, outputText);
  }

  renderDtsFile(dtsFile: ts.SourceFile, dtsClasses: DtsClassInfo[]): FileInfo[] {
    const input = this.extractSourceMap(dtsFile);
    const outputText = new MagicString(input.source);
    const importManager = new NgccImportManager(false, this.isCore, IMPORT_PREFIX);

    dtsClasses.forEach(dtsClass => {
      const endOfClass = dtsClass.dtsDeclaration.getEnd();
      dtsClass.compilation.forEach(declaration => {
        const type = translateType(declaration.type, importManager);
        const newStatement = `    static ${declaration.name}: ${type};\n`;
        outputText.appendRight(endOfClass - 1, newStatement);
      });
    });

    this.addImports(
        outputText, importManager.getAllImports(dtsFile.fileName, this.rewriteCoreImportsTo));

    return this.renderSourceAndMap(dtsFile, input, outputText);
  }

  protected abstract addConstants(output: MagicString, constants: string, file: ts.SourceFile):
      void;
  protected abstract addImports(output: MagicString, imports: {name: string, as: string}[]): void;
  protected abstract addDefinitions(
      output: MagicString, compiledClass: CompiledClass, definitions: string): void;
  protected abstract removeDecorators(
      output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>): void;
  protected abstract rewriteSwitchableDeclarations(
      outputText: MagicString, sourceFile: ts.SourceFile,
      declarations: SwitchableVariableDeclaration[]): void;

  /**
   * Add the decorator nodes that are to be removed to a map
   * So that we can tell if we should remove the entire decorator property
   */
  protected trackDecorators(decorators: Decorator[], decoratorsToRemove: Map<ts.Node, ts.Node[]>):
      void {
    decorators.forEach(dec => {
      const decoratorArray = dec.node.parent !;
      if (!decoratorsToRemove.has(decoratorArray)) {
        decoratorsToRemove.set(decoratorArray, [dec.node]);
      } else {
        decoratorsToRemove.get(decoratorArray) !.push(dec.node);
      }
    });
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

  protected getTypingsFilesToRender(analyses: DecorationAnalyses):
      Map<ts.SourceFile, DtsClassInfo[]> {
    const dtsMap = new Map<ts.SourceFile, DtsClassInfo[]>();
    analyses.forEach(compiledFile => {
      compiledFile.compiledClasses.forEach(compiledClass => {
        const dtsDeclaration = this.host.getDtsDeclarationOfClass(compiledClass.declaration);
        if (dtsDeclaration) {
          const dtsFile = dtsDeclaration.getSourceFile();
          const classes = dtsMap.get(dtsFile) || [];
          classes.push({dtsDeclaration, compilation: compiledClass.compilation});
          dtsMap.set(dtsFile, classes);
        }
      });
    });
    return dtsMap;
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
    sourceFile: ts.SourceFile, constantPool: ConstantPool, imports: NgccImportManager): string {
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
    sourceFile: ts.SourceFile, compiledClass: CompiledClass, imports: NgccImportManager): string {
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
