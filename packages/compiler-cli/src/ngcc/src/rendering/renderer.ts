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
import {basename, dirname} from 'path';
import {SourceMapConsumer, SourceMapGenerator, RawSourceMap} from 'source-map';
import * as ts from 'typescript';

import {Decorator} from '../../../ngtsc/host';
import {ImportManager, translateStatement} from '../../../ngtsc/transform';
import {AnalyzedClass, AnalyzedFile} from '../analyzer';
import {IMPORT_PREFIX} from '../constants';
import {NgccReflectionHost} from '../host/ngcc_host';

interface SourceMapInfo {
  source: string;
  map: SourceMapConverter|null;
  isInline: boolean;
}

/**
 * The results of rendering an analyzed file.
 */
export interface RenderResult {
  /**
   * The file that has been rendered.
   */
  file: AnalyzedFile;
  /**
   * The rendered source file.
   */
  source: FileInfo;
  /**
   * The rendered source map file.
   */
  map: FileInfo|null;
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

/**
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export abstract class Renderer {
  constructor(protected host: NgccReflectionHost) {}

  /**
   * Render the source code and source-map for an Analyzed file.
   * @param file The analyzed file to render.
   * @param targetPath The absolute path where the rendered file will be written.
   */
  renderFile(file: AnalyzedFile, targetPath: string): RenderResult {
    const importManager = new ImportManager(false, IMPORT_PREFIX);
    const input = this.extractSourceMap(file.sourceFile);

    const outputText = new MagicString(input.source);
    const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();

    file.analyzedClasses.forEach(clazz => {
      const renderedDefinition = renderDefinitions(file.sourceFile, clazz, importManager);
      this.addDefinitions(outputText, clazz, renderedDefinition);
      this.trackDecorators(clazz.decorators, decoratorsToRemove);
    });

    this.addConstants(
        outputText, renderConstantPool(file.sourceFile, file.constantPool, importManager),
        file.sourceFile);

    this.addImports(outputText, importManager.getAllImports(file.sourceFile.fileName, null));
    // QUESTION: do we need to remove contructor param metadata and property decorators?
    this.removeDecorators(outputText, decoratorsToRemove);

    return this.renderSourceAndMap(file, input, outputText, targetPath);
  }

  protected abstract addConstants(output: MagicString, constants: string, file: ts.SourceFile):
      void;
  protected abstract addImports(output: MagicString, imports: {name: string, as: string}[]): void;
  protected abstract addDefinitions(
      output: MagicString, analyzedClass: AnalyzedClass, definitions: string): void;
  protected abstract removeDecorators(
      output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>): void;

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
      file: AnalyzedFile, input: SourceMapInfo, output: MagicString,
      outputPath: string): RenderResult {
    const outputMapPath = `${outputPath}.map`;
    const outputMap = output.generateMap({
      source: file.sourceFile.fileName,
      includeContent: true,
      // hires: true // TODO: This results in accurate but huge sourcemaps. Instead we should fix
      // the merge algorithm.
    });

    // we must set this after generation as magic string does "manipulation" on the path
    outputMap.file = outputPath;

    const mergedMap =
        mergeSourceMaps(input.map && input.map.toObject(), JSON.parse(outputMap.toString()));

    if (input.isInline) {
      return {
        file,
        source: {path: outputPath, contents: `${output.toString()}\n${mergedMap.toComment()}`},
        map: null
      };
    } else {
      return {
        file,
        source: {
          path: outputPath,
          contents: `${output.toString()}\n${generateMapFileComment(outputMapPath)}`
        },
        map: {path: outputMapPath, contents: mergedMap.toJSON()}
      };
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
    sourceFile: ts.SourceFile, analyzedClass: AnalyzedClass, imports: ImportManager): string {
  const printer = ts.createPrinter();
  const name = (analyzedClass.declaration as ts.NamedDeclaration).name !;
  const definitions =
      analyzedClass.compilation
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
