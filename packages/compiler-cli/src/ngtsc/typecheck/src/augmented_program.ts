/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';

import {TypeCheckingProgramStrategy, UpdateMode} from './api';
import {TypeCheckProgramHost} from './host';

/**
 * Implements a template type-checking program using `ts.createProgram` and TypeScript's program
 * reuse functionality.
 */
export class ReusedProgramStrategy implements TypeCheckingProgramStrategy {
  /**
   * A map of source file paths to replacement `ts.SourceFile`s for those paths.
   *
   * Effectively, this tracks the delta between the user's program (represented by the
   * `originalHost`) and the template type-checking program being managed.
   */
  private sfMap = new Map<string, ts.SourceFile>();

  constructor(
      private program: ts.Program, private originalHost: ts.CompilerHost,
      private options: ts.CompilerOptions, private shimExtensionPrefixes: string[]) {}

  getProgram(): ts.Program {
    return this.program;
  }

  updateFiles(contents: Map<AbsoluteFsPath, string>, updateMode: UpdateMode): void {
    if (updateMode === UpdateMode.Complete) {
      this.sfMap.clear();
    }

    for (const [filePath, text] of contents.entries()) {
      this.sfMap.set(filePath, ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true));
    }

    const host =
        new TypeCheckProgramHost(this.sfMap, this.originalHost, this.shimExtensionPrefixes);
    this.program = ts.createProgram({
      host,
      rootNames: this.program.getRootFileNames(),
      options: this.options,
      oldProgram: this.program,
    });
    host.postProgramCreationCleanup();
  }
}
