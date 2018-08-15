/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {copyFileShimData, ShimReferenceTagger} from '../../shims';

/**
 * A `ts.CompilerHost` which augments source files with type checking code from a
 * `TypeCheckContext`.
 */
export class TypeCheckProgramHost implements ts.CompilerHost {
  /**
   * Map of source file names to `ts.SourceFile` instances.
   */
  private sfMap: Map<string, ts.SourceFile>;

  /**
   * The `ShimReferenceTagger` responsible for tagging `ts.SourceFile`s loaded via this host.
   *
   * The `TypeCheckProgramHost` is used in the creation of a new `ts.Program`. Even though this new
   * program is based on a prior one, TypeScript will still start from the root files and enumerate
   * all source files to include in the new program.  This means that just like during the original
   * program's creation, these source files must be tagged with references to per-file shims in
   * order for those shims to be loaded, and then cleaned up afterwards. Thus the
   * `TypeCheckProgramHost` has its own `ShimReferenceTagger` to perform this function.
   */
  private shimTagger = new ShimReferenceTagger(this.shimExtensionPrefixes);

  readonly resolveModuleNames?: ts.CompilerHost['resolveModuleNames'];

  constructor(
      sfMap: Map<string, ts.SourceFile>, private originalProgram: ts.Program,
      private delegate: ts.CompilerHost, private shimExtensionPrefixes: string[]) {
    this.sfMap = sfMap;

    if (delegate.getDirectories !== undefined) {
      this.getDirectories = (path: string) => delegate.getDirectories!(path);
    }

    if (delegate.resolveModuleNames !== undefined) {
      this.resolveModuleNames = delegate.resolveModuleNames;
    }
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    // Try to use the same `ts.SourceFile` as the original program, if possible. This guarantees
    // that program reuse will be as efficient as possible.
    let delegateSf: ts.SourceFile|undefined = this.originalProgram.getSourceFile(fileName);
    if (delegateSf === undefined) {
      // Something went wrong and a source file is being requested that's not in the original
      // program. Just in case, try to retrieve it from the delegate.
      delegateSf = this.delegate.getSourceFile(
          fileName, languageVersion, onError, shouldCreateNewSourceFile)!;
    }
    if (delegateSf === undefined) {
      return undefined;
    }

    // Look for replacements.
    let sf: ts.SourceFile;
    if (this.sfMap.has(fileName)) {
      sf = this.sfMap.get(fileName)!;
      copyFileShimData(delegateSf, sf);
    } else {
      sf = delegateSf;
    }
    // TypeScript doesn't allow returning redirect source files. To avoid unforseen errors we
    // return the original source file instead of the redirect target.
    const redirectInfo = (sf as any).redirectInfo;
    if (redirectInfo !== undefined) {
      sf = redirectInfo.unredirected;
    }

    this.shimTagger.tag(sf);
    return sf;
  }

  postProgramCreationCleanup(): void {
    this.shimTagger.finalize();
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

  getCurrentDirectory(): string {
    return this.delegate.getCurrentDirectory();
  }

  getDirectories?: (path: string) => string[];

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean {
    return this.delegate.useCaseSensitiveFileNames();
  }

  getNewLine(): string {
    return this.delegate.getNewLine();
  }

  fileExists(fileName: string): boolean {
    return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
  }

  readFile(fileName: string): string|undefined {
    return this.delegate.readFile(fileName);
  }
}
