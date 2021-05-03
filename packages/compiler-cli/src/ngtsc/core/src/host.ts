/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {findFlatIndexEntryPoint, FlatIndexGenerator} from '../../entry_point';
import {AbsoluteFsPath, resolve} from '../../file_system';
import {FactoryGenerator, isShim, ShimAdapter, ShimReferenceTagger, SummaryGenerator} from '../../shims';
import {FactoryTracker, PerFileShimGenerator, TopLevelShimGenerator} from '../../shims/api';
import {TypeCheckShimGenerator} from '../../typecheck';
import {normalizeSeparators} from '../../util/src/path';
import {getRootDirs, isNonDeclarationTsPath, RequiredDelegations} from '../../util/src/typescript';
import {ExtendedTsCompilerHost, NgCompilerAdapter, NgCompilerOptions, UnifiedModulesHost} from '../api';

// A persistent source of bugs in CompilerHost delegation has been the addition by TS of new,
// optional methods on ts.CompilerHost. Since these methods are optional, it's not a type error that
// the delegating host doesn't implement or delegate them. This causes subtle runtime failures. No
// more. This infrastructure ensures that failing to delegate a method is a compile-time error.

/**
 * Delegates all methods of `ExtendedTsCompilerHost` to a delegate, with the exception of
 * `getSourceFile` and `fileExists` which are implemented in `NgCompilerHost`.
 *
 * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
 * generated for this class.
 */
export class DelegatingCompilerHost implements
    Omit<RequiredDelegations<ExtendedTsCompilerHost>, 'getSourceFile'|'fileExists'> {
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
  transformResource = this.delegateMethod('transformResource');
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
    RequiredDelegations<ExtendedTsCompilerHost>, ExtendedTsCompilerHost, NgCompilerAdapter {
  readonly factoryTracker: FactoryTracker|null = null;
  readonly entryPoint: AbsoluteFsPath|null = null;
  readonly constructionDiagnostics: ts.Diagnostic[];

  readonly inputFiles: ReadonlyArray<string>;
  readonly rootDirs: ReadonlyArray<AbsoluteFsPath>;


  constructor(
      delegate: ExtendedTsCompilerHost, inputFiles: ReadonlyArray<string>,
      rootDirs: ReadonlyArray<AbsoluteFsPath>, private shimAdapter: ShimAdapter,
      private shimTagger: ShimReferenceTagger, entryPoint: AbsoluteFsPath|null,
      factoryTracker: FactoryTracker|null, diagnostics: ts.Diagnostic[]) {
    super(delegate);

    this.factoryTracker = factoryTracker;
    this.entryPoint = entryPoint;
    this.constructionDiagnostics = diagnostics;
    this.inputFiles = [...inputFiles, ...shimAdapter.extraInputFiles];
    this.rootDirs = rootDirs;

    if (this.resolveModuleNames === undefined) {
      // In order to reuse the module resolution cache during the creation of the type-check
      // program, we'll need to provide `resolveModuleNames` if the delegate did not provide one.
      this.resolveModuleNames = this.createCachedResolveModuleNamesFunction();
    }
  }

  /**
   * Retrieves a set of `ts.SourceFile`s which should not be emitted as JS files.
   *
   * Available after this host is used to create a `ts.Program` (which causes all the files in the
   * program to be enumerated).
   */
  get ignoreForEmit(): Set<ts.SourceFile> {
    return this.shimAdapter.ignoreForEmit;
  }

  /**
   * Retrieve the array of shim extension prefixes for which shims were created for each original
   * file.
   */
  get shimExtensionPrefixes(): string[] {
    return this.shimAdapter.extensionPrefixes;
  }

  /**
   * Performs cleanup that needs to happen after a `ts.Program` has been created using this host.
   */
  postProgramCreationCleanup(): void {
    this.shimTagger.finalize();
  }

  /**
   * Create an `NgCompilerHost` from a delegate host, an array of input filenames, and the full set
   * of TypeScript and Angular compiler options.
   */
  static wrap(
      delegate: ts.CompilerHost, inputFiles: ReadonlyArray<string>, options: NgCompilerOptions,
      oldProgram: ts.Program|null): NgCompilerHost {
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

    perFileShimGenerators.push(new TypeCheckShimGenerator());

    let diagnostics: ts.Diagnostic[] = [];

    const normalizedTsInputFiles: AbsoluteFsPath[] = [];
    for (const inputFile of inputFiles) {
      if (!isNonDeclarationTsPath(inputFile)) {
        continue;
      }
      normalizedTsInputFiles.push(resolve(inputFile));
    }

    let entryPoint: AbsoluteFsPath|null = null;
    if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
      entryPoint = findFlatIndexEntryPoint(normalizedTsInputFiles);
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

    const shimAdapter = new ShimAdapter(
        delegate, normalizedTsInputFiles, topLevelShimGenerators, perFileShimGenerators,
        oldProgram);
    const shimTagger =
        new ShimReferenceTagger(perFileShimGenerators.map(gen => gen.extensionPrefix));
    return new NgCompilerHost(
        delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, factoryTracker,
        diagnostics);
  }

  /**
   * Check whether the given `ts.SourceFile` is a shim file.
   *
   * If this returns false, the file is user-provided.
   */
  isShim(sf: ts.SourceFile): boolean {
    return isShim(sf);
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    // Is this a previously known shim?
    const shimSf = this.shimAdapter.maybeGenerate(resolve(fileName));
    if (shimSf !== null) {
      // Yes, so return it.
      return shimSf;
    }

    // No, so it's a file which might need shims (or a file which doesn't exist).
    const sf =
        this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (sf === undefined) {
      return undefined;
    }

    this.shimTagger.tag(sf);
    return sf;
  }

  fileExists(fileName: string): boolean {
    // Consider the file as existing whenever
    //  1) it really does exist in the delegate host, or
    //  2) at least one of the shim generators recognizes it
    // Note that we can pass the file name as branded absolute fs path because TypeScript
    // internally only passes POSIX-like paths.
    //
    // Also note that the `maybeGenerate` check below checks for both `null` and `undefined`.
    return this.delegate.fileExists(fileName) ||
        this.shimAdapter.maybeGenerate(resolve(fileName)) != null;
  }

  get unifiedModulesHost(): UnifiedModulesHost|null {
    return this.fileNameToModuleName !== undefined ? this as UnifiedModulesHost : null;
  }

  private createCachedResolveModuleNamesFunction(): ts.CompilerHost['resolveModuleNames'] {
    const moduleResolutionCache = ts.createModuleResolutionCache(
        this.getCurrentDirectory(), this.getCanonicalFileName.bind(this));

    return (moduleNames, containingFile, reusedNames, redirectedReference, options) => {
      return moduleNames.map(moduleName => {
        const module = ts.resolveModuleName(
            moduleName, containingFile, options, this, moduleResolutionCache, redirectedReference);
        return module.resolvedModule;
      });
    };
  }
}
