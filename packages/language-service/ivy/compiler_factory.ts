/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {TrackedIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
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
    if (this.compiler === null || program !== this.lastKnownProgram) {
      this.compiler = new NgCompiler(
          this.adapter,  // like compiler host
          this.options,  // angular compiler options
          program,
          this.programStrategy,
          this.incrementalStrategy,
          true,  // enableTemplateTypeChecker
          this.lastKnownProgram,
          undefined,  // perfRecorder (use default)
      );
      this.lastKnownProgram = program;
    }
    return this.compiler;
  }

  /**
   * Create a new instance of the Ivy compiler if the program has changed since
   * the last time the compiler was instantiated. If the program has not changed,
   * return the existing instance.
   * @param fileName override the template if this is an external template file
   * @param options angular compiler options
   */
  getOrCreateWithChangedFile(fileName: string): NgCompiler {
    const compiler = this.getOrCreate();
    if (isExternalTemplate(fileName)) {
      this.overrideTemplate(fileName, compiler);
    }
    return compiler;
  }

  private overrideTemplate(fileName: string, compiler: NgCompiler) {
    if (!this.adapter.isTemplateDirty(fileName)) {
      return;
    }
    // 1. Get the latest snapshot
    const latestTemplate = this.adapter.readResource(fileName);
    // 2. Find all components that use the template
    const ttc = compiler.getTemplateTypeChecker();
    const components = compiler.getComponentsWithTemplateFile(fileName);
    // 3. Update component template
    for (const component of components) {
      if (ts.isClassDeclaration(component)) {
        ttc.overrideComponentTemplate(component, latestTemplate);
      }
    }
  }

  registerLastKnownProgram() {
    this.lastKnownProgram = this.programStrategy.getProgram();
  }
}
