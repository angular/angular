/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';

import ts from 'typescript';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';

/**
 * Base information for a TypeScript project, including an instantiated
 * TypeScript program. Base information may be extended by user-overridden
 * migration preparation methods to extend the stages with more data.
 */
export interface BaseProgramInfo {
  ngCompiler: NgCompiler | null;
  program: ts.Program;
  userOptions: NgCompilerOptions;
  programAbsoluteRootFileNames: string[];
  host: Pick<ts.CompilerHost, 'getCanonicalFileName' | 'getCurrentDirectory'>;
}

/**
 * Full program information for a TypeScript project. This is the default "extension"
 * of the {@link BaseProgramInfo} with additional commonly accessed information.
 *
 * A different interface may be used as full program information, configured via a
 * {@link TsurgeMigration.prepareProgram} override.
 */
export interface ProgramInfo extends BaseProgramInfo {
  sourceFiles: ts.SourceFile[];
  fullProgramSourceFiles: readonly ts.SourceFile[];
  /**
   * Root directories of the project.
   * Sorted longest first for easy lookups.
   */
  sortedRootDirs: AbsoluteFsPath[];

  /**
   * Primary root directory.
   * This is the shortest root directory, including all others.
   */
  projectRoot: AbsoluteFsPath;
}
