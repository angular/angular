/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {TypeCheckContext} from './context';

/**
 * A `ts.CompilerHost` which augments source files with type checking code from a
 * `TypeCheckContext`.
 */
export class TypeCheckProgramHost implements ts.CompilerHost {
  /**
   * Map of source file names to `ts.SourceFile` instances.
   *
   * This is prepopulated with all the old source files, and updated as files are augmented.
   */
  private sfCache = new Map<string, ts.SourceFile>();

  /**
   * Tracks those files in `sfCache` which have been augmented with type checking information
   * already.
   */
  private augmentedSourceFiles = new Set<ts.SourceFile>();

  constructor(
      program: ts.Program, private delegate: ts.CompilerHost, private context: TypeCheckContext) {
    // The `TypeCheckContext` uses object identity for `ts.SourceFile`s to track which files need
    // type checking code inserted. Additionally, the operation of getting a source file should be
    // as efficient as possible. To support both of these requirements, all of the program's
    // source files are loaded into the cache up front.
    program.getSourceFiles().forEach(file => { this.sfCache.set(file.fileName, file); });
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    // Look in the cache for the source file.
    let sf: ts.SourceFile|undefined = this.sfCache.get(fileName);
    if (sf === undefined) {
      // There should be no cache misses, but just in case, delegate getSourceFile in the event of
      // a cache miss.
      sf = this.delegate.getSourceFile(
          fileName, languageVersion, onError, shouldCreateNewSourceFile);
      sf && this.sfCache.set(fileName, sf);
    }
    if (sf !== undefined) {
      // Maybe augment the file with type checking code via the `TypeCheckContext`.
      if (!this.augmentedSourceFiles.has(sf)) {
        sf = this.context.transform(sf);
        this.sfCache.set(fileName, sf);
        this.augmentedSourceFiles.add(sf);
      }
      return sf;
    } else {
      return undefined;
    }
  }

  // The rest of the methods simply delegate to the underlying `ts.CompilerHost`.

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.delegate.getDefaultLibFileName(options);
  }

  writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles: ReadonlyArray<ts.SourceFile>): void {
    return this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
  }

  getCurrentDirectory(): string { return this.delegate.getCurrentDirectory(); }

  getDirectories(path: string): string[] { return this.delegate.getDirectories(path); }

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean { return this.delegate.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.delegate.getNewLine(); }

  fileExists(fileName: string): boolean { return this.delegate.fileExists(fileName); }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }
}