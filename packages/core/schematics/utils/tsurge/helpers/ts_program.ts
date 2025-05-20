/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {ParsedConfiguration} from '@angular/compiler-cli/src/perform_compile';
import ts from 'typescript';
import {BaseProgramInfo} from '../program_info';

/** Options that are good defaults for Tsurge migrations. */
export const defaultMigrationTsOptions: Partial<ts.CompilerOptions> = {
  // Avoid checking libraries to speed up migrations.
  skipLibCheck: true,
  skipDefaultLibCheck: true,
  noEmit: true,
  // Does not apply to g3 and externally is enforced when the app is built by the compiler.
  disableTypeScriptVersionCheck: true,
};

/**
 * Creates an instance of a TypeScript program for the given project.
 */
export function createPlainTsProgram(
  tsHost: ts.CompilerHost,
  tsconfig: ParsedConfiguration,
  optionOverrides: NgCompilerOptions,
): BaseProgramInfo {
  const program = ts.createProgram({
    rootNames: tsconfig.rootNames,
    options: {
      ...tsconfig.options,
      ...defaultMigrationTsOptions,
      ...optionOverrides,
    },
  });

  return {
    ngCompiler: null,
    program,
    userOptions: tsconfig.options,
    __programAbsoluteRootFileNames: tsconfig.rootNames,
    host: tsHost,
  };
}
