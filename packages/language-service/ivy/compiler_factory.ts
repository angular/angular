/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilationTicket, freshCompilationTicket, incrementalFromCompilerTicket, NgCompiler, resourceChangeTicket} from '@angular/compiler-cli/src/ngtsc/core';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {TrackedIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
import {ActivePerfRecorder} from '@angular/compiler-cli/src/ngtsc/perf';
import {TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageServiceAdapter} from './adapters';
import {isExternalTemplate} from './utils';

/**
 * Manages the `NgCompiler` instance which backs the language service, updating or replacing it as
 * needed to produce an up-to-date understanding of the current program.
 *
 * TODO(alxhub): currently the options used for the compiler are specified at `CompilerFactory`
 * construction, and are not changable. In a real project, users can update `tsconfig.json`. We need
 * to properly handle a change in the compiler options, either by having an API to update the
 * `CompilerFactory` to use new options, or by replacing it entirely.
 */
export class CompilerFactory {
  private readonly incrementalStrategy = new TrackedIncrementalBuildStrategy();
  private compiler: NgCompiler|null = null;
  private lastKnownProgram: ts.Program|null = null;

  constructor(
      private readonly adapter: LanguageServiceAdapter,
      private readonly programStrategy: TypeCheckingProgramStrategy,
      private readonly options: NgCompilerOptions,
  ) {}

  getOrCreate(): NgCompiler {
    const program = this.programStrategy.getProgram();
    const modifiedResourceFiles = this.adapter.getModifiedResourceFiles() ?? new Set();

    if (this.compiler !== null && program === this.lastKnownProgram) {
      if (modifiedResourceFiles.size > 0) {
        // Only resource files have changed since the last NgCompiler was created.
        const ticket = resourceChangeTicket(this.compiler, modifiedResourceFiles);
        this.compiler = NgCompiler.fromTicket(ticket, this.adapter);
      } else {
        // The previous NgCompiler is being reused, but we still want to reset its performance
        // tracker to capture only the operations that are needed to service the current request.
        this.compiler.perfRecorder.reset();
      }

      return this.compiler;
    }

    let ticket: CompilationTicket;
    if (this.compiler === null || this.lastKnownProgram === null) {
      ticket = freshCompilationTicket(
          program, this.options, this.incrementalStrategy, this.programStrategy,
          /* perfRecorder */ null, true, true);
    } else {
      ticket = incrementalFromCompilerTicket(
          this.compiler, program, this.incrementalStrategy, this.programStrategy,
          modifiedResourceFiles, /* perfRecorder */ null);
    }
    this.compiler = NgCompiler.fromTicket(ticket, this.adapter);
    this.lastKnownProgram = program;
    return this.compiler;
  }

  registerLastKnownProgram() {
    this.lastKnownProgram = this.programStrategy.getProgram();
  }
}
