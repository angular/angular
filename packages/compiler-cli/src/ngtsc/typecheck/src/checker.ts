/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {ReferenceEmitter} from '../../imports';
import {IncrementalBuild} from '../../incremental/api';
import {ReflectionHost} from '../../reflection';
import {isShim} from '../../shims';

import {TypeCheckingConfig, TypeCheckingProgramStrategy, UpdateMode} from './api';
import {FileTypeCheckingData, TypeCheckContext, TypeCheckRequest} from './context';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';

/**
 * Interface to trigger generation of type-checking code for a program given a new
 * `TypeCheckContext`.
 */
export interface ProgramTypeCheckAdapter {
  typeCheck(sf: ts.SourceFile, ctx: TypeCheckContext): void;
}

/**
 * Primary template type-checking engine, which performs type-checking using a
 * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
 * `ProgramTypeCheckAdapter` for generation of template type-checking code.
 */
export class TemplateTypeChecker {
  private files = new Map<AbsoluteFsPath, FileTypeCheckingData>();

  constructor(
      private originalProgram: ts.Program,
      private typeCheckingStrategy: TypeCheckingProgramStrategy,
      private typeCheckAdapter: ProgramTypeCheckAdapter, private config: TypeCheckingConfig,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost,
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
      private priorBuild: IncrementalBuild<unknown, FileTypeCheckingData>) {}

  /**
   * Reset the internal type-checking program by generating type-checking code from the user's
   * program.
   */
  refresh(): TypeCheckRequest {
    this.files.clear();

    const ctx =
        new TypeCheckContext(this.config, this.compilerHost, this.refEmitter, this.reflector);

    // Typecheck all the files.
    for (const sf of this.originalProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || isShim(sf)) {
        continue;
      }

      const previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
      if (previousResults === null) {
        // Previous results were not available, so generate new type-checking code for this file.
        this.typeCheckAdapter.typeCheck(sf, ctx);
      } else {
        // Previous results were available, and can be adopted into the current build.
        ctx.adoptPriorResults(sf, previousResults);
      }
    }

    const results = ctx.finalize();
    this.typeCheckingStrategy.updateFiles(results.updates, UpdateMode.Complete);
    for (const [file, fileData] of results.perFileData) {
      this.files.set(file, fileData);
    }

    return results;
  }

  /**
   * Retrieve type-checking diagnostics from the given `ts.SourceFile` using the most recent
   * type-checking program.
   */
  getDiagnosticsForFile(sf: ts.SourceFile): ts.Diagnostic[] {
    const path = absoluteFromSourceFile(sf);
    if (!this.files.has(path)) {
      return [];
    }
    const record = this.files.get(path)!;

    const typeCheckProgram = this.typeCheckingStrategy.getProgram();
    const typeCheckSf = getSourceFileOrError(typeCheckProgram, record.typeCheckFile);
    const rawDiagnostics = [];
    rawDiagnostics.push(...typeCheckProgram.getSemanticDiagnostics(typeCheckSf));
    if (record.hasInlines) {
      const inlineSf = getSourceFileOrError(typeCheckProgram, path);
      rawDiagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf));
    }

    return rawDiagnostics
        .map(diag => {
          if (!shouldReportDiagnostic(diag)) {
            return null;
          }
          return translateDiagnostic(diag, record.sourceResolver);
        })
        .filter((diag: ts.Diagnostic|null): diag is ts.Diagnostic => diag !== null)
        .concat(record.genesisDiagnostics);
  }
}
