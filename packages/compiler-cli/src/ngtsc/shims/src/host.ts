/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

export interface ShimGenerator {
  /**
   * Get the original source file for the given shim path, the contents of which determine the
   * contents of the shim file.
   *
   * If this returns `null` then the given file was not a shim file handled by this generator.
   */
  getOriginalSourceOfShim(fileName: string): string|null;

  /**
   * Generate a shim's `ts.SourceFile` for the given original file.
   */
  generate(original: ts.SourceFile, genFileName: string): ts.SourceFile;
}

/**
 * A wrapper around a `ts.CompilerHost` which supports generated files.
 */
export class GeneratedShimsHostWrapper implements ts.CompilerHost {
  constructor(private delegate: ts.CompilerHost, private shimGenerators: ShimGenerator[]) {
    if (delegate.resolveTypeReferenceDirectives) {
      // Backward compatibility with TypeScript 2.9 and older since return
      // type has changed from (ts.ResolvedTypeReferenceDirective | undefined)[]
      // to ts.ResolvedTypeReferenceDirective[] in Typescript 3.0
      type ts3ResolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          ts.ResolvedTypeReferenceDirective[];
      this.resolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          (delegate.resolveTypeReferenceDirectives as ts3ResolveTypeReferenceDirectives) !(
              names, containingFile);
    }
  }

  resolveTypeReferenceDirectives?:
      (names: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[];

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    const canonical = this.getCanonicalFileName(fileName);
    for (let i = 0; i < this.shimGenerators.length; i++) {
      const generator = this.shimGenerators[i];
      const originalFile = generator.getOriginalSourceOfShim(canonical);
      if (originalFile !== null) {
        // This shim generator has recognized the filename being requested, and is now responsible
        // for generating its contents, based on the contents of the original file it has requested.
        const originalSource = this.delegate.getSourceFile(
            originalFile, languageVersion, onError, shouldCreateNewSourceFile);
        if (originalSource === undefined) {
          // The original requested file doesn't exist, so the shim cannot exist either.
          return undefined;
        }
        return generator.generate(originalSource, fileName);
      }
    }
    return this.delegate.getSourceFile(
        fileName, languageVersion, onError, shouldCreateNewSourceFile);
  }

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

  fileExists(fileName: string): boolean {
    const canonical = this.getCanonicalFileName(fileName);
    // Consider the file as existing whenever 1) it really does exist in the delegate host, or
    // 2) at least one of the shim generators recognizes it.
    return this.delegate.fileExists(fileName) ||
        this.shimGenerators.some(gen => gen.getOriginalSourceOfShim(canonical) !== null);
  }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }
}
