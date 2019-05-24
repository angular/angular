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

import {ivySwitchTransform} from '../ngtsc/switch';
import * as api from '../transformers/api';


/**
 * An implementation of the `Program` API which behaves similarly to plain `tsc`.
 *
 * The only Angular specific behavior included in this `Program` is the operation of the Ivy
 * switch to turn on render3 behavior.
 *
 * This allows `ngc` to behave like `tsc` in cases where JIT code needs to be tested.
 */
export class TscPassThroughProgram implements api.Program {
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

    const emitResult = emitCallback({
      program: this.tsProgram,
      host: this.host,
      options: this.options,
      emitOnlyDtsFiles: false,
      customTransformers: {before: [ivySwitchTransform]},
    });
    return emitResult;
  }
}

const defaultEmitCallback: api.TsEmitCallback =
    ({program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers}) =>
        program.emit(
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
