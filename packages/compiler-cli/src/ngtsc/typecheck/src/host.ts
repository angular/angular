/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {copyFileShimData, ShimReferenceTagger} from '../../shims';
import {RequiredDelegations} from '../../util/src/typescript';

/**
 * Delegates all methods of `ts.CompilerHost` to a delegate, with the exception of
 * `getSourceFile`, `fileExists` and `writeFile` which are implemented in `TypeCheckProgramHost`.
 *
 * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
 * generated for this class.
 */
export class DelegatingCompilerHost implements
    Omit<RequiredDelegations<ts.CompilerHost>, 'getSourceFile'|'fileExists'|'writeFile'> {
  constructor(protected delegate: ts.CompilerHost) {}

  private delegateMethod<M extends keyof ts.CompilerHost>(name: M): ts.CompilerHost[M] {
    return this.delegate[name] !== undefined ? (this.delegate[name] as any).bind(this.delegate) :
                                               undefined;
  }

  // Excluded are 'getSourceFile', 'fileExists' and 'writeFile', which are actually implemented by
  // `TypeCheckProgramHost` below.
  createHash = this.delegateMethod('createHash');
  directoryExists = this.delegateMethod('directoryExists');
  getCancellationToken = this.delegateMethod('getCancellationToken');
  getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
  getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
  getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
  getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
  getDirectories = this.delegateMethod('getDirectories');
  getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
  getNewLine = this.delegateMethod('getNewLine');
  getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
  getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
  readDirectory = this.delegateMethod('readDirectory');
  readFile = this.delegateMethod('readFile');
  realpath = this.delegateMethod('realpath');
  resolveModuleNames = this.delegateMethod('resolveModuleNames');
  resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
  trace = this.delegateMethod('trace');
  useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
}

/**
 * A `ts.CompilerHost` which augments source files with type checking code from a
 * `TypeCheckContext`.
 */
export class TypeCheckProgramHost extends DelegatingCompilerHost {
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

  constructor(
      sfMap: Map<string, ts.SourceFile>, private originalProgram: ts.Program,
      delegate: ts.CompilerHost, private shimExtensionPrefixes: string[]) {
    super(delegate);
    this.sfMap = sfMap;
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

  writeFile(): never {
    throw new Error(`TypeCheckProgramHost should never write files`);
  }

  fileExists(fileName: string): boolean {
    return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
  }
}
