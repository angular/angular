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

import {LanguageServiceAdapter} from './language_service_adapter';
import {isExternalTemplate} from './utils';

export class CompilerFactory {
  private readonly incrementalStrategy = new TrackedIncrementalBuildStrategy();
  private compiler: NgCompiler|null = null;
  private lastKnownProgram: ts.Program|null = null;

  constructor(
      private readonly adapter: LanguageServiceAdapter,
      private readonly programStrategy: TypeCheckingProgramStrategy,
  ) {}

  /**
   * Create a new instance of the Ivy compiler if the program has changed since
   * the last time the compiler was instantiated. If the program has not changed,
   * return the existing instance.
   * @param fileName override the template if this is an external template file
   * @param options angular compiler options
   */
  getOrCreateWithChangedFile(fileName: string, options: NgCompilerOptions): NgCompiler {
    const program = this.programStrategy.getProgram();
    if (!this.compiler || program !== this.lastKnownProgram) {
      this.compiler = new NgCompiler(
          this.adapter,  // like compiler host
          options,       // angular compiler options
          program,
          this.programStrategy,
          this.incrementalStrategy,
          true,  // enableTemplateTypeChecker
          this.lastKnownProgram,
          undefined,  // perfRecorder (use default)
      );
      this.lastKnownProgram = program;
    }
    if (isExternalTemplate(fileName)) {
      this.overrideTemplate(fileName, this.compiler);
    }
    return this.compiler;
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
