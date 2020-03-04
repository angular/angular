/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {ReferenceEmitter} from '../../imports';
import {ReflectionHost} from '../../reflection';

import {TypeCheckingConfig, TypeCheckingProgramStrategy, UpdateMode} from './api';
import {FileTypeCheckingData, TypeCheckContext} from './context';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';

/**
 * Interface to trigger generation of type-checking code for a program given a new
 * `TypeCheckContext`.
 */
export interface ProgramTypeCheckAdapter {
  typeCheck(ctx: TypeCheckContext): void;
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
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost) {}

  /**
   * Reset the internal type-checking program by generating type-checking code from the user's
   * program.
   */
  refresh(): void {
    this.files.clear();

    const ctx =
        new TypeCheckContext(this.config, this.originalProgram, this.refEmitter, this.reflector);

    // Typecheck all the files.
    this.typeCheckAdapter.typeCheck(ctx);

    const results = ctx.finalize();
    this.typeCheckingStrategy.updateFiles(results.updates, UpdateMode.Complete);
    for (const [file, fileData] of results.perFileData) {
      this.files.set(file, {...fileData});
    }
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
