/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool, Expression, jsDocComment, LeadingComment, Statement, WrappedNodeExpr, WritePropExpr} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {ImportManager} from '../../../src/ngtsc/translator';
import {ParsedConfiguration} from '../../../src/perform_compile';
import {PrivateDeclarationsAnalyses} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalysis} from '../analysis/switch_marker_analyzer';
import {CompiledClass, CompiledFile, DecorationAnalyses} from '../analysis/types';
import {IMPORT_PREFIX} from '../constants';
import {NgccReflectionHost} from '../host/ngcc_host';
import {EntryPointBundle} from '../packages/entry_point_bundle';

import {RedundantDecoratorMap, RenderingFormatter} from './rendering_formatter';
import {renderSourceAndMap} from './source_maps';
import {FileToWrite, getImportRewriter, stripExtension} from './utils';

/**
 * A base-class for rendering an `AnalyzedFile`.
 *
 * Package formats have output files that must be rendered differently. Concrete sub-classes must
 * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
 */
export class Renderer {
  constructor(
      private host: NgccReflectionHost, private srcFormatter: RenderingFormatter,
      private fs: ReadonlyFileSystem, private logger: Logger, private bundle: EntryPointBundle,
      private tsConfig: ParsedConfiguration|null = null) {}

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
    const outputText = new MagicString(sourceFile.text);

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
        const renderedDefinition = this.renderDefinitions(
            compiledFile.sourceFile, clazz, importManager,
            !!this.tsConfig?.options.annotateForClosureCompiler);
        this.srcFormatter.addDefinitions(outputText, clazz, renderedDefinition);

        const renderedStatements =
            this.renderAdjacentStatements(compiledFile.sourceFile, clazz, importManager);
        this.srcFormatter.addAdjacentStatements(outputText, clazz, renderedStatements);
      });

      if (!isEntryPoint && compiledFile.reexports.length > 0) {
        this.srcFormatter.addDirectExports(
            outputText, compiledFile.reexports, importManager, compiledFile.sourceFile);
      }

      this.srcFormatter.addConstants(
          outputText,
          renderConstantPool(
              this.srcFormatter, compiledFile.sourceFile, compiledFile.constantPool, importManager),
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
      return renderSourceAndMap(this.logger, this.fs, sourceFile, outputText);
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
        if (dec.node === null) {
          return;
        }
        const decoratorArray = dec.node.parent!;
        if (!decoratorsToRemove.has(decoratorArray)) {
          decoratorsToRemove.set(decoratorArray, [dec.node]);
        } else {
          decoratorsToRemove.get(decoratorArray)!.push(dec.node);
        }
      });
    });
    return decoratorsToRemove;
  }

  /**
   * Render the definitions as source code for the given class.
   * @param sourceFile The file containing the class to process.
   * @param clazz The class whose definitions are to be rendered.
   * @param compilation The results of analyzing the class - this is used to generate the rendered
   * definitions.
   * @param imports An object that tracks the imports that are needed by the rendered definitions.
   */
  private renderDefinitions(
      sourceFile: ts.SourceFile, compiledClass: CompiledClass, imports: ImportManager,
      annotateForClosureCompiler: boolean): string {
    const name = this.host.getInternalNameOfClass(compiledClass.declaration);
    const leadingComment =
        annotateForClosureCompiler ? jsDocComment([{tagName: 'nocollapse'}]) : undefined;
    const statements: Statement[] = compiledClass.compilation.map(
        c => createAssignmentStatement(name, c.name, c.initializer, leadingComment));
    return this.renderStatements(sourceFile, statements, imports);
  }

  /**
   * Render the adjacent statements as source code for the given class.
   * @param sourceFile The file containing the class to process.
   * @param clazz The class whose statements are to be rendered.
   * @param compilation The results of analyzing the class - this is used to generate the rendered
   * definitions.
   * @param imports An object that tracks the imports that are needed by the rendered definitions.
   */
  private renderAdjacentStatements(
      sourceFile: ts.SourceFile, compiledClass: CompiledClass, imports: ImportManager): string {
    const statements: Statement[] = [];
    for (const c of compiledClass.compilation) {
      statements.push(...c.statements);
    }
    return this.renderStatements(sourceFile, statements, imports);
  }

  private renderStatements(
      sourceFile: ts.SourceFile, statements: Statement[], imports: ImportManager): string {
    const printStatement = (stmt: Statement) =>
        this.srcFormatter.printStatement(stmt, sourceFile, imports);
    return statements.map(printStatement).join('\n');
  }
}

/**
 * Render the constant pool as source code for the given class.
 */
export function renderConstantPool(
    formatter: RenderingFormatter, sourceFile: ts.SourceFile, constantPool: ConstantPool,
    imports: ImportManager): string {
  const printStatement = (stmt: Statement) => formatter.printStatement(stmt, sourceFile, imports);
  return constantPool.statements.map(printStatement).join('\n');
}

/**
 * Create an Angular AST statement node that contains the assignment of the
 * compiled decorator to be applied to the class.
 * @param analyzedClass The info about the class whose statement we want to create.
 */
function createAssignmentStatement(
    receiverName: ts.DeclarationName, propName: string, initializer: Expression,
    leadingComment?: LeadingComment): Statement {
  const receiver = new WrappedNodeExpr(receiverName);
  const statement =
      new WritePropExpr(
          receiver, propName, initializer, /* type */ undefined, /* sourceSpan */ undefined)
          .toStmt();
  if (leadingComment !== undefined) {
    statement.addLeadingComment(leadingComment);
  }
  return statement;
}
