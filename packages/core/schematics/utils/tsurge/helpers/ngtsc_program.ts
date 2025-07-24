/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {NgtscProgram} from '@angular/compiler-cli/src/ngtsc/program';
import {ParsedConfiguration} from '@angular/compiler-cli/src/perform_compile';
import ts from 'typescript';
import {BaseProgramInfo} from '../program_info';
import {defaultMigrationTsOptions} from './ts_program';

/**
 * Parses the configuration of the given TypeScript project and creates
 * an instance of the Angular compiler for the project.
 */
export function createNgtscProgram(
  tsHost: ts.CompilerHost,
  tsconfig: ParsedConfiguration,
  optionOverrides: NgCompilerOptions,
): BaseProgramInfo {
  const ngtscProgram = new NgtscProgram(
    tsconfig.rootNames,
    {
      ...tsconfig.options,
      ...defaultMigrationTsOptions,
      ...optionOverrides,
    },
    tsHost,
  );

  // Expose an easy way to debug-print ng semantic diagnostics.
  if (process.env['DEBUG_NG_SEMANTIC_DIAGNOSTICS'] === '1') {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(ngtscProgram.getNgSemanticDiagnostics(), tsHost),
    );
  }

  return {
    ngCompiler: ngtscProgram.compiler,
    program: ngtscProgram.getTsProgram(),
    userOptions: tsconfig.options,
    __programAbsoluteRootFileNames: tsconfig.rootNames,
    host: tsHost,
  };
}
