/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import * as api from '../transformers/api';

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, SelectorScopeRegistry} from './annotations';
import {CompilerHost} from './compiler_host';
import {TypeScriptReflectionHost} from './metadata';
import {IvyCompilation, ivyTransformFactory} from './transform';

export class NgtscProgram implements api.Program {
  private tsProgram: ts.Program;

  constructor(
      rootNames: ReadonlyArray<string>, private options: api.CompilerOptions,
      private host: api.CompilerHost, oldProgram?: api.Program) {
    this.tsProgram =
        ts.createProgram(rootNames, options, host, oldProgram && oldProgram.getTsProgram());
  }

  getTsProgram(): ts.Program { return this.tsProgram; }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getOptionsDiagnostics(cancellationToken);
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  getTsSyntacticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
  }

  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken|
                             undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  getTsSemanticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
  }

  getNgSemanticDiagnostics(
      fileName?: string|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  loadNgStructureAsync(): Promise<void> { return Promise.resolve(); }

  listLazyRoutes(entryRoute?: string|undefined): api.LazyRoute[] {
    throw new Error('Method not implemented.');
  }

  getLibrarySummaries(): Map<string, api.LibrarySummary> {
    throw new Error('Method not implemented.');
  }

  getEmittedGeneratedFiles(): Map<string, GeneratedFile> {
    throw new Error('Method not implemented.');
  }

  getEmittedSourceFiles(): Map<string, ts.SourceFile> {
    throw new Error('Method not implemented.');
  }

  emit(opts?: {
    emitFlags?: api.EmitFlags,
    cancellationToken?: ts.CancellationToken,
    customTransformers?: api.CustomTransformers,
    emitCallback?: api.TsEmitCallback,
    mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback
  }): ts.EmitResult {
    const emitCallback = opts && opts.emitCallback || defaultEmitCallback;
    const mergeEmitResultsCallback = opts && opts.mergeEmitResultsCallback || mergeEmitResults;

    const checker = this.tsProgram.getTypeChecker();
    const isCore = isAngularCorePackage(this.tsProgram);
    const reflector = new TypeScriptReflectionHost(checker);
    const scopeRegistry = new SelectorScopeRegistry(checker, reflector);

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers = [
      new ComponentDecoratorHandler(checker, reflector, scopeRegistry, isCore),
      new DirectiveDecoratorHandler(checker, reflector, scopeRegistry, isCore),
      new InjectableDecoratorHandler(reflector, isCore),
      new NgModuleDecoratorHandler(checker, reflector, scopeRegistry, isCore),
      new PipeDecoratorHandler(reflector, isCore),
    ];

    const coreImportsFrom = isCore && getR3SymbolsFile(this.tsProgram) || null;

    const compilation = new IvyCompilation(handlers, checker, reflector, coreImportsFrom);

    // Analyze every source file in the program.
    this.tsProgram.getSourceFiles()
        .filter(file => !file.fileName.endsWith('.d.ts'))
        .forEach(file => compilation.analyze(file));

    // Since there is no .d.ts transformation API, .d.ts files are transformed during write.
    const writeFile: ts.WriteFileCallback =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError: ((message: string) => void) | undefined,
         sourceFiles: ReadonlyArray<ts.SourceFile>) => {
          if (fileName.endsWith('.d.ts')) {
            data = sourceFiles.reduce(
                (data, sf) => compilation.transformedDtsFor(sf.fileName, data, fileName), data);
          }
          this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        };


    // Run the emit, including a custom transformer that will downlevel the Ivy decorators in code.
    const emitResult = emitCallback({
      program: this.tsProgram,
      host: this.host,
      options: this.options,
      emitOnlyDtsFiles: false, writeFile,
      customTransformers: {
        before: [ivyTransformFactory(compilation, reflector, coreImportsFrom)],
      },
    });
    return emitResult;
  }
}

const defaultEmitCallback: api.TsEmitCallback =
    ({program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers}) =>
        program.emit(
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);

function mergeEmitResults(emitResults: ts.EmitResult[]): ts.EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = false;
  const emittedFiles: string[] = [];
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...(er.emittedFiles || []));
  }
  return {diagnostics, emitSkipped, emittedFiles};
}

/**
 * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
 */
function getR3SymbolsFile(program: ts.Program): ts.SourceFile|null {
  return program.getSourceFiles().find(file => file.fileName.indexOf('r3_symbols.ts') >= 0) || null;
}

/**
 * Determine if the given `Program` is @angular/core.
 */
function isAngularCorePackage(program: ts.Program): boolean {
  // Look for its_just_angular.ts somewhere in the program.
  const r3Symbols = getR3SymbolsFile(program);
  if (r3Symbols === null) {
    return false;
  }

  // Look for the constant ITS_JUST_ANGULAR in that file.
  return r3Symbols.statements.some(stmt => {
    // The statement must be a variable declaration statement.
    if (!ts.isVariableStatement(stmt)) {
      return false;
    }
    // It must be exported.
    if (stmt.modifiers === undefined ||
        !stmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return false;
    }
    // It must declare ITS_JUST_ANGULAR.
    return stmt.declarationList.declarations.some(decl => {
      // The declaration must match the name.
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'ITS_JUST_ANGULAR') {
        return false;
      }
      // It must initialize the variable to true.
      if (decl.initializer === undefined || decl.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
        return false;
      }
      // This definition matches.
      return true;
    });
  });
}
