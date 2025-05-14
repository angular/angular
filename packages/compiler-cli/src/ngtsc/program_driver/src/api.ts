/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {AbsoluteFsPath} from '../../file_system';

export interface FileUpdate {
  /**
   * The source file text.
   */
  newText: string;

  /**
   * Represents the source file from the original program that is being updated. If the file update
   * targets a shim file then this is null, as shim files do not have an associated original file.
   */
  originalFile: ts.SourceFile | null;
}

export const NgOriginalFile: unique symbol = Symbol('NgOriginalFile');

/**
 * If an updated file has an associated original source file, then the original source file
 * is attached to the updated file using the `NgOriginalFile` symbol.
 */
export interface MaybeSourceFileWithOriginalFile extends ts.SourceFile {
  [NgOriginalFile]?: ts.SourceFile;
}

export interface ProgramDriver {
  /**
   * Whether this strategy supports modifying user files (inline modifications) in addition to
   * modifying type-checking shims.
   */
  readonly supportsInlineOperations: boolean;

  /**
   * Retrieve the latest version of the program, containing all the updates made thus far.
   */
  getProgram(): ts.Program;

  /**
   * Incorporate a set of changes to either augment or completely replace the type-checking code
   * included in the type-checking program.
   */
  updateFiles(contents: Map<AbsoluteFsPath, FileUpdate>, updateMode: UpdateMode): void;

  /**
   * Retrieve a string version for a given `ts.SourceFile`, which much change when the contents of
   * the file have changed.
   *
   * If this method is present, the compiler will use these versions in addition to object identity
   * for `ts.SourceFile`s to determine what's changed between two incremental programs. This is
   * valuable for some clients (such as the Language Service) that treat `ts.SourceFile`s as mutable
   * objects.
   */
  getSourceFileVersion?(sf: ts.SourceFile): string;
}

export enum UpdateMode {
  /**
   * A complete update creates a completely new overlay of type-checking code on top of the user's
   * original program, which doesn't include type-checking code from previous calls to
   * `updateFiles`.
   */
  Complete,

  /**
   * An incremental update changes the contents of some files in the type-checking program without
   * reverting any prior changes.
   */
  Incremental,
}
