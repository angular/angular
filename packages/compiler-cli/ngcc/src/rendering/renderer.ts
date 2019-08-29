/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool, Expression, Statement, WrappedNodeExpr, WritePropExpr} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {NOOP_DEFAULT_IMPORT_RECORDER} from '../../../src/ngtsc/imports';
import {translateStatement, ImportManager} from '../../../src/ngtsc/translator';
import {CompiledClass, CompiledFile, DecorationAnalyses} from '../analysis/types';
import {PrivateDeclarationsAnalyses} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalysis} from '../analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../constants';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {Logger} from '../logging/logger';
import {FileToWrite, getImportRewriter, stripExtension} from './utils';
import {RenderingFormatter, RedundantDecoratorMap} from './rendering_formatter';
import {extractSourceMap, renderSourceAndMap} from './source_maps';

/**
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export class Renderer {
  constructor(
      private srcFormatter: RenderingFormatter, private fs: FileSystem, private logger: Logger,
      private bundle: EntryPointBundle) {}

  renderProgram(
      decorationAnalyses: DecorationAnalyses, switchMarkerAnalyses: SwitchMarkerAnalyses,
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses): FileToWrite[] {
    const renderedFiles: FileToWrite[] = [];

    // Transform the source files.
    this.bundle.src.program.getSourceFiles().forEach(sourceFile => {
      if (decorationAnalyses.has(sourceFile) || switchMarkerAnalyses.has(sourceFile) ||
          sourceFile === this.bundle.src.file) {
        const compiledFile = decorationAnalyses.get(sourceFile);
        const switchMarkerAnalysis = switchMarkerAnalyses.get(sourceFile);
        renderedFiles.push(...this.renderFile(
            sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses));
      }
    });

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
      privateDeclarationsAnalyses: PrivateDeclarationsAnalyses): FileToWrite[] {
    const isEntryPoint = sourceFile === this.bundle.src.file;
    const input = extractSourceMap(this.fs, this.logger, sourceFile);
    const outputText = new MagicString(input.source);

    if (switchMarkerAnalysis) {
      this.srcFormatter.rewriteSwitchableDeclarations(
          outputText, switchMarkerAnalysis.sourceFile, switchMarkerAnalysis.declarations);
    }

    const importManager = new ImportManager(
        getImportRewriter(
            this.bundle.src.r3SymbolsFile, this.bundle.isCore, this.bundle.isFlatCore),
        IMPORT_PREFIX);

    if (compiledFile) {
      // TODO: remove constructor param metadata and property decorators (we need info from the
      // handlers to do this)
      const decoratorsToRemove = this.computeDecoratorsToRemove(compiledFile.compiledClasses);
      this.srcFormatter.removeDecorators(outputText, decoratorsToRemove);

      compiledFile.compiledClasses.forEach(clazz => {
        const renderedDefinition = renderDefinitions(compiledFile.sourceFile, clazz, importManager);
        this.srcFormatter.addDefinitions(outputText, clazz, renderedDefinition);
      });

      this.srcFormatter.addConstants(
          outputText,
          renderConstantPool(compiledFile.sourceFile, compiledFile.constantPool, importManager),
          compiledFile.sourceFile);
    }

    // Add exports to the entry-point file
    if (isEntryPoint) {
      const entryPointBasePath = stripExtension(this.bundle.src.path);
      this.srcFormatter.addExports(
          outputText, entryPointBasePath, privateDeclarationsAnalyses, importManager, sourceFile);
    }

    if (isEntryPoint || compiledFile) {
      this.srcFormatter.addImports(
          outputText, importManager.getAllImports(sourceFile.fileName), sourceFile);
    }

    if (compiledFile || switchMarkerAnalysis || isEntryPoint) {
      return renderSourceAndMap(sourceFile, input, outputText);
    } else {
      return [];
    }
  }

  /**
   * From the given list of classes, computes a map of decorators that should be removed.
   * The decorators to remove are keyed by their container node, such that we can tell if
   * we should remove the entire decorator property.
   * @param classes The list of classes that may have decorators to remove.
   * @returns A map of decorators to remove, keyed by their container node.
   */
  private computeDecoratorsToRemove(classes: CompiledClass[]): RedundantDecoratorMap {
    const decoratorsToRemove = new RedundantDecoratorMap();
    classes.forEach(clazz => {
      if (clazz.decorators === null) {
        return;
      }

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
}

/**
 * Render the constant pool as source code for the given class.
 */
export function renderConstantPool(
    sourceFile: ts.SourceFile, constantPool: ConstantPool, imports: ImportManager): string {
  const printer = createPrinter();
  return constantPool.statements
      .map(stmt => translateStatement(stmt, imports, NOOP_DEFAULT_IMPORT_RECORDER))
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
  const printer = createPrinter();
  const name = compiledClass.declaration.name;
  const translate = (stmt: Statement) =>
      translateStatement(stmt, imports, NOOP_DEFAULT_IMPORT_RECORDER);
  const print = (stmt: Statement) =>
      printer.printNode(ts.EmitHint.Unspecified, translate(stmt), sourceFile);
  const statements: Statement[] =
      compiledClass.compilation.map(c => createAssignmentStatement(name, c.name, c.initializer));
  for (const c of compiledClass.compilation) {
    statements.push(...c.statements);
  }
  return statements.map(print).join('\n');
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

function createPrinter(): ts.Printer {
  return ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
}
