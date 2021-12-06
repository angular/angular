/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilationTicket, freshCompilationTicket, incrementalFromCompilerTicket, NgCompiler, resourceChangeTicket} from '@angular/compiler-cli/src/ngtsc/core';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {AbsoluteFsPath, resolve} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TrackedIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
import {ProgramDriver} from '@angular/compiler-cli/src/ngtsc/program_driver';

import {LanguageServiceAdapter} from './adapters';

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

  constructor(
      private readonly adapter: LanguageServiceAdapter,
      private readonly programStrategy: ProgramDriver,
      private readonly options: NgCompilerOptions,
  ) {}

  getOrCreate(): NgCompiler {
    const program = this.programStrategy.getProgram();
    const modifiedResourceFiles = new Set<AbsoluteFsPath>();
    for (const fileName of this.adapter.getModifiedResourceFiles() ?? []) {
      modifiedResourceFiles.add(resolve(fileName));
    }

    if (this.compiler !== null && program === this.compiler.getCurrentProgram()) {
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
    if (this.compiler === null) {
      ticket = freshCompilationTicket(
          program, this.options, this.incrementalStrategy, this.programStrategy,
          /* perfRecorder */ null, true, true);
    } else {
      ticket = incrementalFromCompilerTicket(
          this.compiler, program, this.incrementalStrategy, this.programStrategy,
          modifiedResourceFiles, /* perfRecorder */ null);
    }
    this.compiler = NgCompiler.fromTicket(ticket, this.adapter);
    return this.compiler;
  }
}
