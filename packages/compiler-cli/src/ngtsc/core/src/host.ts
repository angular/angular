/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {findFlatIndexEntryPoint, FlatIndexGenerator} from '../../entry_point';
import {AbsoluteFsPath, resolve} from '../../file_system';
import {FactoryGenerator, FactoryTracker, ShimGenerator, SummaryGenerator, TypeCheckShimGenerator} from '../../shims';
import {typeCheckFilePath} from '../../typecheck';
import {normalizeSeparators} from '../../util/src/path';
import {getRootDirs} from '../../util/src/typescript';
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
    RequiredCompilerHostDelegations, ExtendedTsCompilerHost {
  readonly factoryTracker: FactoryTracker|null = null;
  readonly entryPoint: AbsoluteFsPath|null = null;
  readonly diagnostics: ts.Diagnostic[];

  readonly inputFiles: ReadonlyArray<string>;
  readonly rootDirs: ReadonlyArray<AbsoluteFsPath>;
  readonly typeCheckFile: AbsoluteFsPath;
  readonly factoryFiles: AbsoluteFsPath[];
  readonly summaryFiles: AbsoluteFsPath[];

  constructor(
      delegate: ExtendedTsCompilerHost, inputFiles: ReadonlyArray<string>,
      rootDirs: ReadonlyArray<AbsoluteFsPath>, private shims: ShimGenerator[],
      entryPoint: AbsoluteFsPath|null, typeCheckFile: AbsoluteFsPath,
      factoryFiles: AbsoluteFsPath[], summaryFiles: AbsoluteFsPath[],
      factoryTracker: FactoryTracker|null, diagnostics: ts.Diagnostic[]) {
    super(delegate);

    this.factoryTracker = factoryTracker;
    this.entryPoint = entryPoint;
    this.typeCheckFile = typeCheckFile;
    this.factoryFiles = factoryFiles;
    this.summaryFiles = summaryFiles;
    this.diagnostics = diagnostics;
    this.inputFiles = inputFiles;
    this.rootDirs = rootDirs;
  }

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

    let rootFiles = [...inputFiles];
    let normalizedInputFiles = inputFiles.map(n => resolve(n));

    const generators: ShimGenerator[] = [];
    let summaryGenerator: SummaryGenerator|null = null;
    let summaryFiles: AbsoluteFsPath[];

    if (shouldGenerateSummaryShims) {
      // Summary generation.
      summaryGenerator = SummaryGenerator.forRootFiles(normalizedInputFiles);
      generators.push(summaryGenerator);
      summaryFiles = summaryGenerator.getSummaryFileNames();
    } else {
      summaryFiles = [];
    }

    let factoryTracker: FactoryTracker|null = null;
    let factoryFiles: AbsoluteFsPath[];
    if (shouldGenerateFactoryShims) {
      // Factory generation.
      const factoryGenerator = FactoryGenerator.forRootFiles(normalizedInputFiles);
      const factoryFileMap = factoryGenerator.factoryFileMap;

      factoryFiles = Array.from(factoryFileMap.keys());
      rootFiles.push(...factoryFiles);
      generators.push(factoryGenerator);

      factoryTracker = new FactoryTracker(factoryGenerator);
    } else {
      factoryFiles = [];
    }

    // Done separately to preserve the order of factory files before summary files in rootFiles.
    // TODO(alxhub): validate that this is necessary.
    rootFiles.push(...summaryFiles);


    const rootDirs = getRootDirs(delegate, options as ts.CompilerOptions);

    const typeCheckFile = typeCheckFilePath(rootDirs);
    generators.push(new TypeCheckShimGenerator(typeCheckFile));
    rootFiles.push(typeCheckFile);

    let diagnostics: ts.Diagnostic[] = [];

    let entryPoint: AbsoluteFsPath|null = null;
    if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
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
        generators.push(flatIndexGenerator);
        rootFiles.push(flatIndexGenerator.flatIndexPath);
      }
    }

    return new NgCompilerHost(
        delegate, rootFiles, rootDirs, generators, entryPoint, typeCheckFile, factoryFiles,
        summaryFiles, factoryTracker, diagnostics);
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    for (let i = 0; i < this.shims.length; i++) {
      const generator = this.shims[i];
      // TypeScript internal paths are guaranteed to be POSIX-like absolute file paths.
      const absoluteFsPath = resolve(fileName);
      if (generator.recognize(absoluteFsPath)) {
        const readFile = (originalFile: string) => {
          return this.delegate.getSourceFile(
                     originalFile, languageVersion, onError, shouldCreateNewSourceFile) ||
              null;
        };

        return generator.generate(absoluteFsPath, readFile) || undefined;
      }
    }

    return this.delegate.getSourceFile(
        fileName, languageVersion, onError, shouldCreateNewSourceFile);
  }

  fileExists(fileName: string): boolean {
    // Consider the file as existing whenever
    //  1) it really does exist in the delegate host, or
    //  2) at least one of the shim generators recognizes it
    // Note that we can pass the file name as branded absolute fs path because TypeScript
    // internally only passes POSIX-like paths.
    return this.delegate.fileExists(fileName) ||
        this.shims.some(shim => shim.recognize(resolve(fileName)));
  }

  get unifiedModulesHost(): UnifiedModulesHost|null {
    return this.fileNameToModuleName !== undefined ? this as UnifiedModulesHost : null;
  }
}
