/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath, resolve} from '../../file_system';
import {ShimAdapter, ShimReferenceTagger} from '../../shims';

import {TypeCheckContext} from './context';
import {TypeCheckShimGenerator} from './shim';



/**
 * A `ts.CompilerHost` which augments source files with type checking code from a
 * `TypeCheckContext`.
 */
export class TypeCheckProgramHost implements ts.CompilerHost {
  /**
   * Map of source file names to `ts.SourceFile` instances.
   */
  private sfMap: Map<string, ts.SourceFile>;

  // A special `ShimAdapter` is constructed to cause fresh type-checking shims to be generated for
  // every input file in the program.
  //
  // tsRootFiles is explicitly passed empty here. This is okay because at type-checking time, shim
  // root files have already been included in the ts.Program's root files by the `NgCompilerHost`'s
  // `ShimAdapter`.
  //
  // The oldProgram is also explicitly not passed here, even though one exists. This is because:
  // - ngfactory/ngsummary shims, if present, should be treated effectively as original files. As
  //   they are still marked as shims, they won't have a typecheck shim generated for them, but
  //   otherwise they should be reused as-is.
  // - ngtypecheck shims are always generated as fresh, and not reused.
  private shimAdapter = new ShimAdapter(
      this.delegate, /* tsRootFiles */[], [], [new TypeCheckShimGenerator()],
      /* oldProgram */ null);
  private shimTagger = new ShimReferenceTagger(this.shimExtensionPrefixes);

  readonly resolveModuleNames?: ts.CompilerHost['resolveModuleNames'];

  constructor(
      sfMap: Map<string, ts.SourceFile>, private delegate: ts.CompilerHost,
      private shimExtensionPrefixes: string[]) {
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
    // Look in the cache for the source file.
    let sf: ts.SourceFile;
    if (this.sfMap.has(fileName)) {
      sf = this.sfMap.get(fileName)!;
    } else {
      const sfShim = this.shimAdapter.maybeGenerate(absoluteFrom(fileName));

      if (sfShim === undefined) {
        return undefined;
      } else if (sfShim === null) {
        const maybeSf = this.delegate.getSourceFile(
            fileName, languageVersion, onError, shouldCreateNewSourceFile)!;
        if (maybeSf === undefined) {
          return undefined;
        }
        sf = maybeSf;
      } else {
        sf = sfShim;
      }
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