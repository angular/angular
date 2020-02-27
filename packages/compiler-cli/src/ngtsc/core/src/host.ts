/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {FlatIndexGenerator, findFlatIndexEntryPoint} from '../../entry_point';
import {AbsoluteFsPath, absoluteFrom, absoluteFromSourceFile, resolve} from '../../file_system';
import {FactoryGenerator, FactoryTracker, SummaryGenerator, TypeCheckShimGenerator} from '../../shims';
import {PerFileShimGenerator, TopLevelShimGenerator} from '../../shims/api';
import {typeCheckFilePath} from '../../typecheck';
import {normalizeSeparators} from '../../util/src/path';
import {getRootDirs, isNonDeclarationTsPath} from '../../util/src/typescript';
import {ExtendedTsCompilerHost, NgCompilerOptions, UnifiedModulesHost} from '../api';



// A persistent source of bugs in CompilerHost delegation has been the addition by TS of new,
// optional methods on ts.CompilerHost. Since these methods are optional, it's not a type error that
// the delegating host doesn't implement or delegate them. This causes subtle runtime failures. No
// more. This infrastructure ensures that failing to delegate a method is a compile-time error.

/**
 * Represents the `ExtendedTsCompilerHost` interface, with a transformation applied that turns all
 * methods (even optional ones) into required fields (which may be `undefined`, if the method was
 * optional).
 */
export type RequiredCompilerHostDelegations = {
  [M in keyof Required<ExtendedTsCompilerHost>]: ExtendedTsCompilerHost[M];
};

/**
 * Delegates all methods of `ExtendedTsCompilerHost` to a delegate, with the exception of
 * `getSourceFile` and `fileExists` which are implemented in `NgCompilerHost`.
 *
 * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
 * generated for this class.
 */
export class DelegatingCompilerHost implements
    Omit<RequiredCompilerHostDelegations, 'getSourceFile'|'fileExists'> {
  constructor(protected delegate: ExtendedTsCompilerHost) {}

  private delegateMethod<M extends keyof ExtendedTsCompilerHost>(name: M):
      ExtendedTsCompilerHost[M] {
    return this.delegate[name] !== undefined ? (this.delegate[name] as any).bind(this.delegate) :
                                               undefined;
  }

  // Excluded are 'getSourceFile' and 'fileExists', which are actually implemented by NgCompilerHost
  // below.
  createHash = this.delegateMethod('createHash');
  directoryExists = this.delegateMethod('directoryExists');
  fileNameToModuleName = this.delegateMethod('fileNameToModuleName');
  getCancellationToken = this.delegateMethod('getCancellationToken');
  getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
  getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
  getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
  getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
  getDirectories = this.delegateMethod('getDirectories');
  getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
  getModifiedResourceFiles = this.delegateMethod('getModifiedResourceFiles');
  getNewLine = this.delegateMethod('getNewLine');
  getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
  getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
  readDirectory = this.delegateMethod('readDirectory');
  readFile = this.delegateMethod('readFile');
  readResource = this.delegateMethod('readResource');
  realpath = this.delegateMethod('realpath');
  resolveModuleNames = this.delegateMethod('resolveModuleNames');
  resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
  resourceNameToFileName = this.delegateMethod('resourceNameToFileName');
  trace = this.delegateMethod('trace');
  useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
  writeFile = this.delegateMethod('writeFile');
}

/**
 * A wrapper around `ts.CompilerHost` (plus any extension methods from `ExtendedTsCompilerHost`).
 *
 * In order for a consumer to include Angular compilation in their TypeScript compiler, the
 * `ts.Program` must be created with a host that adds Angular-specific files (e.g. factories,
 * summaries, the template type-checking file, etc) to the compilation. `NgCompilerHost` is the
 * host implementation which supports this.
 *
 * The interface implementations here ensure that `NgCompilerHost` fully delegates to
 * `ExtendedTsCompilerHost` methods whenever present.
 */
export class NgCompilerHost extends DelegatingCompilerHost implements
    RequiredCompilerHostDelegations,
    ExtendedTsCompilerHost {
  readonly factoryTracker: FactoryTracker|null = null;
  readonly entryPoint: AbsoluteFsPath|null = null;
  readonly diagnostics: ts.Diagnostic[];

  private _inputFiles: string[];
  readonly rootDirs: ReadonlyArray<AbsoluteFsPath>;
  readonly typeCheckFile: AbsoluteFsPath;
  readonly ignoreForEmit = new Set<ts.SourceFile>();

  /**
   * A map of shim file names to the `ts.SourceFile` for those shims.
   */
  private shimMap = new Map<AbsoluteFsPath, ts.SourceFile>();

  /**
   * Tracks which files have previously had shims generated for them.
   */
  private hasShims = new Set<ts.SourceFile>();

  constructor(
      delegate: ExtendedTsCompilerHost, inputFiles: ReadonlyArray<string>,
      rootDirs: ReadonlyArray<AbsoluteFsPath>, topLevelShimGenerators: TopLevelShimGenerator[],
      private perFileShimGenerators: PerFileShimGenerator[], entryPoint: AbsoluteFsPath|null,
      typeCheckFile: AbsoluteFsPath, factoryTracker: FactoryTracker|null,
      diagnostics: ts.Diagnostic[]) {
    super(delegate);

    this.factoryTracker = factoryTracker;
    this.entryPoint = entryPoint;
    this.typeCheckFile = typeCheckFile;
    this.diagnostics = diagnostics;
    this._inputFiles = [...inputFiles];
    this.rootDirs = rootDirs;

    // Prepopulate `shimMap` with the top-level shims, and add them to the program's `inputFiles`
    // explicitly.
    for (const generator of topLevelShimGenerators) {
      const shimSf = generator.makeTopLevelShim();
      this.shimMap.set(absoluteFromSourceFile(shimSf), shimSf);
      this._inputFiles.push(shimSf.fileName);

      // If the shim is not supposed to be emitted, add it to the ignore set.
      if (!generator.shouldEmit) {
        this.ignoreForEmit.add(shimSf);
      }
    }
  }

  /**
   * The augmented list of files which should be inputs to program creation.
   */
  get inputFiles(): ReadonlyArray<string> { return this._inputFiles; }

  /**
   * Create an `NgCompilerHost` from a delegate host, an array of input filenames, and the full set
   * of TypeScript and Angular compiler options.
   */
  static wrap(
      delegate: ts.CompilerHost, inputFiles: ReadonlyArray<string>,
      options: NgCompilerOptions): NgCompilerHost {
    // TODO(alxhub): remove the fallback to allowEmptyCodegenFiles after verifying that the rest of
    // our build tooling is no longer relying on it.
    const allowEmptyCodegenFiles = options.allowEmptyCodegenFiles || false;
    const shouldGenerateFactoryShims = options.generateNgFactoryShims !== undefined ?
        options.generateNgFactoryShims :
        allowEmptyCodegenFiles;

    const shouldGenerateSummaryShims = options.generateNgSummaryShims !== undefined ?
        options.generateNgSummaryShims :
        allowEmptyCodegenFiles;


    const topLevelShimGenerators: TopLevelShimGenerator[] = [];
    const perFileShimGenerators: PerFileShimGenerator[] = [];

    if (shouldGenerateSummaryShims) {
      // Summary generation.
      perFileShimGenerators.push(new SummaryGenerator());
    }

    let factoryTracker: FactoryTracker|null = null;
    if (shouldGenerateFactoryShims) {
      const factoryGenerator = new FactoryGenerator();
      perFileShimGenerators.push(factoryGenerator);

      factoryTracker = factoryGenerator;
    }

    const rootDirs = getRootDirs(delegate, options as ts.CompilerOptions);

    const typeCheckFile = typeCheckFilePath(rootDirs);
    topLevelShimGenerators.push(new TypeCheckShimGenerator(typeCheckFile));

    let diagnostics: ts.Diagnostic[] = [];

    let entryPoint: AbsoluteFsPath|null = null;
    if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
      let normalizedInputFiles = inputFiles.map(n => resolve(n));
      entryPoint = findFlatIndexEntryPoint(normalizedInputFiles);
      if (entryPoint === null) {
        // This error message talks specifically about having a single .ts file in "files". However
        // the actual logic is a bit more permissive. If a single file exists, that will be taken,
        // otherwise the highest level (shortest path) "index.ts" file will be used as the flat
        // module entry point instead. If neither of these conditions apply, the error below is
        // given.
        //
        // The user is not informed about the "index.ts" option as this behavior is deprecated -
        // an explicit entrypoint should always be specified.
        diagnostics.push({
          category: ts.DiagnosticCategory.Error,
          code: ngErrorCode(ErrorCode.CONFIG_FLAT_MODULE_NO_INDEX),
          file: undefined,
          start: undefined,
          length: undefined,
          messageText:
              'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.',
        });
      } else {
        const flatModuleId = options.flatModuleId || null;
        const flatModuleOutFile = normalizeSeparators(options.flatModuleOutFile);
        const flatIndexGenerator =
            new FlatIndexGenerator(entryPoint, flatModuleOutFile, flatModuleId);
        topLevelShimGenerators.push(flatIndexGenerator);
      }
    }

    return new NgCompilerHost(
        delegate, inputFiles, rootDirs, topLevelShimGenerators, perFileShimGenerators, entryPoint,
        typeCheckFile, factoryTracker, diagnostics);
  }

  /**
   * Check whether the given `ts.SourceFile` is a shim file.
   *
   * If this returns false, the file is user-provided.
   */
  isShim(sf: ts.SourceFile): boolean { return this.shimMap.has(absoluteFromSourceFile(sf)); }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    // Is this a previously known shim?
    const absoluteFsPath = resolve(fileName);
    if (this.shimMap.has(absoluteFsPath)) {
      return this.shimMap.get(absoluteFsPath) !;
    }

    const sf =
        this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (sf === undefined) {
      return undefined;
    }

    // Only generate shims if:
    // 1) the file is not a .d.ts file
    // 2) there are shims to be generated
    // 3) the file has not previously had shims generated for it (that is, `getSourceFile` should be
    //    idempotent with respect to shim generation).
    if (castSf(sf) && !sf.isDeclarationFile && this.perFileShimGenerators.length > 0 &&
        !this.hasShims.has(sf)) {
      sf[OriginalReferencedFiles] = sf.referencedFiles;
      const referencedFiles = [...sf.referencedFiles];

      for (const generator of this.perFileShimGenerators) {
        const shimFileName =
            absoluteFrom(absoluteFsPath.replace(/\.tsx?$/, `.${generator.extensionPrefix}.ts`));
        const shimSf = generator.generateShimForFile(sf, shimFileName);

        this.shimMap.set(shimFileName, shimSf);
        referencedFiles.push({fileName: shimFileName, pos: 0, end: 0});

        if (!generator.shouldEmit) {
          this.ignoreForEmit.add(sf);
        }
      }

      sf.referencedFiles = referencedFiles;

      // Track this original file as having shims now, so they aren't generated again.
      this.hasShims.add(sf);
    }

    return sf;
  }

  restoreSf(sf: ts.SourceFile): void {
    if (sf.isDeclarationFile || !castSf(sf)) {
      return;
    }

    if (sf[OriginalReferencedFiles] !== undefined) {
      sf.referencedFiles = sf[OriginalReferencedFiles] as ts.FileReference[];
    }
  }

  fileExists(fileName: string): boolean {
    // Consider the file as existing whenever
    //  1) it really does exist in the delegate host, or
    //  2) at least one of the shim generators recognizes it
    // Note that we can pass the file name as branded absolute fs path because TypeScript
    // internally only passes POSIX-like paths.
    return this.delegate.fileExists(fileName) || this.shimMap.has(resolve(fileName));
  }

  get unifiedModulesHost(): UnifiedModulesHost|null {
    return this.fileNameToModuleName !== undefined ? this as UnifiedModulesHost : null;
  }
}

/**
 * Used to store the original value of `referencedFiles` on a `ts.SourceFile` for later restoration.
 */
const OriginalReferencedFiles = Symbol('OriginalReferencedFiles');

/**
 * Represents a `ts.SourceFile` with some extra type information for fields which the host patches
 * onto source file objects.
 */
interface SfWithReferencedFiles extends ts.SourceFile {
  /**
   * A copy of the original value of `referencedFiles`, before any shims were added.
   */
  [OriginalReferencedFiles]?: ReadonlyArray<ts.FileReference>;

  /**
   * Overrides the type of `referencedFiles` to be writeable.
   */
  referencedFiles: ts.FileReference[];
}

/**
 * Converts the type of `sf` to `SfWithReferencedFiles` (always succeeds).
 */
function castSf(sf: ts.SourceFile): sf is SfWithReferencedFiles {
  return true;
}
