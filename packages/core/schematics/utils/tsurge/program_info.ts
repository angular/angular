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
 * TypeScript program.
 */
export interface BaseProgramInfo {
  ngCompiler: NgCompiler | null;
  program: ts.Program;
  userOptions: NgCompilerOptions;
  host: Pick<ts.CompilerHost, 'getCanonicalFileName' | 'getCurrentDirectory'>;

  // Legacy field that shouldn't be used in the new migrations.
  __programAbsoluteRootFileNames: string[];
}

/**
 * Full program information for a TypeScript project.
 */
export interface ProgramInfo extends BaseProgramInfo {
  /**
   * All source files owned by this program / compilation unit.
   *
   * These are the files owned by the compilation unit and the migration
   * can make modifications to.
   *
   * *Note for 3P*: It intentionally might be that more files would technically be
   * part of this program, but aren't listed here. This can happen when Tsurge
   * detects an overlap of multiple programs (e.g. tsconfig.build and tsconfig.test)
   * and smartly coordinates which compilation unit should own the source file.
   */
  sourceFiles: ts.SourceFile[];

  /**
   * All source files in the program, including transitively loaded `.d.ts`.
   *
   * Use {@link sourceFiles} for a convenient way to finding source files that
   * can be migrated. This field is useful when full program analysis is performed.
   */
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
