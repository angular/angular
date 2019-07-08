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
   */
  private sfMap: Map<string, ts.SourceFile>;

  constructor(sfMap: Map<string, ts.SourceFile>, private delegate: ts.CompilerHost) {
    this.sfMap = sfMap;

    if (delegate.getDirectories !== undefined) {
      this.getDirectories = (path: string) => delegate.getDirectories !(path);
    }
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    // Look in the cache for the source file.
    let sf: ts.SourceFile|undefined = this.sfMap.get(fileName);
    if (sf === undefined) {
      // There should be no cache misses, but just in case, delegate getSourceFile in the event of
      // a cache miss.
      sf = this.delegate.getSourceFile(
          fileName, languageVersion, onError, shouldCreateNewSourceFile);
      sf && this.sfMap.set(fileName, sf);
    } else {
      // TypeScript doesn't allow returning redirect source files. To avoid unforseen errors we
      // return the original source file instead of the redirect target.
      const redirectInfo = (sf as any).redirectInfo;
      if (redirectInfo !== undefined) {
        sf = redirectInfo.unredirected;
      }
    }
    return sf;
  }

  // The rest of the methods simply delegate to the underlying `ts.CompilerHost`.

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.delegate.getDefaultLibFileName(options);
  }

  writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles: ReadonlyArray<ts.SourceFile>|undefined): void {
    throw new Error(`TypeCheckProgramHost should never write files`);
  }

  getCurrentDirectory(): string { return this.delegate.getCurrentDirectory(); }

  getDirectories?: (path: string) => string[];

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean { return this.delegate.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.delegate.getNewLine(); }

  fileExists(fileName: string): boolean {
    return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
  }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }
}