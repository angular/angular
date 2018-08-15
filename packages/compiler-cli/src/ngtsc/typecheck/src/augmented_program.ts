/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {retagAllTsFiles, untagAllTsFiles} from '../../shims';
import {TypeCheckingProgramStrategy, UpdateMode} from '../api';

import {TypeCheckProgramHost} from './host';
import {TypeCheckShimGenerator} from './shim';

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

  private program: ts.Program = this.originalProgram;

  constructor(
      private originalProgram: ts.Program, private originalHost: ts.CompilerHost,
      private options: ts.CompilerOptions, private shimExtensionPrefixes: string[]) {}

  readonly supportsInlineOperations = true;

  getProgram(): ts.Program {
    return this.program;
  }

  updateFiles(contents: Map<AbsoluteFsPath, string>, updateMode: UpdateMode): void {
    if (contents.size === 0) {
      // No changes have been requested. Is it safe to skip updating entirely?
      // If UpdateMode is Incremental, then yes. If UpdateMode is Complete, then it's safe to skip
      // only if there are no active changes already (that would be cleared by the update).

      if (updateMode !== UpdateMode.Complete || this.sfMap.size === 0) {
        // No changes would be made to the `ts.Program` anyway, so it's safe to do nothing here.
        return;
      }
    }

    if (updateMode === UpdateMode.Complete) {
      this.sfMap.clear();
    }

    for (const [filePath, text] of contents.entries()) {
      this.sfMap.set(filePath, ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true));
    }

    const host = new TypeCheckProgramHost(
        this.sfMap, this.originalProgram, this.originalHost, this.shimExtensionPrefixes);
    const oldProgram = this.program;

    // Retag the old program's `ts.SourceFile`s with shim tags, to allow TypeScript to reuse the
    // most data.
    retagAllTsFiles(oldProgram);

    this.program = ts.createProgram({
      host,
      rootNames: this.program.getRootFileNames(),
      options: this.options,
      oldProgram,
    });
    host.postProgramCreationCleanup();

    // And untag them afterwards. We explicitly untag both programs here, because the oldProgram
    // may still be used for emit and needs to not contain tags.
    untagAllTsFiles(this.program);
    untagAllTsFiles(oldProgram);
  }

  shimPathForComponent(node: ts.ClassDeclaration): AbsoluteFsPath {
    return TypeCheckShimGenerator.shimFor(absoluteFromSourceFile(node.getSourceFile()));
  }
}
