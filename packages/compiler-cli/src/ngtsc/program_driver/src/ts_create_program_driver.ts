/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {copyFileShimData, retagAllTsFiles, ShimReferenceTagger, untagAllTsFiles} from '../../shims';
import {RequiredDelegations, toUnredirectedSourceFile} from '../../util/src/typescript';

import {FileUpdate, MaybeSourceFileWithOriginalFile, NgOriginalFile, ProgramDriver, UpdateMode} from './api';

/**
 * Delegates all methods of `ts.CompilerHost` to a delegate, with the exception of
 * `getSourceFile`, `fileExists` and `writeFile` which are implemented in `TypeCheckProgramHost`.
 *
 * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
 * generated for this class.
 */
export class DelegatingCompilerHost implements
    Omit<RequiredDelegations<ts.CompilerHost>, 'getSourceFile'|'fileExists'|'writeFile'> {
  createHash;
  directoryExists;
  getCancellationToken;
  getCanonicalFileName;
  getCurrentDirectory;
  getDefaultLibFileName;
  getDefaultLibLocation;
  getDirectories;
  getEnvironmentVariable;
  getNewLine;
  getParsedCommandLine;
  getSourceFileByPath;
  readDirectory;
  readFile;
  realpath;
  resolveModuleNames;
  resolveTypeReferenceDirectives;
  trace;
  useCaseSensitiveFileNames;
  getModuleResolutionCache;
  hasInvalidatedResolutions;
  resolveModuleNameLiterals;
  resolveTypeReferenceDirectiveReferences;

  constructor(protected delegate: ts.CompilerHost) {
    // Excluded are 'getSourceFile', 'fileExists' and 'writeFile', which are actually implemented by
    // `TypeCheckProgramHost` below.

    this.createHash = this.delegateMethod('createHash');
    this.directoryExists = this.delegateMethod('directoryExists');
    this.getCancellationToken = this.delegateMethod('getCancellationToken');
    this.getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
    this.getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
    this.getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
    this.getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
    this.getDirectories = this.delegateMethod('getDirectories');
    this.getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
    this.getNewLine = this.delegateMethod('getNewLine');
    this.getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
    this.getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
    this.readDirectory = this.delegateMethod('readDirectory');
    this.readFile = this.delegateMethod('readFile');
    this.realpath = this.delegateMethod('realpath');
    this.resolveModuleNames = this.delegateMethod('resolveModuleNames');
    this.resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
    this.trace = this.delegateMethod('trace');
    this.useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
    this.getModuleResolutionCache = this.delegateMethod('getModuleResolutionCache');
    this.hasInvalidatedResolutions = this.delegateMethod('hasInvalidatedResolutions');
    // The following methods are required in TS 5.0+, but they don't exist in earlier versions.
    // TODO(crisbeto): remove the `ts-ignore` when dropping support for TypeScript 4.9.
    // @ts-ignore
    this.resolveModuleNameLiterals = this.delegateMethod('resolveModuleNameLiterals');
    this.resolveTypeReferenceDirectiveReferences =
        // @ts-ignore
        this.delegateMethod('resolveTypeReferenceDirectiveReferences');
  }

  private delegateMethod<M extends keyof ts.CompilerHost>(name: M): ts.CompilerHost[M] {
    return this.delegate[name] !== undefined ? (this.delegate[name] as any).bind(this.delegate) :
                                               undefined;
  }
}

/**
 * A `ts.CompilerHost` which augments source files.
 */
class UpdatedProgramHost extends DelegatingCompilerHost {
  /**
   * Map of source file names to `ts.SourceFile` instances.
   */
  private sfMap: Map<string, ts.SourceFile>;

  /**
   * The `ShimReferenceTagger` responsible for tagging `ts.SourceFile`s loaded via this host.
   *
   * The `UpdatedProgramHost` is used in the creation of a new `ts.Program`. Even though this new
   * program is based on a prior one, TypeScript will still start from the root files and enumerate
   * all source files to include in the new program.  This means that just like during the original
   * program's creation, these source files must be tagged with references to per-file shims in
   * order for those shims to be loaded, and then cleaned up afterwards. Thus the
   * `UpdatedProgramHost` has its own `ShimReferenceTagger` to perform this function.
   */
  private shimTagger: ShimReferenceTagger;

  constructor(
      sfMap: Map<string, ts.SourceFile>, private originalProgram: ts.Program,
      delegate: ts.CompilerHost, private shimExtensionPrefixes: string[]) {
    super(delegate);
    this.shimTagger = new ShimReferenceTagger(this.shimExtensionPrefixes);
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
    // TypeScript doesn't allow returning redirect source files. To avoid unforeseen errors we
    // return the original source file instead of the redirect target.
    sf = toUnredirectedSourceFile(sf);

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


/**
 * Updates a `ts.Program` instance with a new one that incorporates specific changes, using the
 * TypeScript compiler APIs for incremental program creation.
 */
export class TsCreateProgramDriver implements ProgramDriver {
  /**
   * A map of source file paths to replacement `ts.SourceFile`s for those paths.
   *
   * Effectively, this tracks the delta between the user's program (represented by the
   * `originalHost`) and the template type-checking program being managed.
   */
  private sfMap = new Map<string, ts.SourceFile>();

  private program: ts.Program;

  constructor(
      private originalProgram: ts.Program, private originalHost: ts.CompilerHost,
      private options: ts.CompilerOptions, private shimExtensionPrefixes: string[]) {
    this.program = this.originalProgram;
  }

  readonly supportsInlineOperations = true;

  getProgram(): ts.Program {
    return this.program;
  }

  updateFiles(contents: Map<AbsoluteFsPath, FileUpdate>, updateMode: UpdateMode): void {
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

    for (const [filePath, {newText, originalFile}] of contents.entries()) {
      const sf = ts.createSourceFile(filePath, newText, ts.ScriptTarget.Latest, true);
      if (originalFile !== null) {
        (sf as MaybeSourceFileWithOriginalFile)[NgOriginalFile] = originalFile;
      }
      this.sfMap.set(filePath, sf);
    }

    const host = new UpdatedProgramHost(
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
}
