/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '../../../../compiler-cli/src/ngtsc/program';
import {NgCompilerOptions} from '../../../../compiler-cli/src/ngtsc/core/api';

import ts from 'typescript';

/**
 * Base information for a TypeScript project, including an instantiated
 * TypeScript program. Base information may be extended by user-overridden
 * migration preparation methods to extend the stages with more data.
 */
export interface BaseProgramInfo<T extends NgtscProgram | ts.Program> {
  program: T;
  userOptions: NgCompilerOptions;
  programAbsoluteRootPaths: string[];
  tsconfigAbsolutePath: string;
}

/**
 * Full program information for a TypeScript project. This is the default "extension"
 * of the {@link BaseProgramInfo} with additional commonly accessed information.
 *
 * A different interface may be used as full program information, configured via a
 * {@link TsurgeMigration.prepareProgram} override.
 */
export interface ProgramInfo<T extends NgtscProgram | ts.Program> extends BaseProgramInfo<T> {
  sourceFiles: ts.SourceFile[];
  fullProgramSourceFiles: ts.SourceFile[];
  projectDirAbsPath: string;
}
